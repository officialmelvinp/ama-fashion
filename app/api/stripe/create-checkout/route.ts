import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe" // Use the shared Stripe instance

export async function POST(req: NextRequest) {
  try {
    const { productId, productName, productPriceInCents, quantityOrdered, currency } = await req.json()

    console.log("Received parameters for Stripe checkout:", {
      productId, // Log the internal product ID
      productName,
      productPriceInCents,
      quantityOrdered,
      currency,
    })

    if (!productId || !productName || !productPriceInCents || !quantityOrdered || !currency) {
      console.error("Missing required parameters for checkout session. Received:", {
        productId,
        productName,
        productPriceInCents,
        quantityOrdered,
        currency,
      })
      return new NextResponse("Missing required parameters for checkout session.", { status: 400 })
    }

    const origin = req.headers.get("origin")

    const session = await stripe.checkout.sessions.create({
      phone_number_collection: {
        enabled: true,
      },
      shipping_address_collection: {
        allowed_countries: ["GB", "AE"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: currency,
            },
            display_name: "Standard shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
      ],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: productName,
              // Optionally, you can also pass your internal product_id here if you want Stripe to associate it
              // with its own product object, but metadata is more direct for your use case.
              // id: productId, // This would create a Stripe Product with your ID, but it's not always necessary.
            },
            unit_amount: productPriceInCents,
          },
          quantity: quantityOrdered,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      expand: ["line_items.data.price.product"],
      // NEW: Add your internal product_id to session metadata
      metadata: {
        internal_product_id: productId,
        product_name_for_display: productName, // Also store display name for convenience
      },
    })
    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Error creating Stripe Checkout Session:", error)
    return new NextResponse(error.message || "Internal Server Error", { status: 500 })
  }
}
