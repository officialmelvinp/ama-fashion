import Stripe from "stripe"
import { NextResponse } from "next/server"

// Initialize Stripe with your secret key and a standard, recent API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Reverting to "2025-06-30.basil" to satisfy your local TypeScript environment.
  // WARNING: This is not a standard Stripe API version and might cause runtime issues.
  // The long-term fix is to clear your node_modules and reinstall dependencies.
  apiVersion: "2025-06-30.basil",
})

export async function POST(req: Request) {
  try {
    const { productName, productPriceInCents, quantityOrdered, success_url, cancel_url } = await req.json()

    // --- ADDED LOGGING FOR DEBUGGING ---
    console.log("Received parameters for Stripe checkout:", {
      productName,
      productPriceInCents,
      quantityOrdered,
      success_url,
      cancel_url,
    })
    // --- END ADDED LOGGING ---

    if (!productName || !productPriceInCents || !quantityOrdered || !success_url || !cancel_url) {
      console.error("Missing required parameters for checkout session. Received:", {
        productName,
        productPriceInCents,
        quantityOrdered,
        success_url,
        cancel_url,
      })
      return new NextResponse("Missing required parameters for checkout session.", { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      phone_number_collection: {
        enabled: true, // Ensures phone number is collected during checkout
      },
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: productName, // Passes the full product name to Stripe
            },
            unit_amount: productPriceInCents, // Price in cents
          },
          quantity: quantityOrdered,
        },
      ],
      mode: "payment",
      success_url: success_url,
      cancel_url: cancel_url,
      expand: ["line_items.data.price.product"], // Crucial for webhook to get product details
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Error creating Stripe Checkout Session:", error)
    return new NextResponse(error.message || "Internal Server Error", { status: 500 })
  }
}
