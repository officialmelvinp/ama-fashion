import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe" // Use the shared Stripe instance

// NEW: Define a specific interface for the items received by this API route
interface StripeCheckoutItem {
  id: string
  name: string
  price: number // Numeric price (already extracted on client)
  quantity: number
  currency: string // 'aed' or 'gbp'
}

// Helper to extract numeric price from string (e.g., "100 AED" or "£75 GBP")
// This function is no longer strictly needed here if price is already numeric from client,
// but kept for robustness if the client-side mapping changes.
const extractNumericPrice = (priceString: string): number => {
  if (!priceString) return 0
  const match = priceString.match(/[\d.]+/)
  return match ? Number.parseFloat(match[0]) : 0
}

export async function POST(req: NextRequest) {
  try {
    // MODIFIED: Use the new StripeCheckoutItem type for cartItems
    const { cartItems, currency, customerInfo, success_url, cancel_url } = (await req.json()) as {
      cartItems: StripeCheckoutItem[] // Use the new type here
      currency: string
      customerInfo: any // You might want to define a more specific type for customerInfo
      success_url: string
      cancel_url: string
    }

    console.log("Received parameters for Stripe checkout:", {
      cartItems,
      currency,
      customerInfo,
    })

    if (!cartItems || cartItems.length === 0) {
      console.error("No items in cart for Stripe checkout session.")
      return new NextResponse("No items in cart.", { status: 400 })
    }

    // Map cart items to Stripe line items
    const lineItems = cartItems.map((item: StripeCheckoutItem, index) => {
      // Use StripeCheckoutItem here
      // Price is already numeric from the client, so use item.price directly
      const unitAmountInCents = Math.round(item.price * 100)

      // Add detailed logging for each item's quantity
      console.log(
        `Processing item ${index}: ${item.name}, quantity: ${item.quantity}, unitAmountInCents: ${unitAmountInCents}`,
      )

      // Ensure quantity is a number and greater than 0
      if (typeof item.quantity !== "number" || item.quantity <= 0) {
        console.error(`Invalid quantity for item ${item.name}: ${item.quantity}`)
        throw new Error(`Quantity for item ${item.name} is invalid or missing.`)
      }

      return {
        price_data: {
          currency: currency, // Use the session-level currency
          product_data: {
            name: item.name,
            // REMOVED: description and images as they are not directly available in StripeCheckoutItem
            // If you need these, you'll need to pass them from the client or fetch them here.
            metadata: {
              internal_product_id: item.id, // Store your internal product ID
            },
          },
          unit_amount: unitAmountInCents,
        },
        quantity: item.quantity, // MODIFIED: Use item.quantity (from client-side mapping)
      }
    })

    // Calculate total amount for metadata if needed, or rely on Stripe's sum
    const totalAmountForMetadata = lineItems.reduce((sum, item) => {
      return sum + (item.price_data.unit_amount || 0) * item.quantity
    }, 0)

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
      line_items: lineItems, // Use the dynamically generated line items
      mode: "payment",
      success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url,
      // Expand line_items to get product details in the session object
      expand: ["line_items.data.price.product"],
      // NEW: Add cart items and customer info to session metadata
      metadata: {
        cart_items_json: JSON.stringify(
          cartItems.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity, // Use item.quantity here
            price: item.price, // Use item.price here
            currency: item.currency, // Use item.currency here
          })),
        ),
        customer_info_json: JSON.stringify(customerInfo),
        total_amount_in_cents: totalAmountForMetadata,
      },
    })
    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Error creating Stripe Checkout Session:", error)
    // Return error message as plain text if it's a Stripe error, otherwise generic
    return new NextResponse(error.message || "Internal Server Error", { status: 500 })
  }
}
