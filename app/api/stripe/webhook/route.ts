import { NextResponse, type NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"
import nodemailer from "nodemailer"
import Stripe from "stripe"
import type { CartItem } from "@/lib/types" // Import CartItem type

const sql = neon(process.env.DATABASE_URL!)
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

// Email configuration
const transporter = nodemailer.createTransport({
  host: "premium169.web-hosting.com", // Corrected host
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Added to handle potential certificate issues
  },
})

// Helper function to get product display name from the database
async function getProductDisplayName(productId: string): Promise<string> {
  try {
    const result = await sql`
      SELECT product_name FROM products WHERE product_id = ${productId}
    `
    if (result.length > 0) {
      return result[0].product_name // Corrected to product_name
    }
    console.warn(`Product display name not found for ID: ${productId}. Using fallback.`)
    return `AMA Fashion Item (${productId})` // Fallback if not found
  } catch (error) {
    console.error(`Error fetching product display name for ${productId}:`, error)
    return `AMA Fashion Item (${productId})` // Fallback on error
  }
}

// MODIFIED: recordOrder now accepts an array of items
async function recordOrder(orderData: {
  payment_id: string
  customer_email: string
  customer_name: string
  shipping_address: string
  phone_number: string
  notes: string
  order_type: string
  order_status: string
  shipping_status: string
  total_amount: number
  currency: string
  items: {
    productId: string
    quantity: number
    price: number
    currency: string
    productDisplayName: string // Added for convenience in recording
  }[]
}) {
  try {
    // Check if an order with this payment_id already exists
    const existingOrder = await sql`
      SELECT id FROM orders WHERE payment_id = ${orderData.payment_id}
    `
    if (existingOrder.length > 0) {
      console.log(`Order with payment_id ${orderData.payment_id} already exists. Skipping insertion.`)
      return existingOrder[0].id // Return existing order ID
    }

    // Construct notes based on all items
    const allProductNames = orderData.items.map((item) => item.productDisplayName).join(", ")
    const totalQuantityOrdered = orderData.items.reduce((sum, item) => sum + item.quantity, 0)
    const detailedNotes =
      `Stripe payment completed via webhook. Session ID: ${orderData.payment_id}. Items: ${allProductNames}. Total Quantity: ${totalQuantityOrdered}. ${orderData.notes || ""}`.trim()

    // Insert into the main 'orders' table
    const result = await sql`
      INSERT INTO orders (
        customer_email, customer_name, payment_status, payment_id,
        total_amount, currency, shipping_address, phone_number, notes,
        order_type, order_status, shipping_status
      ) VALUES (
        ${orderData.customer_email}, ${orderData.customer_name},
        ${orderData.order_status}, ${orderData.payment_id}, ${orderData.total_amount},
        ${orderData.currency}, ${orderData.shipping_address}, ${orderData.phone_number},
        ${detailedNotes}, ${orderData.order_type}, ${orderData.order_status},
        ${orderData.shipping_status}
      ) RETURNING id
    `
    const orderId = result[0].id

    // Insert each item into the 'order_items' table and update 'product_inventory'
    for (const item of orderData.items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, product_display_name, quantity, unit_price, currency)
        VALUES (${orderId}, ${item.productId}, ${item.productDisplayName}, ${item.quantity}, ${item.price}, ${item.currency})
      `
      // Update individual product inventory
      await sql`
        UPDATE product_inventory
        SET quantity_available = GREATEST(0, quantity_available - ${item.quantity}),
            updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ${item.productId}
      `
    }

    return orderId
  } catch (error) {
    console.error("Database error:", error)
    throw error
  }
}

// MODIFIED: sendOrderEmails now accepts an array of CartItem
async function sendOrderEmails(orderData: any, cartItems: CartItem[]) {
  try {
    console.log("Attempting to send customer email...") // Added log

    const itemsHtml = cartItems
      .map(
        (item) => `
      <li>
        <strong>${item.name}</strong> (${item.subtitle}) - ${item.selectedQuantity} x ${item.selectedPrice}
      </li>
    `,
      )
      .join("")

    // Customer email
    const customerEmail = {
      from: '"AMA Fashion" <support@amariahco.com>',
      to: orderData.customer_email,
      subject: "🎉 Payment Confirmed - Your AMA Order",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f3ea; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #2c2824; font-family: serif; text-align: center; margin-bottom: 30px;">
              Thank You for Your Order! 🎉
            </h1>
            <div style="background: #f8f3ea; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2c2824; margin-top: 0;">Order Details:</h3>
              <p><strong>Order ID:</strong> ${orderData.payment_id}</p>
              <p><strong>Total Amount:</strong> ${orderData.total_amount} ${orderData.currency}</p>
              <p><strong>Payment Status:</strong> ✅ Confirmed</p>
              <p><strong>Payment Method:</strong> Stripe</p>
              <h4>Items:</h4>
              <ul>${itemsHtml}</ul>
            </div>
            <div style="background: #2c2824; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">What's Next?</h3>
              <p>📱 We'll contact you via WhatsApp within 24 hours to confirm your order details and arrange delivery.</p>
              <p>📦 Your beautiful AMA piece will be prepared with love and care.</p>
              <p>🚚 We'll coordinate delivery to your address.</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #2c2824; font-style: italic;">
                "Conscious luxury. Spiritually rooted. Intentionally crafted."
              </p>
            </div>
            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
              <p>AMA Fashion - Conscious Luxury African Fashion</p>
              <p>Dubai & UK | support@amariahco.com</p>
            </div>
          </div>
        </div>
      `,
    }
    await transporter.sendMail(customerEmail)
    console.log("Customer email sent successfully.") // Added log

    console.log("Attempting to send vendor email...") // Added log
    // Vendor email
    const vendorEmail = {
      from: '"AMA Orders" <support@amariahco.com>',
      to: "support@amariahco.com",
      subject: `🎉 New Stripe Order: ${orderData.total_amount} ${orderData.currency} (${cartItems.length} items)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c2824;">🎉 New Stripe Order Received!</h1>
          <div style="background: #f8f3ea; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Information:</h3>
            <p><strong>Payment ID:</strong> ${orderData.payment_id}</p>
            <p><strong>Total Amount:</strong> ${orderData.total_amount} ${orderData.currency}</p>
            <p><strong>Order Type:</strong> ${orderData.order_type}</p>
            <p><strong>Payment Method:</strong> Stripe</p>
            <h4>Items:</h4>
            <ul>${itemsHtml}</ul>
          </div>
          <div style="background: #2c2824; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Customer Details:</h3>
            <p><strong>Name:</strong> ${orderData.customer_name}</p>
            <p><strong>Email:</strong> ${orderData.customer_email}</p>
            <p><strong>Phone:</strong> ${orderData.phone_number || "Not provided"}</p>
            <p><strong>Address:</strong> ${orderData.shipping_address || "Not provided"}</p>
          </div>
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c2824; margin-top: 0;">Action Items:</h3>
            <p>✅ Contact customer via WhatsApp within 24 hours</p>
            <p>✅ Confirm order details and delivery preferences</p>
            <p>✅ Prepare the order for delivery</p>
            <p>✅ Update order status in admin panel</p>
          </div>
        </div>
      `,
    }
    await transporter.sendMail(vendorEmail)
    console.log("Vendor email sent successfully.") // Added log
    console.log("✅ Stripe order emails sent successfully")
  } catch (error) {
    console.error("❌ Email sending failed:", error)
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  let event

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
    // MODIFIED: Retrieve cart_items_json from session metadata
    const cartItemsJson = session.metadata?.cart_items_json
    let cartItems: CartItem[] = []
    if (cartItemsJson) {
      try {
        cartItems = JSON.parse(cartItemsJson) as CartItem[]
        console.log("Webhook: Parsed cart items from metadata:", cartItems)
      } catch (parseError) {
        console.error("Webhook: Error parsing cart_items_json from metadata:", parseError)
      }
    }

    if (cartItems.length === 0) {
      console.warn(
        "Webhook: No cart items found in session metadata. This might indicate an issue or a single-item legacy flow.",
      )
      // If no cart items, try to fall back to single product metadata if it exists
      const singleProductId = session.metadata?.internal_product_id
      if (singleProductId) {
        const singleProductDisplayName =
          session.metadata?.product_name_for_display || `AMA Fashion Item (${singleProductId})`
        // Construct a single-item cart for processing
        cartItems = [
          {
            id: singleProductId,
            name: singleProductDisplayName,
            subtitle: "", // Placeholder
            materials: [], // Placeholder
            description: "", // Placeholder
            priceAED: "", // Placeholder
            priceGBP: "", // Placeholder
            images: [], // Placeholder
            category: "", // Placeholder
            essences: [], // Placeholder
            selectedQuantity: 1,
            selectedRegion: (session.currency === "aed" ? "UAE" : "UK") as "UAE" | "UK",
            selectedPrice: `${(session.amount_total ?? 0) / 100} ${session.currency?.toUpperCase()}`,
          },
        ]
        console.log("Webhook: Falling back to single product from metadata:", cartItems[0])
      } else {
        console.error("Webhook: No product or cart items found in session metadata. Cannot process order.")
        return NextResponse.json({ error: "No product or cart items found in session metadata" }, { status: 400 })
      }
    }

    // Prepare items for database recording and email sending
    const itemsForProcessing = await Promise.all(
      cartItems.map(async (item) => {
        const productDisplayName = await getProductDisplayName(item.id)
        return {
          productId: item.id,
          quantity: item.selectedQuantity,
          price: Number.parseFloat(item.selectedPrice.match(/[\d.]+/)?.[0] || "0"), // Extract numeric price
          currency: item.selectedRegion === "UAE" ? "AED" : "GBP",
          productDisplayName: productDisplayName,
        }
      }),
    )

    const customerName = session.customer_details?.name || "Customer"
    const customerPhone = session.customer_details?.phone || ""

    const paymentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent as Stripe.PaymentIntent)?.id || session.id

    const orderData = {
      payment_id: paymentId, // Use the explicitly extracted string ID
      customer_email: session.customer_details?.email || "",
      customer_name: customerName,
      shipping_address: session.customer_details?.address
        ? `${session.customer_details.address.line1 || ""}${session.customer_details.address.line2 ? ", " + session.customer_details.address.line2 : ""}${session.customer_details.address.city ? ", " + session.customer_details.address.city : ""}${session.customer_details.address.state ? ", " + session.customer_details.address.state : ""}${session.customer_details.address.postal_code ? ", " + session.customer_details.address.postal_code : ""}${session.customer_details.address.country ? ", " + session.customer_details.address.country : ""}`
            .trim()
            .replace(/^, /, "") // Clean up leading comma if line1 is empty
        : "",
      phone_number: customerPhone,
      notes: `Stripe payment completed via webhook. Session ID: ${session.id}.`, // Notes will be detailed by recordOrder
      order_type: "purchase",
      order_status: "completed", // Use 'completed' for successful payments
      shipping_status: "paid", // Start with "paid" status
      total_amount: (session.amount_total ?? 0) / 100, // Convert from cents
      currency: (session.currency ?? "GBP").toUpperCase(),
      items: itemsForProcessing, // Pass the processed items array
    }
    try {
      // Record order in database
      await recordOrder(orderData)
      console.log("Webhook: Order Data before sending emails:", orderData)
      // Send email notifications - MODIFIED to pass cartItems
      await sendOrderEmails(orderData, cartItems)
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
