import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import nodemailer from "nodemailer"

const sql = neon(process.env.DATABASE_URL!)

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
      order_type, order_status, total_amount, shipping_status
    ) VALUES (
      ${orderData.product_id}, ${orderData.customer_email}, ${orderData.customer_name},
      ${orderData.quantity_ordered}, ${orderData.quantity_in_stock}, ${orderData.quantity_preorder},
      ${orderData.payment_status}, ${orderData.payment_id}, ${orderData.amount_paid},
      ${orderData.currency}, ${orderData.shipping_address}, ${orderData.phone_number},
      ${orderData.notes}, ${orderData.order_type}, ${orderData.order_status}, ${orderData.total_amount},
      ${orderData.shipping_status}
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
              <p><strong>Payment Method:</strong> Stripe</p>
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
      subject: `🎉 New Stripe Order: ${orderData.product_id} - ${orderData.amount_paid} ${orderData.currency}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c2824;">🎉 New Stripe Order Received!</h1>
                        <div style="background: #f8f3ea; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Information:</h3>
            <p><strong>Payment ID:</strong> ${orderData.payment_id}</p>
            <p><strong>Product:</strong> ${orderData.product_id}</p>
            <p><strong>Quantity:</strong> ${orderData.quantity_ordered}</p>
            <p><strong>Amount:</strong> ${orderData.amount_paid} ${orderData.currency}</p>
            <p><strong>Order Type:</strong> ${orderData.order_type}</p>
            <p><strong>Payment Method:</strong> Stripe</p>
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
    console.log("✅ Stripe order emails sent successfully")
  } catch (error) {
    console.error("❌ Email sending failed:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, customerInfo, product } = await request.json()
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }
    console.log("🔍 Verifying Stripe session:", sessionId)
    console.log("📦 Product info received:", product)
    console.log("👤 Customer info received:", customerInfo)
    // Retrieve the session from Stripe
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY!}`, // Use process.env.STRIPE_SECRET_KEY directly here
      },
    })
    if (!response.ok) {
      const error = await response.json()
      console.error("❌ Stripe session verification failed:", error)
      throw new Error(`Stripe verification failed: ${JSON.stringify(error)}`)
    }
    const session = await response.json()
    console.log("✅ Stripe session verified successfully")
    // Extract order information with better product name handling
    const productName = product?.name || product?.id || "AMA Fashion Item"
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
      product_id: productName,
      customer_email: session.customer_details?.email || customerInfo?.email || "",
      customer_name: customerName,
      quantity_ordered: 1,
      quantity_in_stock: 1,
      quantity_preorder: 0,
      payment_status: "completed",
      payment_id: session.payment_intent || session.id,
      amount_paid: (session.amount_total ?? 0) / 100, // Convert from cents
      currency: (session.currency ?? "GBP").toUpperCase(),
      shipping_address: session.customer_details?.address
        ? `${session.customer_details.address.line1}, ${session.customer_details.address.line2 ? session.customer_details.address.line2 + ", " : ""}${session.customer_details.address.city}, ${session.customer_details.address.country}`
        : customerInfo?.address
          ? `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.country}`
          : "",
      phone_number: customerPhone,
      notes: `Stripe payment completed. Session ID: ${session.id}. Product: ${productName}`,
      order_type: "purchase",
      order_status: "paid",
      shipping_status: "paid", // Start with "paid" status
      total_amount: (session.amount_total ?? 0) / 100,
    }
    console.log("💾 Recording order data:", orderData)
    // Record order in database
    await recordOrder(orderData)
    // Send email notifications
    await sendOrderEmails(orderData)
    return NextResponse.json({
      success: true,
      orderId: session.payment_intent || session.id,
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
