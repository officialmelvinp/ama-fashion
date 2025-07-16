import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { sendOrderConfirmationEmail } from "@/lib/email" // Import customer email sender
import { sendVendorNotificationEmail } from "@/lib/email-vendor" // Import vendor email sender
import { recordOrder, getProductDisplayName } from "@/lib/inventory" // Import recordOrder and getProductDisplayName
import type { CartItem, OrderItemEmailData } from "@/lib/types" // Ensure CartItem and OrderItemEmailData are imported
import type { RecordOrderData } from "@/lib/types"

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!
const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === "live" ? "https://api.paypal.com" : "https://api.sandbox.paypal.com"

const sql = neon(process.env.DATABASE_URL!)

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")
  console.log("🔑 Getting PayPal access token from:", PAYPAL_BASE_URL)
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })
  if (!response.ok) {
    const errorText = await response.text()
    console.error("❌ PayPal auth failed:", response.status, errorText)
    throw new Error(`PayPal auth failed: ${response.status} - ${errorText}`)
  }
  const data = await response.json()
  console.log("✅ PayPal access token obtained successfully")
  return data.access_token
}

export async function POST(request: NextRequest) {
  let requestBody: any = null
  try {
    requestBody = await request.json()
    const { orderID, customerInfo, cartItems: clientCartItems } = requestBody // Extract clientCartItems

    if (!orderID) {
      console.error("❌ No orderID provided")
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    console.log("🏦 Starting PayPal capture process for order:", orderID)
    console.log("🌍 PayPal Mode:", process.env.PAYPAL_MODE || "sandbox")
    console.log("🔗 PayPal Base URL:", PAYPAL_BASE_URL)

    const accessToken = await getPayPalAccessToken()
    console.log("📡 Attempting to capture PayPal order...")

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    console.log("📊 PayPal capture response status:", response.status)
    if (!response.ok) {
      const error = await response.json()
      console.error("❌ PayPal capture failed:", {
        status: response.status,
        error: error,
        orderID: orderID,
        mode: process.env.PAYPAL_MODE,
      })
      throw new Error(`Capture failed: ${JSON.stringify(error)}`)
    }

    const captureData = await response.json()
    console.log("✅ PayPal order captured successfully!")
    console.log("📋 Capture data:", JSON.stringify(captureData, null, 2))

    // Extract order information
    const purchaseUnit = captureData.purchase_units[0]
    const capture = purchaseUnit.payments.captures[0]

    console.log("💰 Payment details:", {
      captureId: capture.id,
      amount: capture.amount.value,
      currency: capture.amount.currency_code,
      status: capture.status,
    })

    // Prepare items for database recording and email sending
    const itemsForProcessing: OrderItemEmailData[] = await Promise.all(
      clientCartItems.map(async (item: CartItem) => {
        const productDisplayName = await getProductDisplayName(item.id)
        const priceMatch = item.selectedPrice.match(/[\d.]+/)
        const numericPrice = priceMatch ? Number.parseFloat(priceMatch[0]) : 0

        return {
          product_id: item.id,
          product_display_name: productDisplayName,
          quantity: item.selectedQuantity,
          unit_price: numericPrice,
          currency: item.selectedRegion === "UAE" ? "AED" : "GBP",
        }
      }),
    )

    const customerName = customerInfo?.name || "Customer"
    const customerEmail = customerInfo?.email || ""
    const customerPhone = customerInfo?.phone || ""
    const shippingAddress = customerInfo?.address || ""

    const totalAmount = Number.parseFloat(capture.amount.value)
    const currency = capture.amount.currency_code

    const orderDataForRecord = {
      customerEmail: customerEmail,
      customerName: customerName,
      paymentIntentId: capture.id, // Use capture ID as paymentIntentId for consistency
      paypalOrderId: orderID, // Keep PayPal order ID for reference
      totalAmount: totalAmount,
      currency: currency,
      status: "completed", // Payment status
      shippingAddress: shippingAddress,
      phoneNumber: customerPhone,
      notes: `PayPal payment captured. Order ID: ${orderID}. Capture Status: ${capture.status}.`,
      orderType: "purchase",
      orderStatus: "paid", // Internal order status
      shippingStatus: "paid", // Internal shipping status
      items: itemsForProcessing.map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
        price: item.unit_price,
      })),
    } as RecordOrderData

    // Record order in database using the shared function
    const recordResult = await recordOrder(orderDataForRecord)
    const orderDbId = recordResult.orderId

    if (!recordResult.success || !orderDbId) {
      console.error("❌ Failed to record order in DB:", recordResult.message)
      return NextResponse.json({ error: recordResult.message || "Failed to record order" }, { status: 500 })
    }

    console.log(`🎉 Order recorded with ID: ${orderDbId}`)

    // Send customer email notification
    await sendOrderConfirmationEmail({
      customer_name: customerName,
      customer_email: customerEmail,
      order_id: orderDbId.toString(), // Use the DB order ID
      items: itemsForProcessing,
      total_amount: totalAmount,
      currency: currency,
      payment_status: "Confirmed",
      shipping_status: "paid",
    })
    console.log("✅ Customer confirmation email sent.")

    // Send vendor notification email
    await sendVendorNotificationEmail({
      order_id: orderDbId.toString(), // Use the DB order ID
      customer_name: customerName,
      customer_email: customerEmail,
      payment_id: capture.id, // Pass PayPal capture ID
      phone_number: customerPhone,
      shipping_address: shippingAddress,
      total_amount: totalAmount,
      currency: currency,
      items: itemsForProcessing,
      payment_method: "PayPal",
    })
    console.log("✅ Vendor notification email sent.")

    console.log("🎉 PayPal order processing completed successfully!")

    return NextResponse.json({
      success: true,
      captureID: capture.id,
      captureStatus: capture.status,
      amount: capture.amount.value,
      currency: capture.amount.currency_code,
      paypalMode: process.env.PAYPAL_MODE || "sandbox",
      message: "PayPal order completed and notifications sent!",
    })
  } catch (error) {
    console.error("❌ PayPal capture error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Capture failed",
        paypalMode: process.env.PAYPAL_MODE || "sandbox",
        orderID: requestBody?.orderID || "unknown",
      },
      { status: 500 },
    )
  }
}
