import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { sendOrderConfirmationEmail } from "@/lib/email" // Import customer email sender
import { sendVendorNotificationEmail } from "@/lib/email-vendor" // Import vendor email sender
import { recordOrder, getProductDisplayName } from "@/lib/inventory" // Import recordOrder and getProductDisplayName
import {
  type OrderItemEmailData,
  type RecordOrderData,
  PaymentStatus, // Import enums for consistency
  OrderStatus,
  ShippingStatus,
} from "@/lib/types"

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

    // Extract line items from the webhook event
    const paypalLineItems = resource.purchase_units?.[0]?.items || []

    if (paypalLineItems.length === 0) {
      console.warn("No line items found in PayPal webhook event. Attempting fallback for order details.")
      // Fallback for single item if no line items are present
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
    const itemsForProcessing: OrderItemEmailData[] = await Promise.all(
      paypalLineItems.map(async (item: any) => {
        const productId = item.sku || item.name // Use SKU or name as product_id
        const productDisplayName = await getProductDisplayName(productId)
        return {
          product_id: productId,
          product_display_name: productDisplayName,
          quantity: Number.parseInt(item.quantity),
          unit_price: Number.parseFloat(item.unit_amount.value),
          currency: item.unit_amount.currency_code,
        }
      }),
    )

    const customerEmail = resource.payee?.email_address || "" // PayPal webhook might provide payee email
    const customerName =
      resource.payer?.name?.given_name && resource.payer?.name?.surname
        ? `${resource.payer.name.given_name} ${resource.payer.name.surname}`
        : "PayPal Customer" // Try to get customer name
    const shippingAddress = resource.shipping?.address?.address_line_1 || "" // Try to get shipping address
    const phoneNumber = resource.payer?.phone_number?.national_number || "" // Try to get phone number

    // Record the order using the shared recordOrder function
    const orderDataForRecord = {
      paymentIntentId: captureId, // Use capture ID as paymentIntentId for consistency
      paypalOrderId: orderId, // Keep PayPal order ID for reference
      customerEmail: customerEmail,
      customerName: customerName,
      shippingAddress: shippingAddress,
      phoneNumber: phoneNumber,
      notes: `PayPal webhook payment. Order ID: ${orderId}.`,
      orderType: "purchase",
      orderStatus: OrderStatus.Completed, // Use 'Completed' for successful payments
      shippingStatus: ShippingStatus.Paid, // Start with "Paid" status
      totalAmount: amount,
      currency: currency,
      status: PaymentStatus.Completed, // Use enum
      items: itemsForProcessing.map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
        price: item.unit_price,
      })),
    } as RecordOrderData

    const recordResult = await recordOrder(orderDataForRecord)
    const orderDbId = recordResult.orderId

    if (!recordResult.success || !orderDbId) {
      console.error("❌ Failed to record order in DB from webhook:", recordResult.message)
      return // Exit if order recording failed
    }

    console.log(`🎉 Order recorded with ID: ${orderDbId} from webhook.`)

    // Send customer confirmation email
    await sendOrderConfirmationEmail({
      customer_name: customerName,
      customer_email: customerEmail,
      order_id: orderDbId.toString(), // Use the DB order ID
      items: itemsForProcessing,
      total_amount: amount,
      currency: currency,
      payment_status: "Confirmed",
      shipping_status: "Paid",
    })
    console.log("✅ Customer confirmation email sent from webhook.")

    // Send vendor notification email
    await sendVendorNotificationEmail({
      order_id: orderDbId.toString(), // Use the DB order ID
      customer_name: customerName,
      customer_email: customerEmail,
      payment_id: captureId, // Pass PayPal capture ID
      phone_number: phoneNumber,
      shipping_address: shippingAddress,
      total_amount: amount,
      currency: currency,
      items: itemsForProcessing,
      payment_method: "PayPal Webhook",
    })
    console.log("✅ Vendor notification email sent from webhook.")

    console.log("✅ PayPal webhook processed successfully")
  } catch (error) {
    console.error("❌ Error handling PayPal payment capture from webhook:", error)
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

    // Update order status in DB
    await sql`
      UPDATE orders
      SET order_status = ${OrderStatus.Refunded},
          notes = CONCAT(notes, ' | Refunded: ${refundAmount} ${currency}')
      WHERE payment_id = ${captureId}
    `

    // Send vendor notification email for refund
    await sendVendorNotificationEmail({
      order_id: captureId, // Use captureId as order_id for refund notification
      customer_name: "Refund Notification", // Provide a placeholder name
      customer_email: process.env.VENDOR_EMAIL_RECIPIENT || "support@amariahco.com", // Send to vendor email
      phone_number: null,
      shipping_address: null,
      total_amount: refundAmount,
      currency: currency,
      items: [], // No specific items for refund notification
      payment_method: "PayPal Refund",
    })
    console.log("✅ PayPal refund webhook processed and vendor email sent.")
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
