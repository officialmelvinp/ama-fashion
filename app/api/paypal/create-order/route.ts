import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import type { CartItem } from "@/lib/types" // Import CartItem type

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

// Helper to extract numeric price from string (e.g., "100 AED" or "£75 GBP")
const extractNumericPrice = (priceString: string): number => {
  if (!priceString) return 0
  const match = priceString.match(/[\d.]+/)
  return match ? Number.parseFloat(match[0]) : 0
}

export async function POST(request: NextRequest) {
  try {
    const { cartItems, totalPrice } = (await request.json()) as { cartItems: CartItem[]; totalPrice: number }
    console.log("🏦 Creating PayPal order for:", { cartItems, totalPrice })

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    const accessToken = await getPayPalAccessToken()
    console.log("✅ Got PayPal access token")

    const AED_TO_USD_RATE = 0.27
    const GBP_TO_USD_RATE = 1.25 // Assuming a conversion rate for GBP to USD

    const paypalItems = cartItems.map((item: CartItem) => {
      const unitPrice = extractNumericPrice(item.selectedPrice)
      let convertedUnitPrice = 0
      if (item.selectedRegion === "UAE") {
        convertedUnitPrice = unitPrice * AED_TO_USD_RATE
      } else if (item.selectedRegion === "UK") {
        convertedUnitPrice = unitPrice * GBP_TO_USD_RATE
      }

      return {
        name: `${item.name} - ${item.subtitle}`,
        quantity: item.selectedQuantity.toString(),
        unit_amount: {
          currency_code: "USD",
          value: convertedUnitPrice.toFixed(2),
        },
        description: item.description,
        sku: item.id, // Use product ID as SKU
      }
    })

    // Calculate total converted amount for the purchase unit based on individual item prices
    const totalConvertedAmount = paypalItems.reduce((sum: number, item: any) => {
      return sum + Number.parseFloat(item.unit_amount.value) * Number.parseInt(item.quantity)
    }, 0)

    // Ensure the total amount passed to PayPal matches the sum of item amounts
    // This is crucial for PayPal's validation.
    const finalTotalAmount = totalConvertedAmount.toFixed(2)

    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: "AMA_CART_ORDER", // A general reference ID for the whole cart order
          amount: {
            currency_code: "USD",
            value: finalTotalAmount,
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: finalTotalAmount,
              },
            },
          },
          items: paypalItems,
          description: `AMA Fashion Order (${cartItems.length} items)`,
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
