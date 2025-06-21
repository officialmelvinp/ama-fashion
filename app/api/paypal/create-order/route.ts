import { type NextRequest, NextResponse } from "next/server"

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

    const accessToken = await getPayPalAccessToken()
    console.log("✅ Got PayPal access token")

    // Convert AED to USD for sandbox testing (approximate rate: 1 AED = 0.27 USD)
    const isProduction = process.env.PAYPAL_MODE === "live"
    const currency = isProduction ? "AED" : "USD"
    const convertedAmount = isProduction ? amount : Math.round(amount * 0.27)

    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: productId,
          amount: {
            currency_code: currency,
            value: convertedAmount.toString(),
          },
          description: `AMA Fashion - ${productId}`,
        },
      ],
      application_context: {
        brand_name: "AMA Fashion",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
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
