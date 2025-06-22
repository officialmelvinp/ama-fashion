import { type NextRequest, NextResponse } from "next/server"

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!
const STRIPE_BASE_URL = "https://api.stripe.com/v1"

export async function POST(request: NextRequest) {
  try {
    const { productId, amount, customerInfo, currency = "aed", region = "UAE" } = await request.json()

    console.log("💳 Creating Stripe checkout for:", { productId, amount, currency, region })

    // Define shipping countries based on region
    const shippingCountries =
      region === "UAE"
        ? ["AE", "SA", "QA", "KW", "BH", "OM"] // Middle East
        : ["GB", "IE", "FR", "DE", "NL", "BE", "ES", "IT", "PT"] // Europe

    // Create base checkout data
    const checkoutData = new URLSearchParams({
      "payment_method_types[]": "card",
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout`,
      "line_items[0][price_data][currency]": currency.toLowerCase(),
      "line_items[0][price_data][product_data][name]": `AMA Fashion - ${productId}`,
      "line_items[0][price_data][unit_amount]": (amount * 100).toString(),
      "line_items[0][quantity]": "1",
      customer_email: customerInfo.email,
      billing_address_collection: "required",
    })

    // Add shipping countries
    shippingCountries.forEach((country) => {
      checkoutData.append("shipping_address_collection[allowed_countries][]", country)
    })

    console.log("📦 Creating Stripe checkout with data:", checkoutData.toString())

    const response = await fetch(`${STRIPE_BASE_URL}/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: checkoutData.toString(),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("❌ Stripe checkout creation failed:", error)
      throw new Error(`Stripe checkout failed: ${JSON.stringify(error)}`)
    }

    const session = await response.json()
    console.log("✅ Stripe checkout created successfully:", session.id)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("❌ Stripe API Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
