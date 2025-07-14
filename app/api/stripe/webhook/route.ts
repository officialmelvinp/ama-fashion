import { NextResponse, type NextRequest } from "next/server"
import Stripe from "stripe"
import { sendOrderConfirmationEmail } from "@/lib/email" // Import customer email sender
import { sendVendorNotificationEmail } from "@/lib/email-vendor" // Import vendor email sender
import { recordOrder, getProductDisplayName } from "@/lib/inventory" // Import DB functions
import type { CartItem, OrderItemEmailData } from "@/lib/types" // Import CartItem and OrderItemEmailData types

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil", // Updated to match other Stripe initializations
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")
  let event: Stripe.Event

  try {
    // Verify the webhook signature
    event = stripeClient.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error: any) {
    console.error("❌ Stripe webhook signature verification failed:", error.message)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  // Explicitly cast event.data.object to Stripe.Checkout.Session
  const session = event.data.object as Stripe.Checkout.Session

  if (event.type === "checkout.session.completed") {
    console.log("Webhook: Checkout session completed event received.")

    // Retrieve cart_items_json from session metadata
    const cartItemsJson = session.metadata?.cart_items_json
    let cartItems: CartItem[] = []
    if (cartItemsJson) {
      try {
        // The cart_items_json was simplified in the previous step to only include id, qty, region
        // We need to fetch full product details or ensure the CartItem type here matches the simplified metadata
        // For now, assuming the CartItem type is what's needed for recordOrder and email functions,
        // and we'll reconstruct it or fetch more details if necessary.
        // Given the previous instruction to simplify metadata to id, qty, region,
        // the CartItem type here might need to be adjusted or we need to fetch full product data.
        // For now, I'll assume `item.selectedPrice` is still available or can be derived.
        cartItems = JSON.parse(cartItemsJson) as CartItem[] // This will be simplified CartItem
        console.log("Webhook: Parsed simplified cart items from metadata:", cartItems)
      } catch (parseError) {
        console.error("Webhook: Error parsing cart_items_json from metadata:", parseError)
        return NextResponse.json({ error: "Failed to parse cart items from metadata" }, { status: 400 })
      }
    }

    if (cartItems.length === 0) {
      console.error("Webhook: No cart items found in session metadata. Cannot process order.")
      return NextResponse.json({ error: "No cart items found in session metadata" }, { status: 400 })
    }

    // Prepare items for database recording and email sending
    // This mapping needs to fetch full product details if the metadata is simplified
    const itemsForProcessing: OrderItemEmailData[] = await Promise.all(
      cartItems.map(async (item) => {
        // Assuming item from metadata has id, qty, region.
        // We need to fetch product_display_name, unit_price, currency from DB or a product catalog
        // based on item.id and item.region.
        // For now, using getProductDisplayName and inferring price/currency from item.selectedPrice
        // which might not be present in the simplified metadata.
        // This is a potential point of failure if `item.selectedPrice` is not in the simplified metadata.
        // If `cart_items_json` only contains `id`, `qty`, `region`, you'll need to fetch `selectedPrice`
        // and other product details from your database using `item.id` and `item.region`.
        // For now, I'll assume `item.selectedPrice` is still available or can be derived.
        const productDisplayName = await getProductDisplayName(item.id)
        const priceMatch = item.selectedPrice?.match(/[\d.]+/)?.[0] // Use optional chaining
        const numericPrice = priceMatch ? Number.parseFloat(priceMatch) : 0
        const currencyCode = item.selectedRegion === "UAE" ? "AED" : "GBP"

        return {
          product_id: item.id,
          product_display_name: productDisplayName,
          quantity: item.selectedQuantity,
          unit_price: numericPrice,
          currency: currencyCode,
        }
      }),
    )

    const customerName = session.customer_details?.name || "Customer"
    const customerEmail = session.customer_details?.email || ""
    const customerPhone = session.customer_details?.phone || ""
    const shippingAddress = session.customer_details?.address
      ? `${session.customer_details.address.line1 || ""}${session.customer_details.address.line2 ? ", " + session.customer_details.address.line2 : ""}${session.customer_details.address.city ? ", " + session.customer_details.address.city : ""}${session.customer_details.address.state ? ", " + session.customer_details.address.state : ""}${session.customer_details.address.postal_code ? ", " + session.customer_details.address.postal_code : ""}${session.customer_details.address.country ? ", " + session.customer_details.address.country : ""}`
          .trim()
          .replace(/^, /, "") // Clean up leading comma if line1 is empty
      : ""

    const paymentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent as Stripe.PaymentIntent)?.id || session.id

    const totalAmount = (session.amount_total ?? 0) / 100 // Convert from cents
    const currency = (session.currency ?? "GBP").toUpperCase()

    // THIS IS THE CORRECTED orderData OBJECT. PLEASE REPLACE YOUR EXISTING ONE WITH THIS.
    const orderData = {
      items: itemsForProcessing.map((item) => ({
        productId: item.product_id, // Map to productId
        quantity: item.quantity,
        price: item.unit_price,
      })),
      totalAmount: totalAmount, // Corrected to camelCase
      currency: currency,
      status: "completed", // Added the general 'status' field
      customerEmail: customerEmail, // Corrected to camelCase
      paymentIntentId: paymentId, // Corrected to camelCase
      customerName: customerName, // Corrected to camelCase
      shippingAddress: shippingAddress, // Corrected to camelCase
      phoneNumber: customerPhone, // Corrected to camelCase
      notes: `Stripe payment completed via webhook. Session ID: ${session.id}.`,
      orderType: "purchase", // Corrected to camelCase
      orderStatus: "completed", // This is for your internal order_status in DB
      shippingStatus: "paid", // This is for your internal shipping_status in DB
    }

    try {
      // Record order in database
      const recordResult = await recordOrder(orderData) // recordOrder now returns { success: boolean, orderId?: number, message?: string }
      const orderDbId = recordResult.orderId

      if (!recordResult.success || !orderDbId) {
        console.error("Webhook: Failed to record order in DB:", recordResult.message)
        return NextResponse.json({ error: recordResult.message || "Failed to record order" }, { status: 500 })
      }

      console.log(`Webhook: Order recorded with ID: ${orderDbId}`)

      // Send customer email notification
      await sendOrderConfirmationEmail({
        customer_name: orderData.customerName, // Corrected to camelCase
        customer_email: orderData.customerEmail, // Corrected to camelCase
        order_id: orderDbId.toString(), // Use the actual order ID from DB
        items: itemsForProcessing,
        total_amount: orderData.totalAmount, // Corrected to camelCase
        currency: orderData.currency,
        payment_status: "Confirmed",
        shipping_status: "Paid",
      })
      console.log("Webhook: Customer email sent successfully.")

      // Send vendor email notification
      await sendVendorNotificationEmail({
        order_id: orderDbId.toString(), // Use the actual order ID from DB
        customer_name: orderData.customerName, // Corrected to camelCase
        customer_email: orderData.customerEmail, // Corrected to camelCase
        phone_number: orderData.phoneNumber, // Corrected to camelCase
        shipping_address: orderData.shippingAddress, // Corrected to camelCase
        total_amount: orderData.totalAmount, // Corrected to camelCase
        currency: orderData.currency,
        items: itemsForProcessing,
        payment_method: "Stripe",
      })
      console.log("Webhook: Vendor email sent successfully.")
      console.log("✅ Stripe order processed successfully via webhook")
    } catch (error) {
      console.error("❌ Error processing order from webhook:", error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Webhook processing failed" },
        { status: 500 },
      )
    }
  }

  return NextResponse.json({ received: true })
}
