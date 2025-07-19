import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { recordOrder, getProductById } from "@/lib/inventory"
import { OrderStatus, PaymentStatus, ShippingStatus } from "@/lib/types" // Import enums
import type { OrderItemEmailData, RecordOrderData } from "@/lib/types"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { sendVendorNotificationEmail } from "@/lib/email-vendor"

// Initialize Stripe client
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

export async function POST(request: NextRequest) {
  let requestBody: any = null
  try {
    requestBody = await request.json()
    const { sessionId, customerInfo } = requestBody
    console.log("STRIPE VERIFY SESSION: Received request for session:", sessionId)
    console.log("STRIPE VERIFY SESSION: Customer info received:", customerInfo)

    if (!sessionId) {
      console.error("❌ STRIPE VERIFY SESSION: No sessionId provided.")
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    console.log("STRIPE VERIFY SESSION: Retrieving Stripe session...")
    const session = await stripeClient.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent"], // Expand line items and payment intent
    })
    console.log("✅ STRIPE VERIFY SESSION: Stripe session retrieved successfully.")
    console.log("STRIPE VERIFY SESSION: Session status:", session.status)
    console.log("STRIPE VERIFY SESSION: Session metadata:", session.metadata)

    if (session.status !== "complete") {
      console.warn("STRIPE VERIFY SESSION: Session is not complete. Status:", session.status)
      return NextResponse.json({ error: "Stripe session not complete" }, { status: 400 })
    }

    // Retrieve and parse simplified cart items from session metadata
    const cartItemsJson = session.metadata?.cart_items_json
    let simplifiedCartItems: { id: string; qty: number; region: "UAE" | "UK" }[] = []
    if (cartItemsJson) {
      try {
        simplifiedCartItems = JSON.parse(cartItemsJson)
        console.log("STRIPE VERIFY SESSION: Parsed simplified cart items from metadata:", simplifiedCartItems)
      } catch (parseError) {
        console.error("❌ STRIPE VERIFY SESSION: Error parsing cart_items_json from metadata:", parseError)
        return NextResponse.json({ error: "Failed to parse cart items from metadata" }, { status: 400 })
      }
    }

    if (simplifiedCartItems.length === 0) {
      console.error(
        "❌ STRIPE VERIFY SESSION: No simplified cart items found in session metadata. Cannot process order.",
      )
      return NextResponse.json({ error: "No cart items found in session metadata" }, { status: 400 })
    }

    console.log("STRIPE VERIFY SESSION: Preparing items for processing (fetching full product details from DB)...")
    const itemsForProcessing: OrderItemEmailData[] = await Promise.all(
      simplifiedCartItems.map(async (item) => {
        const product = await getProductById(item.id) // Fetch full product details using getProductById
        if (!product) {
          console.error(`❌ STRIPE VERIFY SESSION: Product not found for ID: ${item.id}`)
          throw new Error(`Product ${item.id} not found in inventory.`)
        }
        const productDisplayName = product.name || item.id
        const unitPrice = item.region === "UAE" ? product.price_aed : product.price_gbp
        const currencyCode = item.region === "UAE" ? "AED" : "GBP"

        if (unitPrice === null || unitPrice === undefined) {
          console.error(
            `❌ STRIPE VERIFY SESSION: Price not found for product ID: ${item.id} in region: ${item.region}`,
          )
          throw new Error(`Price not found for product ${item.id}.`)
        }

        console.log(
          `STRIPE VERIFY SESSION: Processed item ${item.id}: Display Name: ${productDisplayName}, Quantity: ${item.qty}, Unit Price: ${unitPrice}, Currency: ${currencyCode}`,
        )
        return {
          product_id: item.id,
          product_display_name: productDisplayName,
          quantity: item.qty,
          unit_price: unitPrice,
          currency: currencyCode,
        }
      }),
    )
    console.log("STRIPE VERIFY SESSION: Items prepared:", itemsForProcessing)

    const customerName = session.customer_details?.name ?? customerInfo?.name ?? null
    const customerEmail = session.customer_details?.email || customerInfo?.email || ""
    const customerPhone = session.customer_details?.phone ?? customerInfo?.phone ?? null
    const shippingAddress = session.customer_details?.address
      ? `${session.customer_details.address.line1 || ""}${session.customer_details.address.line2 ? ", " + session.customer_details.address.line2 : ""}${session.customer_details.address.city ? ", " + session.customer_details.address.city : ""}${session.customer_details.address.state ? ", " + session.customer_details.address.state : ""}${session.customer_details.address.postal_code ? ", " + session.customer_details.address.postal_code : ""}${session.customer_details.address.country ? ", " + session.customer_details.address.country : ""}`
          .trim()
          .replace(/^, /, "")
      : (customerInfo?.address ?? null)

    const paymentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent as Stripe.PaymentIntent)?.id || session.id

    const totalAmount = (session.amount_total ?? 0) / 100
    const currency = (session.currency ?? "GBP").toUpperCase()

    const orderDataForRecord: RecordOrderData = {
      items: itemsForProcessing.map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
        price: item.unit_price,
      })),
      totalAmount: totalAmount,
      currency: currency,
      status: PaymentStatus.Completed, // Corrected: Use enum
      customerEmail: customerEmail,
      paymentIntentId: paymentId,
      customerName: customerName,
      shippingAddress: shippingAddress,
      phoneNumber: customerPhone,
      notes: `Stripe payment verified via /api/stripe/verify-session. Session ID: ${session.id}.`,
      orderType: "purchase",
      orderStatus: OrderStatus.Completed, // Corrected: Use enum
      shippingStatus: ShippingStatus.Paid, // Change from ShippingStatus.Shipped to ShippingStatus.Paid
    }

    console.log("STRIPE VERIFY SESSION: Order data prepared for recording:", orderDataForRecord)
    console.log("STRIPE VERIFY SESSION: Attempting to record order in DB...")
    const recordResult = await recordOrder(orderDataForRecord)
    const orderDbId = recordResult.orderId

    if (!recordResult.success || !orderDbId) {
      console.error("❌ STRIPE VERIFY SESSION: Failed to record order in DB:", recordResult.message)
      return NextResponse.json({ error: recordResult.message || "Failed to record order" }, { status: 500 })
    }

    console.log(`🎉 STRIPE VERIFY SESSION: Order recorded with ID: ${orderDbId}`)
    console.log("STRIPE VERIFY SESSION: Attempting to send customer email...")
    await sendOrderConfirmationEmail({
      customer_name: customerName,
      customer_email: customerEmail,
      order_id: orderDbId.toString(),
      items: itemsForProcessing,
      total_amount: totalAmount,
      currency: currency,
      payment_status: "Confirmed", // This is a string for the email template, not the enum
      shipping_status: "Paid", // This is a string for the email template, not the enum
    })
    console.log("✅ STRIPE VERIFY SESSION: Customer email sent successfully.")

    console.log("STRIPE VERIFY SESSION: Attempting to send vendor email...")
    await sendVendorNotificationEmail({
      order_id: orderDbId.toString(),
      customer_name: customerName,
      customer_email: customerEmail,
      phone_number: customerPhone,
      shipping_address: shippingAddress,
      total_amount: totalAmount,
      currency: currency,
      items: itemsForProcessing,
      payment_method: "Stripe",
      payment_id: paymentId,
    })
    console.log("✅ STRIPE VERIFY SESSION: Vendor email sent successfully.")

    console.log("🎉 STRIPE VERIFY SESSION: Stripe session verification and order processing completed successfully!")
    return NextResponse.json({
      success: true,
      orderId: orderDbId,
      message: "Stripe session verified and order processed!",
      orderData: {
        items: itemsForProcessing,
        customerInfo: {
          firstName: customerName?.split(" ")[0] || "",
          lastName: customerName?.split(" ")[1] || "",
          email: customerEmail,
          phone: customerPhone,
          address: shippingAddress,
          city: customerInfo?.city || "", // Use customerInfo for city
          country: customerInfo?.country || "", // Use customerInfo for country
          postalCode: customerInfo?.postalCode || "", // Use customerInfo for postalCode
          notes: orderDataForRecord.notes,
        },
        totalAmount: totalAmount,
        currency: currency,
        paymentMethod: "Stripe",
      },
    })
  } catch (error) {
    console.error("❌ STRIPE VERIFY SESSION: Error processing Stripe session:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Session verification failed" },
      { status: 500 },
    )
  }
}
