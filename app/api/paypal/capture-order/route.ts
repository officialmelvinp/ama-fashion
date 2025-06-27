import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import nodemailer from "nodemailer"

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!
const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === "live" ? "https://api.paypal.com" : "https://api.sandbox.paypal.com"

const sql = neon(process.env.DATABASE_URL!)

// Email configuration
const transporter = nodemailer.createTransport({
  host: "mail.amariahco.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    throw new Error(`PayPal auth failed: ${response.status}`)
  }

  const data = await response.json()
  return data.access_token
}

async function recordOrder(orderData: any) {
  try {
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

    await transporter.sendMail(customerEmail)
    await transporter.sendMail(vendorEmail)

    console.log("✅ Order emails sent successfully")
  } catch (error) {
    console.error("❌ Email sending failed:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orderID, customerInfo } = await request.json()

    console.log("🏦 Capturing PayPal order:", orderID)

    const accessToken = await getPayPalAccessToken()

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("❌ PayPal capture failed:", error)
      throw new Error(`Capture failed: ${JSON.stringify(error)}`)
    }

    const captureData = await response.json()
    console.log("✅ PayPal order captured successfully")

    // Extract order information
    const purchaseUnit = captureData.purchase_units[0]
    const capture = purchaseUnit.payments.captures[0]

    const orderData = {
      product_id: purchaseUnit.reference_id,
      customer_email: customerInfo.email,
      customer_name: customerInfo.name,
      quantity_ordered: 1,
      quantity_in_stock: 1,
      quantity_preorder: 0,
      payment_status: "completed",
      payment_id: capture.id,
      amount_paid: Number.parseFloat(capture.amount.value),
      currency: capture.amount.currency_code,
      shipping_address: customerInfo.address || "",
      phone_number: customerInfo.phone || "",
      notes: `PayPal payment captured. Original amount: ${purchaseUnit.description}`,
      order_type: "purchase",
      order_status: "paid",
      total_amount: Number.parseFloat(capture.amount.value),
    }

    // Record order in database
    await recordOrder(orderData)

    // Send email notifications
    await sendOrderEmails(orderData)

    return NextResponse.json({
      success: true,
      captureID: capture.id,
      message: "Order completed and notifications sent!",
    })
  } catch (error) {
    console.error("❌ PayPal capture error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Capture failed" }, { status: 500 })
  }
}
