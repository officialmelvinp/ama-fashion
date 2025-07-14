import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import type { CartItem } from "@/lib/types" // Ensure CartItem is imported

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

export async function POST(request: NextRequest) {
  try {
    const { cartItems, customerInfo } = (await request.json()) as {
      cartItems: CartItem[] // Use the CartItem type
      customerInfo: any // Define a more specific type for customerInfo if available
    }

    console.log("Received parameters for Stripe checkout:", {
      cartItems,
      customerInfo,
    })

    if (!cartItems || cartItems.length === 0) {
      console.error("No items in cart for Stripe checkout session.")
      return new NextResponse("No items in cart.", { status: 400 })
    }

    // Prepare line items for Stripe
    const lineItems = cartItems.map((item: CartItem) => {
      const priceNumeric = Number.parseFloat(item.selectedPrice.match(/[\d.]+/)?.[0] || "0")
      const currency = item.selectedRegion === "UAE" ? "aed" : "gbp"

      // Ensure quantity is a number and greater than 0
      if (typeof item.selectedQuantity !== "number" || item.selectedQuantity <= 0) {
        console.error(`Invalid quantity for item ${item.name}: ${item.selectedQuantity}`)
        throw new Error(`Quantity for item ${item.name} is invalid or missing.`)
      }

      // Construct absolute image URL
      const imageUrl =
        item.images && item.images.length > 0
          ? `${request.nextUrl.origin}${item.images[0]}` // Convert relative path to absolute URL
          : undefined // Or provide a default placeholder URL if no image

      console.log(
        `Processing item: ${item.name}, quantity: ${item.selectedQuantity}, unitAmountInCents: ${Math.round(
          priceNumeric * 100,
        )}, imageUrl: ${imageUrl}`,
      )

      return {
        price_data: {
          currency: currency,
          product_data: {
            name: item.name,
            description: item.subtitle,
            images: imageUrl ? [imageUrl] : [], // Use the absolute URL
            metadata: {
              internal_product_id: item.id, // Store your internal product ID
            },
          },
          unit_amount: Math.round(priceNumeric * 100), // Convert to cents
        },
        quantity: item.selectedQuantity,
      }
    })

    // --- MODIFIED: Simplify cart_items_json in metadata ---
    const simplifiedCartItems = cartItems.map((item) => ({
      id: item.id,
      qty: item.selectedQuantity,
      region: item.selectedRegion,
    }))
    // --- END MODIFIED ---

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${request.nextUrl.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/cancel`,
      phone_number_collection: {
        enabled: true,
      },
      shipping_address_collection: {
        allowed_countries: ["GB", "AE", "US", "CA", "AU", "DE", "FR", "IE", "NL", "SG"], // Add countries as needed
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: lineItems[0]?.price_data.currency || "aed", // Use currency from first item or default
            },
            display_name: "Standard shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
      ],
      // Store the simplified cartItems array in metadata
      metadata: {
        cart_items_json: JSON.stringify(simplifiedCartItems), // Use simplified version
        customer_info_json: JSON.stringify(customerInfo), // Also store customer info for webhook
      },
      customer_email: customerInfo?.email, // Pre-fill customer email
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Error creating Stripe Checkout Session:", error)
    return new NextResponse(error.message || "Internal Server Error", { status: 500 })
  }
}
