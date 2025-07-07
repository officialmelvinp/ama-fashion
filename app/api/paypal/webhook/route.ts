import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import nodemailer from "nodemailer"

const sql = neon(process.env.DATABASE_URL!)

// PayPal webhook verification
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!
const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === "live" ? "https://api.paypal.com" : "https://api.sandbox.paypal.com"

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

async function verifyPayPalWebhook(headers: any, body: string) {
  try {
    const accessToken = await getPayPalAccessToken()

    const verificationData = {
      auth_algo: headers["paypal-auth-algo"],
      cert_id: headers["paypal-cert-id"],
      transmission_id: headers["paypal-transmission-id"],
      transmission_sig: headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(body),
    }

    const response = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verificationData),
    })

    const result = await response.json()
    return result.verification_status === "SUCCESS"
  } catch (error) {
    console.error("PayPal webhook verification failed:", error)
    return false
  }
}

async function handlePaymentCaptureCompleted(event: any) {
  try {
    const resource = event.resource
    const orderId = resource.supplementary_data?.related_ids?.order_id
    const captureId = resource.id
    const amount = Number.parseFloat(resource.amount.value)
    const currency = resource.amount.currency_code

    console.log("💰 PayPal payment captured via webhook:", {
      orderId,
      captureId,
      amount,
      currency,
    })

    // Check if order already exists
    const existingOrder = await sql`
      SELECT id FROM orders WHERE payment_id = ${captureId}
    `

    if (existingOrder.length > 0) {
      console.log("✅ Order already exists, skipping...")
      return
    }

    // Record the order
    const orderData = {
      product_id: "webhook-order",
      customer_email: resource.payee?.email_address || "",
      customer_name: "PayPal Customer",
      quantity_ordered: 1,
      quantity_in_stock: 1,
      quantity_preorder: 0,
      payment_status: "completed",
      payment_id: captureId,
      amount_paid: amount,
      currency: currency,
      shipping_address: "",
      phone_number: "",
      notes: `PayPal webhook payment. Order ID: ${orderId}`,
      order_type: "purchase",
      order_status: "paid",
      total_amount: amount,
    }

    await sql`
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
      )
    `

    // Send notification email
    const vendorEmail = {
      from: '"AMA Webhooks" <support@amariahco.com>',
      to: "support@amariahco.com",
      subject: `🔔 PayPal Webhook: Payment Captured - ${amount} ${currency}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c2824;">🔔 PayPal Webhook Notification</h1>
          
          <div style="background: #f8f3ea; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Payment Captured:</h3>
            <p><strong>Capture ID:</strong> ${captureId}</p>
            <p><strong>Order ID:</strong> ${orderId || "N/A"}</p>
            <p><strong>Amount:</strong> ${amount} ${currency}</p>
            <p><strong>Status:</strong> Completed</p>
            <p><strong>Source:</strong> PayPal Webhook</p>
          </div>
          
          <div style="background: #2c2824; color: white; padding: 20px; border-radius: 8px;">
            <h3 style="margin-top: 0;">Action Required:</h3>
            <p>✅ Check admin dashboard for order details</p>
            <p>✅ Contact customer if needed</p>
            <p>✅ Process the order</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(vendorEmail)
    console.log("✅ PayPal webhook processed successfully")
  } catch (error) {
    console.error("❌ Error handling PayPal payment capture:", error)
    throw error
  }
}

async function handlePaymentCaptureRefunded(event: any) {
  try {
    const resource = event.resource
    const captureId = resource.id
    const refundAmount = Number.parseFloat(resource.amount.value)
    const currency = resource.amount.currency_code

    console.log("💸 PayPal refund processed:", {
      captureId,
      refundAmount,
      currency,
    })

    // Update order status
    await sql`
      UPDATE orders 
      SET order_status = 'refunded', 
          notes = CONCAT(notes, ' | Refunded: ${refundAmount} ${currency}')
      WHERE payment_id = ${captureId}
    `

    // Send notification
    const vendorEmail = {
      from: '"AMA Webhooks" <support@amariahco.com>',
      to: "support@amariahco.com",
      subject: `💸 PayPal Refund: ${refundAmount} ${currency}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c2824;">💸 PayPal Refund Processed</h1>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Refund Details:</h3>
            <p><strong>Capture ID:</strong> ${captureId}</p>
            <p><strong>Refund Amount:</strong> ${refundAmount} ${currency}</p>
            <p><strong>Status:</strong> Refunded</p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(vendorEmail)
    console.log("✅ PayPal refund webhook processed")
  } catch (error) {
    console.error("❌ Error handling PayPal refund:", error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const event = JSON.parse(body)
    const headers = Object.fromEntries(request.headers.entries())

    console.log("🔔 PayPal webhook received:", event.event_type)

    // Verify webhook signature (optional but recommended for production)
    if (PAYPAL_WEBHOOK_ID) {
      const isValid = await verifyPayPalWebhook(headers, body)
      if (!isValid) {
        console.error("❌ PayPal webhook verification failed")
        return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 })
      }
    }

    // Handle different event types
    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await handlePaymentCaptureCompleted(event)
        break

      case "PAYMENT.CAPTURE.REFUNDED":
        await handlePaymentCaptureRefunded(event)
        break

      case "PAYMENT.CAPTURE.DENIED":
        console.log("❌ PayPal payment denied:", event.resource.id)
        break

      case "CHECKOUT.ORDER.APPROVED":
        console.log("✅ PayPal order approved:", event.resource.id)
        break

      default:
        console.log("ℹ️ Unhandled PayPal webhook event:", event.event_type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("❌ PayPal webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
