import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { sendOrderConfirmationEmail, sendEmail } from "@/lib/email" // Import centralized email functions
import { getProductDisplayName } from "@/lib/inventory" // Import helper to get product display name

const sql = neon(process.env.DATABASE_URL!)

// PayPal webhook verification
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!
const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === "live" ? "https://api.paypal.com" : "https://api.sandbox.paypal.com"

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

async function recordOrder(orderData: any) {
  try {
    console.log("💾 Recording order to database:", orderData.payment_id)
    // Check if order already exists
    const existingOrder = await sql`
      SELECT id FROM orders WHERE payment_id = ${orderData.payment_id}
    `
    if (existingOrder.length > 0) {
      console.log("⚠️ Order already exists, skipping database insert")
      return existingOrder[0].id
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
    console.log("✅ Order recorded successfully with ID:", result[0].id)
    return result[0].id
  } catch (error) {
    console.error("❌ Database error:", error)
    throw error
  }
}

// MODIFIED: Consolidated email sending logic for webhooks
async function sendPayPalWebhookEmails(orderData: any, productDisplayName: string) {
  try {
    console.log("📧 Sending PayPal webhook emails for:", orderData.payment_id)

    // Send customer confirmation email using the centralized function
    await sendOrderConfirmationEmail(
      orderData.customer_email,
      orderData.customer_name,
      orderData.payment_id, // Using payment_id as order_id for email
      productDisplayName, // Use the fetched display name
      orderData.quantity_ordered,
      orderData.amount_paid,
      orderData.currency,
      orderData.payment_status,
      "paid", // Initial shipping status
    )

    // Send vendor notification email (similar to Stripe's vendor email)
    const vendorEmailSubject = `🎉 New PayPal Webhook Order: ${productDisplayName} - ${orderData.amount_paid} ${orderData.currency}`
    const vendorEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c2824;">🎉 New PayPal Webhook Order Received!</h1>
        <div style="background: #f8f3ea; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Information:</h3>
          <p><strong>Payment ID:</strong> ${orderData.payment_id}</p>
          <p><strong>Product:</strong> ${productDisplayName}</p>
          <p><strong>Quantity:</strong> ${orderData.quantity_ordered}</p>
          <p><strong>Amount:</strong> ${orderData.amount_paid} ${orderData.currency}</p>
          <p><strong>Order Type:</strong> ${orderData.order_type}</p>
          <p><strong>Payment Method:</strong> PayPal Webhook</p>
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
          <p>✅ Prepare the ${productDisplayName} for delivery</p>
          <p>✅ Update order status in admin panel</p>
        </div>
      </div>
    `
    await sendEmail({ to: "support@amariahco.com", subject: vendorEmailSubject, html: vendorEmailHtml })

    console.log("✅ PayPal webhook emails sent successfully")
  } catch (error) {
    console.error("❌ Email sending failed:", error)
    // Don't throw error here - we still want to return success even if email fails
  }
}

async function handlePaymentCaptureCompleted(event: any) {
  try {
    const resource = event.resource
    const orderId = resource.supplementary_data?.related_ids?.order_id
    const captureId = resource.id
    const amount = Number.parseFloat(resource.amount.value)
    const currency = resource.amount.currency_code

    // MODIFIED: Extract product_id from purchase_units reference_id
    const purchaseUnit = resource.purchase_units?.[0]
    const productIdForDb = purchaseUnit?.reference_id || "unknown-product-id-webhook"

    console.log("💰 PayPal payment captured via webhook:", {
      orderId,
      captureId,
      amount,
      currency,
      productIdForDb,
    })

    // Check if order already exists
    const existingOrder = await sql`
      SELECT id FROM orders WHERE payment_id = ${captureId}
    `
    if (existingOrder.length > 0) {
      console.log("✅ Order already exists, skipping...")
      return
    }

    // NEW: Fetch product display name
    const productDisplayName = await getProductDisplayName(productIdForDb)

    // Record the order
    const orderData = {
      product_id: productIdForDb, // Use the extracted internal product ID
      customer_email: resource.payee?.email_address || "", // PayPal webhook might provide payee email
      customer_name:
        resource.payer?.name?.given_name && resource.payer?.name?.surname
          ? `${resource.payer.name.given_name} ${resource.payer.name.surname}`
          : "PayPal Customer", // Try to get customer name
      quantity_ordered: 1, // Assuming 1 for now, adjust if quantity is in metadata
      quantity_in_stock: 1, // Placeholder, fetch from DB if needed
      quantity_preorder: 0, // Placeholder, fetch from DB if needed
      payment_status: "completed",
      payment_id: captureId,
      amount_paid: amount,
      currency: currency,
      shipping_address: resource.shipping?.address?.address_line_1 || "", // Try to get shipping address
      phone_number: resource.payer?.phone_number?.national_number || "", // Try to get phone number
      notes: `PayPal webhook payment. Order ID: ${orderId}. Product: ${productDisplayName}`, // Use display name in notes
      order_type: "purchase",
      order_status: "paid",
      total_amount: amount,
    }

    await recordOrder(orderData) // This function now also updates inventory

    // Send notification email - MODIFIED to use consolidated function
    await sendPayPalWebhookEmails(orderData, productDisplayName)

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
    const vendorEmailSubject = `💸 PayPal Refund: ${refundAmount} ${currency}`
    const vendorEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c2824;">💸 PayPal Refund Processed</h1>
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Refund Details:</h3>
          <p><strong>Capture ID:</strong> ${captureId}</p>
          <p><strong>Refund Amount:</strong> ${refundAmount} ${currency}</p>
          <p><strong>Status:</strong> Refunded</p>
        </div>
      </div>
    `
    await sendEmail({ to: "support@amariahco.com", subject: vendorEmailSubject, html: vendorEmailHtml })
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
