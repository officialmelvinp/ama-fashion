import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { sendVendorNotificationEmail } from "@/lib/email-vendor"
import { recordOrder, getProductById, updateStock } from "@/lib/inventory" 
import { OrderStatus, PaymentStatus, ShippingStatus } from "@/lib/types"
import type { OrderItemEmailData, RecordOrderData } from "@/lib/types"

// Initialize Stripe client
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  let event: Stripe.Event

  try {
    const rawBody = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      console.error(" STRIPE WEBHOOK: No Stripe signature found.")
      return new NextResponse("No Stripe signature found.", { status: 400 })
    }

    event = stripeClient.webhooks.constructEvent(rawBody, signature, webhookSecret)
    console.log(` STRIPE WEBHOOK: Event received: ${event.type}`)
  } catch (err: any) {
    console.error(` STRIPE WEBHOOK: Webhook signature verification failed.`, err.message)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session
      console.log(" STRIPE WEBHOOK: Checkout session completed:", session.id)

      // Retrieve and parse simplified cart items from session metadata
      const cartItemsJson = session.metadata?.cart_items_json
      let simplifiedCartItems: { id: string; qty: number; region: "UAE" | "UK" }[] = []
      if (cartItemsJson) {
        try {
          simplifiedCartItems = JSON.parse(cartItemsJson)
          console.log("STRIPE WEBHOOK: Parsed simplified cart items from metadata:", simplifiedCartItems)
        } catch (parseError) {
          console.error(" STRIPE WEBHOOK: Error parsing cart_items_json from metadata:", parseError)
          return new NextResponse("Failed to parse cart items from metadata", { status: 400 })
        }
      }

      if (simplifiedCartItems.length === 0) {
        console.error(" STRIPE WEBHOOK: No simplified cart items found in session metadata. Cannot process order.")
        return new NextResponse("No cart items found in session metadata", { status: 400 })
      }

      // Parse customer info from metadata
      const customerInfoJson = session.metadata?.customer_info_json
      let customerInfoFromMetadata: any = {}
      if (customerInfoJson) {
        try {
          customerInfoFromMetadata = JSON.parse(customerInfoJson)
          console.log("STRIPE WEBHOOK: Parsed customer info from metadata:", customerInfoFromMetadata)
        } catch (parseError) {
          console.error(" STRIPE WEBHOOK: Error parsing customer_info_json from metadata:", parseError)
          // Continue without customerInfoFromMetadata if parsing fails
        }
      }

      console.log("STRIPE WEBHOOK: Preparing items for processing (fetching full product details from DB)...")
      const itemsForProcessing: OrderItemEmailData[] = await Promise.all(
        simplifiedCartItems.map(async (item) => {
          const product = await getProductById(item.id) // Fetch full product details using getProductById
          if (!product) {
            console.error(` STRIPE WEBHOOK: Product not found for ID: ${item.id}`)
            throw new Error(`Product ${item.id} not found in inventory.`)
          }
          const productDisplayName = product.name || item.id
          const unitPrice = item.region === "UAE" ? product.price_aed : product.price_gbp
          const currencyCode = item.region === "UAE" ? "AED" : "GBP"

          if (unitPrice === null || unitPrice === undefined) {
            console.error(` STRIPE WEBHOOK: Price not found for product ID: ${item.id} in region: ${item.region}`)
            throw new Error(`Price not found for product ${item.id}.`)
          }

          console.log(
            `STRIPE WEBHOOK: Processed item ${item.id}: Display Name: ${productDisplayName}, Quantity: ${item.qty}, Unit Price: ${unitPrice}, Currency: ${currencyCode}`,
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
      console.log("STRIPE WEBHOOK: Items prepared:", itemsForProcessing)

      const customerName =
        session.customer_details?.name ??
        customerInfoFromMetadata?.firstName + " " + customerInfoFromMetadata?.lastName ??
        null
      const customerEmail = session.customer_details?.email || customerInfoFromMetadata?.email || ""
      const customerPhone =
        session.customer_details?.phone?.replace(/\s/g, "") ??
        customerInfoFromMetadata?.phone?.replace(/\s/g, "") ??
        null
      const shippingAddress = session.customer_details?.address
        ? `${session.customer_details.address.line1 || ""}${session.customer_details.address.line2 ? ", " + session.customer_details.address.line2 : ""}${session.customer_details.address.city ? ", " + session.customer_details.address.city : ""}${session.customer_details.address.state ? ", " + session.customer_details.address.state : ""}${session.customer_details.address.postal_code ? ", " + session.customer_details.address.postal_code : ""}${session.customer_details.address.country ? ", " + session.customer_details.address.country : ""}`
            .trim()
            .replace(/^, /, "")
        : (customerInfoFromMetadata?.address ?? null)

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
        status: PaymentStatus.Completed, 
        customerEmail: customerEmail,
        paymentIntentId: paymentId,
        customerName: customerName,
        shippingAddress: shippingAddress,
        phoneNumber: customerPhone,
        notes: `Stripe payment verified via webhook. Session ID: ${session.id}.`,
        orderType: "purchase",
        orderStatus: OrderStatus.Completed, 
        shippingStatus: ShippingStatus.Paid, 
      }

      console.log("STRIPE WEBHOOK: Order data prepared for recording:", orderDataForRecord)
      console.log("STRIPE WEBHOOK: Attempting to record order in DB...")
      const recordResult = await recordOrder(orderDataForRecord)
      const orderDbId = recordResult.orderId

      if (!recordResult.success || !orderDbId) {
        console.error(" STRIPE WEBHOOK: Failed to record order in DB:", recordResult.message)
        return new NextResponse(recordResult.message || "Failed to record order", { status: 500 })
      }

      console.log(` STRIPE WEBHOOK: Order recorded with ID: ${orderDbId}`)

      // Update stock for each item
      for (const item of simplifiedCartItems) {
        const stockUpdateResult = await updateStock(item.id, item.qty)
        if (!stockUpdateResult.success) {
          console.error(`❌ STRIPE WEBHOOK: Failed to update stock for product ${item.id}.`)
          // Consider logging this to an error tracking system or alerting
        } else {
          console.log(
            ` STRIPE WEBHOOK: Stock updated for product ${item.id}. From stock: ${stockUpdateResult.quantityFromStock}, Preorder: ${stockUpdateResult.quantityPreorder}`,
          )
        }
      }

      console.log("STRIPE WEBHOOK: Attempting to send customer email...")
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
      console.log(" STRIPE WEBHOOK: Customer email sent successfully.")

      console.log("STRIPE WEBHOOK: Attempting to send vendor email...")
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
      console.log(" STRIPE WEBHOOK: Vendor email sent successfully.")

      console.log(" STRIPE WEBHOOK: Stripe webhook processing completed successfully!")
      break
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log(` STRIPE WEBHOOK: PaymentIntent ${paymentIntent.id} succeeded!`)
      // You might update order status here if not already handled by checkout.session.completed
      // For example, if you have orders created before payment intent is confirmed
      break
    case "payment_intent.payment_failed":
      const failedPaymentIntent = event.data.object as Stripe.PaymentIntent
      console.log(` STRIPE WEBHOOK: PaymentIntent ${failedPaymentIntent.id} failed!`)
      // Handle failed payments, e.g., update order status to 'failed'
      break
    // ... handle other event types
    default:
      console.warn(`Unhandled event type ${event.type}`)
  }

  // Return a 200 response to acknowledge receipt of the event
  return new NextResponse("OK", { status: 200 })
}
