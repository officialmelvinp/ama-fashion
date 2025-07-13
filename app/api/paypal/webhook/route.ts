import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { sendOrderConfirmationEmail, sendEmail } from "@/lib/email" // Import centralized email functions
import { getProductDisplayName } from "@/lib/inventory" // Import helper to get product display name
import type { CartItem } from "@/lib/types" // Import CartItem type

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
    console.log("💾 Recording order to database:", orderData.payment_id)
    // Check if order already exists
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
      `PayPal webhook payment. Order ID: ${orderData.payment_id}. Items: ${allProductNames}. Total Quantity: ${totalQuantityOrdered}. ${orderData.notes || ""}`.trim()

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

    console.log("✅ Order recorded successfully with ID:", orderId)
    return orderId
  } catch (error) {
    console.error("❌ Database error:", error)
    throw error
  }
}

// MODIFIED: sendPayPalWebhookEmails now accepts an array of CartItem
async function sendPayPalWebhookEmails(orderData: any, cartItems: CartItem[]) {
  try {
    console.log("📧 Sending PayPal webhook emails for:", orderData.payment_id)

    const itemsHtml = cartItems
      .map(
        (item) => `
    <li>
      <strong>${item.name}</strong> (${item.subtitle}) - ${item.selectedQuantity} x ${item.selectedPrice}
    </li>
  `,
      )
      .join("")

    // Customer confirmation email
    await sendOrderConfirmationEmail({
      customer_email: orderData.customer_email,
      customer_name: orderData.customer_name,
      order_id: orderData.payment_id,
      items: cartItems.map((item) => ({
        product_display_name: item.name,
        quantity: item.selectedQuantity,
        unit_price: Number.parseFloat(item.selectedPrice.match(/[\d.]+/)?.[0] || "0"),
        currency: item.selectedRegion === "UAE" ? "AED" : "GBP",
      })),
      total_amount: orderData.total_amount,
      currency: orderData.currency,
      payment_status: orderData.payment_status,
      shipping_status: "paid", // Initial shipping status
    })

    // Send vendor notification email
    const vendorEmailSubject = `🎉 New PayPal Webhook Order: ${orderData.total_amount} ${orderData.currency} (${cartItems.length} items)`
    const vendorEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2c2824;">🎉 New PayPal Webhook Order Received!</h1>
      <div style="background: #f8f3ea; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Order Information:</h3>
        <p><strong>Payment ID:</strong> ${orderData.payment_id}</p>
        <p><strong>Total Amount:</strong> ${orderData.total_amount} ${orderData.currency}</p>
        <p><strong>Order Type:</strong> ${orderData.order_type}</p>
        <p><strong>Payment Method:</strong> PayPal Webhook</p>
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
    const orderId = resource.supplementary_data?.related_ids?.order_id // This is the PayPal order ID
    const captureId = resource.id // This is the PayPal capture ID (used as payment_id in DB)
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

    // Extract line items from the webhook event
    const paypalLineItems = resource.purchase_units?.[0]?.items || []
    if (paypalLineItems.length === 0) {
      console.warn("No line items found in PayPal webhook event. Cannot process order details.")
      // Fallback for single item if no line items are present (e.g., older PayPal integrations)
      // This part might need to be adjusted based on how your PayPal orders are structured
      // if they don't always include detailed line items in the webhook.
      // For now, we'll create a dummy item if none are found.
      const fallbackProductId = resource.purchase_units?.[0]?.reference_id || "unknown-product-id-webhook"
      const fallbackProductDisplayName = await getProductDisplayName(fallbackProductId)
      const fallbackPrice = amount / (resource.purchase_units?.[0]?.quantity || 1) // Distribute total amount if quantity is available
      paypalLineItems.push({
        sku: fallbackProductId,
        name: fallbackProductDisplayName,
        quantity: resource.purchase_units?.[0]?.quantity || "1",
        unit_amount: {
          value: fallbackPrice.toFixed(2),
          currency_code: currency,
        },
      })
    }

    // Prepare items for database recording and email sending
    const itemsForProcessing = await Promise.all(
      paypalLineItems.map(async (item: any) => {
        const productId = item.sku || item.name // Use SKU or name as product_id
        const productDisplayName = await getProductDisplayName(productId)
        return {
          productId: productId,
          quantity: Number.parseInt(item.quantity),
          price: Number.parseFloat(item.unit_amount.value),
          currency: item.unit_amount.currency_code,
          productDisplayName: productDisplayName,
        }
      }),
    )

    // Convert itemsForProcessing to CartItem[] for sendPayPalWebhookEmails
    const cartItemsForEmail: CartItem[] = itemsForProcessing.map((item) => ({
      id: item.productId,
      name: item.productDisplayName,
      subtitle: "", // Webhook doesn't provide subtitle directly
      materials: [], // Webhook doesn't provide materials directly
      description: "", // Webhook doesn't provide description directly
      priceAED: item.currency === "AED" ? `${item.price} AED` : "",
      priceGBP: item.currency === "GBP" ? `£${item.price} GBP` : "",
      images: [], // Webhook doesn't provide images directly
      category: "", // Webhook doesn't provide category directly
      essences: [], // Webhook doesn't provide essences directly
      selectedQuantity: item.quantity,
      selectedRegion: item.currency === "AED" ? "UAE" : "UK", // Infer region from currency
      selectedPrice: `${item.price.toFixed(2)} ${item.currency}`, // Formatted price string
    }))

    // Record the order
    const orderData = {
      payment_id: captureId,
      customer_email: resource.payee?.email_address || "", // PayPal webhook might provide payee email
      customer_name:
        resource.payer?.name?.given_name && resource.payer?.name?.surname
          ? `${resource.payer.name.given_name} ${resource.payer.name.surname}`
          : "PayPal Customer", // Try to get customer name
      shipping_address: resource.shipping?.address?.address_line_1 || "", // Try to get shipping address
      phone_number: resource.payer?.phone_number?.national_number || "", // Try to get phone number
      notes: `PayPal webhook payment. Order ID: ${orderId}.`, // Notes will be detailed by recordOrder
      order_type: "purchase",
      order_status: "completed", // Use 'completed' for successful payments
      shipping_status: "paid", // Start with "paid" status
      total_amount: amount,
      currency: currency,
      items: itemsForProcessing, // Pass the processed items array
    }

    await recordOrder(orderData)

    // Send notification email - MODIFIED to use consolidated function
    await sendPayPalWebhookEmails(orderData, cartItemsForEmail)

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
