import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { sendOrderConfirmationEmail, sendEmail } from "@/lib/email" // Import sendEmail as well
import { getProductDisplayName } from "@/lib/inventory" // Import the exported function
import type { CartItem } from "@/lib/types" // Ensure CartItem is imported

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
      console.log("⚠️ Order already exists, skipping database insert")
      return existingOrder[0].id
    }

    // Construct notes based on all items
    const allProductNames = orderData.items.map((item) => item.productDisplayName).join(", ")
    const totalQuantityOrdered = orderData.items.reduce((sum, item) => sum + item.quantity, 0)
    const detailedNotes =
      `PayPal payment captured. Order ID: ${orderData.payment_id}. Items: ${allProductNames}. Total Quantity: ${totalQuantityOrdered}. ${orderData.notes || ""}`.trim()

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

// MODIFIED: sendPayPalOrderEmails now accepts an array of CartItem
async function sendPayPalOrderEmails(orderData: any, cartItems: CartItem[]) {
  try {
    console.log("📧 Sending PayPal order emails for:", orderData.payment_id)

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
    await sendOrderConfirmationEmail(
      orderData.customer_email,
      orderData.customer_name,
      orderData.payment_id, // Using payment_id as order_id for email
      cartItems
        .map((item) => item.name)
        .join(", "), // Product names for subject/summary
      orderData.items.reduce((sum: number, item: any) => sum + item.quantity, 0), // Total quantity
      orderData.total_amount,
      orderData.currency,
      orderData.payment_status,
      "paid", // Initial shipping status
    )

    // Send vendor notification email
    const vendorEmailSubject = `🎉 New PayPal Order: ${orderData.total_amount} ${orderData.currency} (${cartItems.length} items)`
    const vendorEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c2824;">🎉 New PayPal Order Received!</h1>
        <div style="background: #f8f3ea; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Information:</h3>
          <p><strong>Payment ID:</strong> ${orderData.payment_id}</p>
          <p><strong>Total Amount:</strong> ${orderData.total_amount} ${orderData.currency}</p>
          <p><strong>Order Type:</strong> ${orderData.order_type}</p>
          <p><strong>Payment Method:</strong> PayPal</p>
          <p><strong>PayPal Mode:</strong> ${process.env.PAYPAL_MODE || "sandbox"}</p>
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

    console.log("✅ PayPal order emails sent successfully")
  } catch (error) {
    console.error("❌ Email sending failed:", error)
    // Don't throw error here - we still want to return success even if email fails
  }
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
    const itemsForProcessing = await Promise.all(
      clientCartItems.map(async (item: CartItem) => {
        const productDisplayName = await getProductDisplayName(item.id)
        // Extract numeric price from the selectedPrice string
        const priceMatch = item.selectedPrice.match(/[\d.]+/)
        const numericPrice = priceMatch ? Number.parseFloat(priceMatch[0]) : 0

        return {
          productId: item.id,
          quantity: item.selectedQuantity,
          price: numericPrice,
          currency: item.selectedRegion === "UAE" ? "AED" : "GBP",
          productDisplayName: productDisplayName,
        }
      }),
    )

    const orderData = {
      customer_email: customerInfo?.email || "",
      customer_name: customerInfo?.name || "Customer",
      payment_status: "completed",
      payment_id: capture.id,
      total_amount: Number.parseFloat(capture.amount.value), // Total amount from PayPal capture
      currency: capture.amount.currency_code,
      shipping_address: customerInfo?.address || "",
      phone_number: customerInfo?.phone || "",
      notes: `PayPal payment captured. Order ID: ${orderID}. Capture Status: ${capture.status}.`,
      order_type: "purchase",
      order_status: "paid",
      shipping_status: "paid", // Initial shipping status
      items: itemsForProcessing, // Pass the processed items array
    }

    // Record order in database
    await recordOrder(orderData)

    // Send email notifications - MODIFIED to pass cartItems
    await sendPayPalOrderEmails(orderData, clientCartItems)

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
