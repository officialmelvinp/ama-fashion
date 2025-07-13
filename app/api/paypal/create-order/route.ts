import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getProductDisplayName } from "@/lib/inventory" // Import the exported function

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!
const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === "live" ? "https://api.paypal.com" : "https://api.sandbox.paypal.com"

const sql = neon(process.env.DATABASE_URL!) // Initialize sql for database queries

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
    const error = await response.text()
    throw new Error(`PayPal auth failed: ${response.status} - ${error}`)
  }
  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const { productId, amount } = await request.json()
    console.log("🏦 Creating PayPal order for:", { productId, amount })

    // NEW: Fetch product display name
    const productDisplayName = await getProductDisplayName(productId)
    console.log("Fetched product display name:", productDisplayName)

    const accessToken = await getPayPalAccessToken()
    console.log("✅ Got PayPal access token")

    // PayPal doesn't support AED - always use USD for processing
    const AED_TO_USD_RATE = 0.27
    const currency = "USD"
    const convertedAmount = Math.round(amount * AED_TO_USD_RATE * 100) / 100
    console.log(`💱 Converting ${amount} AED to ${convertedAmount} USD`)

    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: productId, // Your internal product ID
          amount: {
            currency_code: currency,
            value: convertedAmount.toFixed(2),
          },
          // MODIFIED: Use productDisplayName in description
          description: `AMA Fashion - ${productDisplayName} (${amount} AED = ${convertedAmount} USD)`,
        },
      ],
      application_context: {
        brand_name: "AMA Fashion",
        landing_page: "BILLING", // 🎯 This forces the card payment page (guest checkout)
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING", // 🎯 Skip shipping since we handle it separately
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/payment-success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout`,
      },
    }
    console.log("📦 Creating order with data:", JSON.stringify(orderData, null, 2))
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
    console.log("📡 PayPal response status:", response.status)
    if (!response.ok) {
      const error = await response.json()
      console.error("❌ PayPal order creation failed:", error)
      throw new Error(`Order creation failed: ${JSON.stringify(error)}`)
    }
    const order = await response.json()
    console.log("✅ PayPal order created successfully:", order.id)
    return NextResponse.json(order)
  } catch (error) {
    console.error("❌ PayPal API Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
