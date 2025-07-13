import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import nodemailer from "nodemailer"
import type { CartItem } from "@/lib/types" // Import CartItem type

const sql = neon(process.env.DATABASE_URL!)

// Email configuration - UPDATED HOST AND ADDED rejectUnauthorized
const transporter = nodemailer.createTransport({
  host: "premium169.web-hosting.com", // Corrected host
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Added to handle potential certificate issues
  },
})

// Helper function to get product display name from the database
async function getProductDisplayName(productId: string): Promise<string> {
  try {
    const result = await sql`
      SELECT product_name FROM products WHERE product_id = ${productId}
    `
    if (result.length > 0) {
      return result[0].product_name // Corrected to product_name
    }
    console.warn(`Product display name not found for ID: ${productId}. Using fallback.`)
    return `AMA Fashion Item (${productId})` // Fallback if not found
  } catch (error) {
    console.error(`Error fetching product display name for ${productId}:`, error)
    return `AMA Fashion Item (${productId})` // Fallback on error
  }
}

// MODIFIED: recordOrder now accepts an array of CartItem and customerInfo
async function recordOrder(orderData: {
  payment_id: string
  customer_email: string
  customer_name: string
  shipping_address: string
  phone_number: string
  notes: string
  order_type: string
  order_status: string
  shipping_status: string
  total_amount: number
  currency: string
  items: {
    productId: string
    quantity: number
    price: number
    currency: string
    productDisplayName: string // Added for convenience in recording
  }[]
}) {
  try {
    // Check if an order with this payment_id already exists
    const existingOrder = await sql`
      SELECT id FROM orders WHERE payment_id = ${orderData.payment_id}
    `
    if (existingOrder.length > 0) {
      console.log(`Order with payment_id ${orderData.payment_id} already exists. Skipping insertion.`)
      return existingOrder[0].id // Return existing order ID
    }

    // Construct notes based on all items
    const allProductNames = orderData.items.map((item) => item.productDisplayName).join(", ")
    const totalQuantityOrdered = orderData.items.reduce((sum, item) => sum + item.quantity, 0)
    const detailedNotes =
      `Stripe payment completed. Session ID: ${orderData.payment_id}. Items: ${allProductNames}. Total Quantity: ${totalQuantityOrdered}. ${orderData.notes || ""}`.trim()

    // Insert into the main 'orders' table
    const result = await sql`
      INSERT INTO orders (
        customer_email, customer_name, payment_status, payment_id,
        total_amount, currency, shipping_address, phone_number, notes,
        order_type, order_status, shipping_status
      ) VALUES (
        ${orderData.customer_email}, ${orderData.customer_name},
        ${orderData.order_status}, ${orderData.payment_id}, ${orderData.total_amount},
        ${orderData.currency}, ${orderData.shipping_address}, ${orderData.phone_number},
        ${detailedNotes}, ${orderData.order_type}, ${orderData.order_status},
        ${orderData.shipping_status}
      ) RETURNING id
    `
    const orderId = result[0].id

    // Insert each item into the 'order_items' table and update 'product_inventory'
    for (const item of orderData.items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, product_display_name, quantity, unit_price, currency)
        VALUES (${orderId}, ${item.productId}, ${item.productDisplayName}, ${item.quantity}, ${item.price}, ${item.currency})
      `
      // Update individual product inventory
      await sql`
        UPDATE product_inventory
        SET quantity_available = GREATEST(0, quantity_available - ${item.quantity}),
            updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ${item.productId}
      `
    }

    return orderId
  } catch (error) {
    console.error("Database error:", error)
    throw error
  }
}

// MODIFIED: sendOrderEmails now accepts an array of CartItem
async function sendOrderEmails(orderData: any, cartItems: CartItem[]) {
  try {
    console.log("Attempting to send customer email...") // Added log

    const itemsHtml = cartItems
      .map(
        (item) => `
      <li>
        <strong>${item.name}</strong> (${item.subtitle}) - ${item.selectedQuantity} x ${item.selectedPrice}
      </li>
    `,
      )
      .join("")

    // Customer email
    const customerEmail = {
      from: '"AMA Fashion" <support@amariahco.com>',
      to: orderData.customer_email,
      subject: "🎉 Payment Confirmed - Your AMA Order",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f3ea; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #2c2824; font-family: serif; text-align: center; margin-bottom: 30px;">
              Thank You for Your Order! 🎉
            </h1>
            <div style="background: #f8f3ea; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2c2824; margin-top: 0;">Order Details:</h3>
              <p><strong>Order ID:</strong> ${orderData.payment_id}</p>
              <p><strong>Total Amount:</strong> ${orderData.amount_paid} ${orderData.currency}</p>
              <p><strong>Payment Status:</strong> ✅ Confirmed</p>
              <p><strong>Payment Method:</strong> Stripe</p>
              <h4>Items:</h4>
              <ul>${itemsHtml}</ul>
            </div>
            <div style="background: #2c2824; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">What's Next?</h3>
              <p>📱 We'll contact you via WhatsApp within 24 hours to confirm your order details and arrange delivery.</p>
              <p>📦 Your beautiful AMA piece will be prepared with love and care.</p>
              <p>🚚 We'll coordinate delivery to your address.</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #2c2824; font-style: italic;">
                "Conscious luxury. Spiritually rooted. Intentionally crafted."
              </p>
            </div>
            <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
              <p>AMA Fashion - Conscious Luxury African Fashion</p>
              <p>Dubai & UK | support@amariahco.com</p>
            </div>
          </div>
        </div>
      `,
    }
    await transporter.sendMail(customerEmail)
    console.log("Customer email sent successfully.") // Added log

    console.log("Attempting to send vendor email...") // Added log
    // Vendor email
    const vendorEmail = {
      from: '"AMA Orders" <support@amariahco.com>',
      to: "support@amariahco.com",
      subject: `🎉 New Stripe Order: ${orderData.amount_paid} ${orderData.currency} (${cartItems.length} items)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c2824;">🎉 New Stripe Order Received!</h1>
          <div style="background: #f8f3ea; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Information:</h3>
            <p><strong>Payment ID:</strong> ${orderData.payment_id}</p>
            <p><strong>Total Amount:</strong> ${orderData.amount_paid} ${orderData.currency}</p>
            <p><strong>Order Type:</strong> ${orderData.order_type}</p>
            <p><strong>Payment Method:</strong> Stripe</p>
            <h4>Items:</h4>
            <ul>${itemsHtml}</ul>
          </div>
          <div style="background: #2c2824; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Customer Details:</h3>
            <p><strong>Name:</strong> ${orderData.customer_name}</p>
            <p><strong>Email:</strong> ${orderData.customer_email}</p>
            <p><strong>Phone:</strong> ${orderData.phone_number || "Not provided"}</p>
            <p><strong>Address:</strong> ${orderData.shipping_address || "Not provided"}</p>
          </div>
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c2824; margin-top: 0;">Action Items:</h3>
            <p>✅ Contact customer via WhatsApp within 24 hours</p>
            <p>✅ Confirm order details and delivery preferences</p>
            <p>✅ Prepare the order for delivery</p>
            <p>✅ Update order status in admin panel</p>
          </div>
        </div>
      `,
    }
    await transporter.sendMail(vendorEmail)
    console.log("Vendor email sent successfully.") // Added log
    console.log("✅ Stripe order emails sent successfully")
  } catch (error) {
    console.error("❌ Email sending failed:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, customerInfo } = await request.json()
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }
    console.log("🔍 Verifying Stripe session:", sessionId)
    console.log("👤 Customer info received:", customerInfo)

    // Retrieve the session from Stripe
    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=line_items.data.price.product`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY!}`,
        },
      },
    )
    if (!response.ok) {
      const error = await response.json()
      console.error("❌ Stripe session verification failed:", error)
      throw new Error(`Stripe verification failed: ${JSON.stringify(error)}`)
    }
    const session = await response.json()
    console.log("✅ Stripe session verified successfully")

    // MODIFIED: Retrieve cart_items_json from session metadata
    const cartItemsJson = session.metadata?.cart_items_json
    let cartItems: CartItem[] = []
    if (cartItemsJson) {
      try {
        cartItems = JSON.parse(cartItemsJson) as CartItem[]
        console.log("Verify Session: Parsed cart items from metadata:", cartItems)
      } catch (parseError) {
        console.error("Error parsing cart_items_json from metadata:", parseError)
      }
    }

    if (cartItems.length === 0) {
      console.warn(
        "No cart items found in session metadata. This might indicate an issue or a single-item legacy flow.",
      )
      // Fallback for single item if needed, or throw error
      // For now, we'll proceed with an empty cartItems array, which will affect order recording.
    }

    // Prepare items for database recording and email sending
    const itemsForProcessing = await Promise.all(
      cartItems.map(async (item) => {
        const productDisplayName = await getProductDisplayName(item.id)
        return {
          productId: item.id,
          quantity: item.selectedQuantity,
          price: Number.parseFloat(item.selectedPrice.match(/[\d.]+/)?.[0] || "0"), // Extract numeric price
          currency: item.selectedRegion === "UAE" ? "AED" : "GBP",
          productDisplayName: productDisplayName,
        }
      }),
    )

    const customerName =
      session.customer_details?.name ||
      (customerInfo?.firstName && customerInfo?.lastName
        ? `${customerInfo.firstName} ${customerInfo.lastName}`
        : "Customer")
    const customerPhone =
      session.customer_details?.phone ||
      customerInfo?.phone ||
      (customerInfo?.firstName ? "Phone not provided during checkout" : "")

    const orderData = {
      payment_id: session.payment_intent || session.id,
      customer_email: session.customer_details?.email || customerInfo?.email || "",
      customer_name: customerName,
      shipping_address: session.customer_details?.address
        ? `${session.customer_details.address.line1 || ""}${session.customer_details.address.line2 ? ", " + session.customer_details.address.line2 : ""}${session.customer_details.address.city ? ", " + session.customer_details.address.city : ""}${session.customer_details.address.state ? ", " + session.customer_details.address.state : ""}${session.customer_details.address.postal_code ? ", " + session.customer_details.address.postal_code : ""}${session.customer_details.address.country ? ", " + session.customer_details.address.country : ""}`
            .trim()
            .replace(/^, /, "") // Clean up leading comma if line1 is empty
        : customerInfo?.address && customerInfo?.city && customerInfo?.country
          ? `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.country}${customerInfo.postalCode ? ", " + customerInfo.postalCode : ""}`
          : "",
      phone_number: customerPhone,
      notes: `Stripe payment completed. Session ID: ${session.id}.`, // Notes will be detailed by recordOrder
      order_type: "purchase",
      order_status: "completed", // Use 'completed' for successful payments
      shipping_status: "paid", // Start with "paid" status
      total_amount: (session.amount_total ?? 0) / 100, // Convert from cents
      currency: (session.currency ?? "GBP").toUpperCase(),
      items: itemsForProcessing, // Pass the processed items array
    }
    console.log("Verify Session: Final orderData before DB/Email:", orderData)
    console.log("💾 Recording order data:", orderData)

    // Record order in database
    const orderId = await recordOrder(orderData)

    // Send email notifications - MODIFIED to pass cartItems
    await sendOrderEmails(orderData, cartItems)

    return NextResponse.json({
      success: true,
      orderId: orderId, // Return the actual order ID from DB
      message: "Stripe order processed and notifications sent!",
    })
  } catch (error) {
    console.error("❌ Stripe session verification error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Session verification failed" },
      { status: 500 },
    )
  }
}
