import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import type { CartItem, OrderItemEmailData } from "@/lib/types" // Import CartItem and OrderItemEmailData
import { sendOrderConfirmationEmail } from "@/lib/email" // Import from lib/email.ts
import { sendVendorNotificationEmail } from "@/lib/email-vendor" // Import the new vendor email utility
import { getProductDisplayName, recordOrder } from "@/lib/inventory" // Import from lib/inventory.ts

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { sessionId, customerInfo } = await request.json()
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }
    console.log("🔍 Verifying Stripe session:", sessionId)
    console.log("👤 Customer info received:", customerInfo)

    // Retrieve the session from Stripe
    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=line_items.data.price.product`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY!}`,
        },
      },
    )
    if (!response.ok) {
      const error = await response.json()
      console.error("❌ Stripe session verification failed:", error)
      throw new Error(`Stripe verification failed: ${JSON.stringify(error)}`)
    }
    const session = await response.json()
    console.log("✅ Stripe session verified successfully")

    // Retrieve and parse full CartItem array from session metadata
    const cartItemsJson = session.metadata?.cart_items_json
    let cartItems: CartItem[] = []
    if (cartItemsJson) {
      try {
        cartItems = JSON.parse(cartItemsJson) as CartItem[]
        console.log("Verify Session: Parsed full cart items from metadata:", cartItems)
      } catch (parseError) {
        console.error("Error parsing cart_items_json from metadata:", parseError)
      }
    }

    if (cartItems.length === 0) {
      console.warn("No cart items found in session metadata. This might indicate an issue.")
      // It's better to return an error here if cart items are essential for order processing
      return NextResponse.json({ error: "No cart items found in session metadata" }, { status: 400 })
    }

    // Prepare items for database recording and email sending
    const itemsForProcessing = await Promise.all(
      cartItems.map(async (item) => {
        const productDisplayName = await getProductDisplayName(item.id)
        // Safely extract numeric price from selectedPrice string
        const priceMatch = item.selectedPrice.match(/[\d.]+/)
        const price = priceMatch ? Number.parseFloat(priceMatch[0]) : 0
        const currency = item.selectedRegion === "UAE" ? "AED" : "GBP"

        return {
          productId: item.id,
          quantity: item.selectedQuantity,
          price: price,
          currency: currency,
          productDisplayName: productDisplayName,
        }
      }),
    )

    const customerName =
      session.customer_details?.name ||
      (customerInfo?.firstName && customerInfo?.lastName
        ? `${customerInfo.firstName} ${customerInfo.lastName}`
        : "Customer")
    const customerPhone =
      session.customer_details?.phone ||
      customerInfo?.phone ||
      (customerInfo?.firstName ? "Phone not provided during checkout" : "")

    const orderData = {
      payment_id: session.payment_intent || session.id,
      customer_email: session.customer_details?.email || customerInfo?.email || "",
      customer_name: customerName,
      shipping_address: session.customer_details?.address
        ? `${session.customer_details.address.line1 || ""}${session.customer_details.address.line2 ? ", " + session.customer_details.address.line2 : ""}${session.customer_details.address.city ? ", " + session.customer_details.address.city : ""}${session.customer_details.address.state ? ", " + session.customer_details.address.state : ""}${session.customer_details.address.postal_code ? ", " + session.customer_details.address.postal_code : ""}${session.customer_details.address.country ? ", " + session.customer_details.address.country : ""}`
            .trim()
            .replace(/^, /, "") // Clean up leading comma if line1 is empty
        : customerInfo?.address && customerInfo?.city && customerInfo?.country
          ? `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.country}${customerInfo.postalCode ? ", " + customerInfo.postalCode : ""}`
          : "",
      phone_number: customerPhone,
      notes: `Stripe payment completed. Session ID: ${session.id}.`, // Notes will be detailed by recordOrder
      order_type: "purchase",
      order_status: "completed", // Use 'completed' for successful payments
      shipping_status: "paid", // Start with "paid" status
      total_amount: (session.amount_total ?? 0) / 100, // Convert from cents
      currency: (session.currency ?? "GBP").toUpperCase(),
      items: itemsForProcessing, // Pass the processed items array
    }
    console.log("Verify Session: Final orderData before DB/Email:", orderData)
    console.log("💾 Recording order data:", orderData)

    // Record order in database using the imported recordOrder
    const recordResult = await recordOrder({
      paymentIntentId: orderData.payment_id,
      customerEmail: orderData.customer_email,
      customerName: orderData.customer_name,
      shippingAddress: orderData.shipping_address,
      phoneNumber: orderData.phone_number,
      notes: orderData.notes,
      orderType: orderData.order_type as "standard" | "preorder" | "mixed", // Cast to valid type
      orderStatus: orderData.order_status,
      shippingStatus: orderData.shipping_status,
      totalAmount: orderData.total_amount,
      currency: orderData.currency,
      status: orderData.order_status, // Payment status
      items: itemsForProcessing.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    })

    if (!recordResult.success || !recordResult.orderId) {
      throw new Error(recordResult.message || "Failed to record order in database.")
    }
    const orderId = recordResult.orderId

    // Prepare data for email functions from lib/email.ts
    const emailItems: OrderItemEmailData[] = itemsForProcessing.map((item) => ({
      product_display_name: item.productDisplayName,
      quantity: item.quantity,
      unit_price: item.price,
      currency: item.currency,
    }))

    // Send customer email
    await sendOrderConfirmationEmail({
      customer_email: orderData.customer_email,
      customer_name: orderData.customer_name,
      order_id: orderId.toString(), // Use the actual order ID from DB
      items: emailItems,
      total_amount: orderData.total_amount,
      currency: orderData.currency,
      payment_status: orderData.order_status,
      shipping_status: orderData.shipping_status,
    })

    // Send vendor email (assuming a separate utility for vendor emails)
    await sendVendorNotificationEmail({
      order_id: orderId.toString(),
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      phone_number: orderData.phone_number,
      shipping_address: orderData.shipping_address,
      total_amount: orderData.total_amount,
      currency: orderData.currency,
      items: emailItems,
      payment_method: "Stripe",
    })

    return NextResponse.json({
      success: true,
      orderId: orderId, // Return the actual order ID from DB
      message: "Stripe order processed and notifications sent!",
    })
  } catch (error) {
    console.error("❌ Stripe session verification error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Session verification failed" },
      { status: 500 },
    )
  }
}
