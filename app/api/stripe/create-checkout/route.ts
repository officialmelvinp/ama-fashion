import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

// Define the expected structure of cart items coming from the frontend
interface IncomingCheckoutItem {
  productId: string
  quantity: number
  price: number // This is the direct price amount
  name: string
  image?: string // Optional, as it might be undefined
  currency: string // This is the direct currency code
}

export async function POST(request: NextRequest) {
  try {
    const { cartItems, customerInfo, region } = (await request.json()) as {
      cartItems: IncomingCheckoutItem[] // Use the new IncomingCheckoutItem type
      customerInfo: {
        firstName: string
        lastName: string
        email: string
        phone: string
        address: string
        city: string
        country: string
        postalCode: string
        notes: string
      }
      region: "UAE" | "UK"
    }

    console.log("Received parameters for Stripe checkout:", {
      cartItems,
      customerInfo,
      region,
    })

    if (!cartItems || cartItems.length === 0) {
      console.error("No items in cart for Stripe checkout session.")
      return new NextResponse("No items in cart.", { status: 400 })
    }

    // Prepare line items for Stripe
    const lineItems = cartItems.map((item: IncomingCheckoutItem) => {
      const priceNumeric = item.price // Access the 'price' property directly
      const currency = item.currency.toLowerCase() // Access the 'currency' property directly and convert to lowercase for Stripe

      // Ensure quantity is a number and greater than 0
      if (typeof item.quantity !== "number" || item.quantity <= 0) {
        console.error(`Invalid quantity for item ${item.name}: ${item.quantity}`)
        throw new Error(`Quantity for item ${item.name} is invalid or missing.`)
      }
      
      
      
    // Construct absolute image URL safely
      const imageUrl =
      item.image && item.image.length > 0
      ? item.image.startsWith("http")
      ? item.image // ✅ already a full URL (Blob, CDN, etc.)
      : `${request.nextUrl.origin}${item.image}` // ✅ relative path case
    : undefined


      // Construct absolute image URL
      // const imageUrl =
        // item.image && item.image.length > 0
          // ? `${request.nextUrl.origin}${item.image}` // Use the direct image URL
          // : undefined // Or provide a default placeholder URL if no image

      console.log(
        `Processing item: ${item.name}, quantity: ${item.quantity}, unitAmountInCents: ${Math.round(
          priceNumeric * 100,
        )}, imageUrl: ${imageUrl}`,
      )

      return {
        price_data: {
          currency: currency,
          product_data: {
            name: item.name,
            description: item.name, // Using name as description for simplicity, adjust if subtitle is needed
            images: imageUrl ? [imageUrl] : [], // Use the absolute URL
            metadata: {
              internal_product_id: item.productId, // Store your internal product ID
            },
          },
          unit_amount: Math.round(priceNumeric * 100), // Convert to cents
        },
        quantity: item.quantity,
      }
    })

    // Simplify cartItems for metadata storage
    const simplifiedCartItems = cartItems.map((item) => ({
      id: item.productId,
      qty: item.quantity,
      region: region, // Use the region passed in the request body
    }))

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
