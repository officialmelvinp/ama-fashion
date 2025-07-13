import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import type { Order } from "@/lib/types"
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "@/lib/email"

const sql = neon(process.env.DATABASE_URL!)

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

export async function GET(request: Request) {
  try {
    // MODIFIED: Join with product_inventory to get product_display_name
    const orders = (await sql`
      SELECT
        o.id, o.product_id, p.product_name AS product_display_name, o.customer_email, o.customer_name, o.quantity_ordered,
        o.quantity_in_stock, o.quantity_preorder, o.payment_status, o.payment_id,
        o.amount_paid, o.currency, o.shipping_address, o.phone_number, o.notes,
        o.order_type, o.order_status, o.total_amount, o.shipping_status,
        o.tracking_number, o.shipping_carrier, o.shipped_date, o.delivered_date,
        o.estimated_delivery_date, o.created_at, o.updated_at
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.product_id
      ORDER BY o.created_at DESC
    `) as Order[]
    return NextResponse.json({ orders }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { orderId, action, trackingNumber, carrier, estimatedDelivery } = await request.json()
    let updateData: any = {}

    if (action === "mark_shipped") {
      updateData = {
        shipping_status: "shipped",
        shipped_date: new Date().toISOString(),
        tracking_number: trackingNumber || null,
        shipping_carrier: carrier || null,
        estimated_delivery_date: estimatedDelivery || null,
      }
    } else if (action === "mark_delivered") {
      updateData = {
        shipping_status: "delivered",
        delivered_date: new Date().toISOString(),
      }
    }

    // Update the order
    await sql`
      UPDATE orders
      SET
        shipping_status = ${updateData.shipping_status},
        ${
          action === "mark_shipped"
            ? sql`
            shipped_date = ${updateData.shipped_date},
            tracking_number = ${updateData.tracking_number},
            shipping_carrier = ${updateData.shipping_carrier},
            estimated_delivery_date = ${updateData.estimated_delivery_date},
            updated_at = CURRENT_TIMESTAMP
          `
            : sql`
            delivered_date = ${updateData.delivered_date},
            updated_at = CURRENT_TIMESTAMP
          `
        }
      WHERE id = ${orderId}
    `

    // NEW: Fetch the updated order with product_display_name for email sending
    const updatedOrderResult = await sql`
      SELECT
        o.id, o.product_id, p.product_name AS product_display_name, o.customer_email, o.customer_name, o.quantity_ordered,
        o.quantity_in_stock, o.quantity_preorder, o.payment_status, o.payment_id,
        o.amount_paid, o.currency, o.shipping_address, o.phone_number, o.notes,
        o.order_type, o.order_status, o.total_amount, o.shipping_status,
        o.tracking_number, o.shipping_carrier, o.shipped_date, o.delivered_date,
        o.estimated_delivery_date, o.created_at, o.updated_at
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.product_id
      WHERE o.id = ${orderId}
    `

    if (updatedOrderResult.length === 0) {
      return NextResponse.json({ success: false, error: "Order not found after update" }, { status: 404 })
    }

    const order = updatedOrderResult[0] as Order // Cast to Order type for type safety

    // Send email notification to customer using the centralized email utility
    if (action === "mark_shipped") {
      await sendOrderShippedEmail({
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        order_id: order.id.toString(),
        product_name: order.product_display_name || order.product_id, // Use display name
        quantity_ordered: order.quantity_ordered,
        amount_paid: order.amount_paid,
        currency: order.currency,
        payment_status: order.payment_status,
        shipping_status: "shipped",
        tracking_number: order.tracking_number,
        shipping_carrier: order.shipping_carrier,
        estimated_delivery_date: order.estimated_delivery_date,
        shipped_date: order.shipped_date,
      })
    } else if (action === "mark_delivered") {
      await sendOrderDeliveredEmail({
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        order_id: order.id.toString(),
        product_name: order.product_display_name || order.product_id, // Use display name
        quantity_ordered: order.quantity_ordered,
        amount_paid: order.amount_paid,
        currency: order.currency,
        payment_status: order.payment_status,
        shipping_status: "delivered",
        delivered_date: order.delivered_date,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Order ${action === "mark_shipped" ? "marked as shipped" : "marked as delivered"}`,
      order: order, // Return the full updated order with display name
    })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update order",
      },
      { status: 500 },
    )
  }
}
