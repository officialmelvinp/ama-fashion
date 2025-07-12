import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import type { Order } from "@/lib/types"
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "@/lib/email" // Import email utilities

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const orders = (await sql`
      SELECT
        id, product_id, customer_email, customer_name, quantity_ordered,
        quantity_in_stock, quantity_preorder, payment_status, payment_id,
        amount_paid, currency, shipping_address, phone_number, notes,
        order_type, order_status, total_amount, shipping_status,
        tracking_number, shipping_carrier, shipped_date, delivered_date,
        estimated_delivery_date, created_at, updated_at
      FROM orders
      ORDER BY created_at DESC
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
    const result = await sql`
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
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const order = result[0] as Order // Cast to Order type for type safety

    // Send email notification to customer using the centralized email utility
    if (action === "mark_shipped") {
      await sendOrderShippedEmail({
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        order_id: order.id.toString(),
        product_name: order.product_id, // Assuming product_id is sufficient
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
        product_name: order.product_id, // Assuming product_id is sufficient
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
      order: result[0],
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
