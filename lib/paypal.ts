// PayPal Integration for AMA Fashion
// Complete implementation for when client provides API keys

// PayPal Configuration
const PAYPAL_CONFIG = {
  // Your client will provide these from her PayPal Business account
  CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "your-paypal-client-id-here",
  CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || "your-paypal-client-secret-here",

  // Use sandbox for testing, live for production
  BASE_URL: process.env.NODE_ENV === "production" ? "https://api.paypal.com" : "https://api.sandbox.paypal.com",
}

// Get PayPal access token
async function getPayPalAccessToken(): Promise<string> {
  try {
    const auth = Buffer.from(`${PAYPAL_CONFIG.CLIENT_ID}:${PAYPAL_CONFIG.CLIENT_SECRET}`).toString("base64")

    const response = await fetch(`${PAYPAL_CONFIG.BASE_URL}/v1/oauth2/token`, {
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
  } catch (error) {
    console.error("PayPal authentication error:", error)
    throw error
  }
}

// Create PayPal order
export async function createPayPalOrder(productId: string, amount: number) {
  try {
    const accessToken = await getPayPalAccessToken()

    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: productId,
          amount: {
            currency_code: "AED",
            value: amount.toString(),
          },
          description: `AMA Fashion - ${productId}`,
          custom_id: `AMA_${Date.now()}`,
        },
      ],
      application_context: {
        brand_name: "AMA Fashion",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${typeof window !== "undefined" ? window.location.origin : ""}/payment-success`,
        cancel_url: `${typeof window !== "undefined" ? window.location.origin : ""}/checkout`,
      },
    }

    const response = await fetch(`${PAYPAL_CONFIG.BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("PayPal order creation failed:", errorData)
      throw new Error(`PayPal order creation failed: ${response.status}`)
    }

    const order = await response.json()
    console.log("PayPal order created successfully:", order.id)
    return order
  } catch (error) {
    console.error("PayPal order creation error:", error)

    // Fallback for development/testing when PayPal is not configured
    if (process.env.NODE_ENV === "development") {
      console.log("Using development fallback for PayPal")
      const orderId = `AMA_DEV_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`

      return {
        id: orderId,
        status: "CREATED",
        links: [
          {
            href: `/payment-success?orderId=${orderId}`,
            rel: "approve",
            method: "GET",
          },
        ],
      }
    }

    throw error
  }
}

// Capture PayPal payment
export async function capturePayPalOrder(orderId: string) {
  try {
    const accessToken = await getPayPalAccessToken()

    const response = await fetch(`${PAYPAL_CONFIG.BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("PayPal capture failed:", errorData)
      throw new Error(`PayPal capture failed: ${response.status}`)
    }

    const result = await response.json()
    console.log("PayPal payment captured successfully:", result.id)
    return result
  } catch (error) {
    console.error("PayPal capture error:", error)

    // Fallback for development
    if (process.env.NODE_ENV === "development") {
      return {
        id: orderId,
        status: "COMPLETED",
        payer: {
          email_address: "customer@example.com",
        },
      }
    }

    throw error
  }
}
