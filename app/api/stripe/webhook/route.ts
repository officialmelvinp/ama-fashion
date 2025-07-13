import { NextResponse, type NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"
import nodemailer from "nodemailer"
import Stripe from "stripe"

const sql = neon(process.env.DATABASE_URL!)
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

// Email configuration - UPDATED HOST AND ADDED rejectUnauthorized
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

async function recordOrder(orderData: any) {
  try {
    // Check if an order with this payment_id already exists
    const existingOrder = await sql`
    SELECT id FROM orders WHERE payment_id = ${orderData.payment_id}
  `
    if (existingOrder.length > 0) {
      console.log(`Order with payment_id ${orderData.payment_id} already exists. Skipping insertion.`)
      return existingOrder[0].id // Return existing order ID
    }

    const result = await sql`
    INSERT INTO orders (
      product_id, customer_email, customer_name, quantity_ordered,
      quantity_in_stock, quantity_preorder, payment_status, payment_id,
      amount_paid, currency, shipping_address, phone_number, notes,
      order_type, order_status, total_amount
    ) VALUES (
      ${orderData.product_id}, ${orderData.customer_email}, ${orderData.customer_name},
      ${orderData.quantity_ordered}, ${orderData.quantity_in_stock}, ${orderData.quantity_preorder},
      ${orderData.payment_status}, ${orderData.payment_id}, ${orderData.amount_paid},
      ${orderData.currency}, ${orderData.shipping_address}, ${orderData.phone_number},
      ${orderData.notes}, ${orderData.order_type}, ${orderData.order_status}, ${orderData.total_amount}
    ) RETURNING id
  `
    // Update inventory
    await sql`
    UPDATE product_inventory
    SET quantity_available = quantity_available - ${orderData.quantity_ordered}
    WHERE product_id = ${orderData.product_id}
  `
    return result[0].id
  } catch (error) {
    console.error("Database error:", error)
    throw error
  }
}

async function sendOrderEmails(orderData: any) {
  try {
    console.log("Attempting to send customer email...") // Added log
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
              <p><strong>Product:</strong> ${orderData.product_id}</p>
              <p><strong>Quantity:</strong> ${orderData.quantity_ordered}</p>
              <p><strong>Amount Paid:</strong> ${orderData.amount_paid} ${orderData.currency}</p>
              <p><strong>Payment Status:</strong> ✅ Confirmed</p>
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
      subject: `🎉 New Order: ${orderData.product_id} - ${orderData.amount_paid} ${orderData.currency}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c2824;">🎉 New Order Received!</h1>
          <div style="background: #f8f3ea; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Information:</h3>
            <p><strong>Payment ID:</strong> ${orderData.payment_id}</p>
            <p><strong>Product:</strong> ${orderData.product_id}</p>
            <p><strong>Quantity:</strong> ${orderData.quantity_ordered}</p>
            <p><strong>Amount:</strong> ${orderData.amount_paid} ${orderData.currency}</p>
            <p><strong>Order Type:</strong> ${orderData.order_type}</p>
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
            <p>✅ Prepare the ${orderData.product_id} for delivery</p>
            <p>✅ Update order status in admin panel</p>
          </div>
        </div>
      `,
    }
    await transporter.sendMail(vendorEmail)
    console.log("Vendor email sent successfully.") // Added log
    console.log("✅ Order emails sent successfully")
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
    let productName = "AMA Fashion Item" // Default fallback

    // --- IMPROVED PRODUCT NAME EXTRACTION ---
    // Ensure line_items are expanded when creating the Checkout Session for this to work reliably.
    if (session.line_items && session.line_items.data && session.line_items.data.length > 0) {
      const firstLineItem = session.line_items.data[0]
      // Prioritize description, then product name if available
      if (firstLineItem.description) {
        productName = firstLineItem.description
      } else if (firstLineItem.price?.product) {
        const product = firstLineItem.price.product
        // Check if 'product' is a Stripe.Product object (not just a string ID or deleted product)
        if (typeof product === "object" && product !== null && !("deleted" in product)) {
          productName = product.name || productName
        } else if (typeof product === "string") {
          // If product is just the ID string, use it as a fallback name
          productName = product
        }
      }
    }
    // --- END IMPROVED PRODUCT NAME EXTRACTION ---

    const productId = productName.replace("AMA Fashion - ", "") // Your existing logic

    const orderData = {
      product_id: productId,
      customer_email: session.customer_details?.email,
      customer_name: session.customer_details?.name || "Customer",
      quantity_ordered: 1, // Assuming 1 for now, adjust if quantity is in metadata
      quantity_in_stock: 1, // Placeholder, fetch from DB if needed
      quantity_preorder: 0, // Placeholder, fetch from DB if needed
      payment_status: "completed",
      payment_id: session.payment_intent,
      amount_paid: (session.amount_total ?? 0) / 100, // Convert from cents, default to 0 if null
      currency: (session.currency ?? "GBP").toUpperCase(), // Default to "GBP" if null
      shipping_address: session.customer_details?.address
        ? `${session.customer_details.address.line1}, ${session.customer_details.address.line2 ? session.customer_details.address.line2 + ", " : ""}${session.customer_details.address.city}, ${session.customer_details.address.country}`
        : "",
      phone_number: session.customer_details?.phone || "",
      notes: `Stripe payment completed via webhook. Session ID: ${session.id}`,
      order_type: "purchase",
      order_status: "paid",
      total_amount: (session.amount_total ?? 0) / 100,
    }

    try {
      // Record order in database
      await recordOrder(orderData)
      // --- CONSOLE.LOG FOR DEBUGGING PRICE ---
      console.log("Order Data before sending emails:", orderData)
      // --- END CONSOLE.LOG ---
      // Send email notifications
      await sendOrderEmails(orderData)
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
