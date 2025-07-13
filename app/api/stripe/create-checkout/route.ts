import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe" // Use the shared Stripe instance

export async function POST(req: NextRequest) {
  try {
    const { productName, productPriceInCents, quantityOrdered, currency } = await req.json()

    // --- ADDED DETAILED LOGGING FOR DEBUGGING CURRENCY ---
    console.log("Received parameters for Stripe checkout:", {
      productName,
      productPriceInCents,
      quantityOrdered,
      currency, // Log the currency received from the frontend
    })
    // --- END ADDED DETAILED LOGGING ---

    if (!productName || !productPriceInCents || !quantityOrdered || !currency) {
      console.error("Missing required parameters for checkout session. Received:", {
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
      line_items: [
        {
          price_data: {
            currency: currency, // Use the dynamic currency here
            product_data: {
              name: productName,
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
    })
    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Error creating Stripe Checkout Session:", error)
    return new NextResponse(error.message || "Internal Server Error", { status: 500 })
  }
}
