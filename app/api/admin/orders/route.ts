import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import type { OrderItemEmailData } from "@/lib/types" 
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "@/lib/email"
import { getOrderById, getOrders } from "@/lib/inventory" //import path to include getOrders

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const orders = await getOrders()
    return NextResponse.json({ orders }, { status: 200 })
  } catch (error) {
    console.error("Error fetching orders from API route:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
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

    // Update the order in the database
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

    // Fetch the updated order details using getOrderById, which includes the 'items' array
    const order = await getOrderById(orderId)

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found after update" }, { status: 404 })
    }

    // Construct the 'items' array for email using the 'items' property of the fetched order.
    // This 'items' array comes from the order_items table and is already correctly typed as OrderItem[].
    const emailItems: OrderItemEmailData[] = order.items.map((item) => ({
      product_id: item.product_id, 
      product_display_name: item.product_display_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      currency: item.currency,
    }))

    if (action === "mark_shipped") {
      await sendOrderShippedEmail({
        customer_email: order.customer_email,
        customer_name: order.customer_name ?? null, 
        order_id: order.id.toString(),
        items: emailItems,
        total_amount: order.total_amount,
        currency: order.currency,
        tracking_number: order.tracking_number ?? null,
        shipping_carrier: order.shipping_carrier ?? null, 
        estimated_delivery_date: order.estimated_delivery_date ?? null, 
        shipped_date: order.shipped_date ?? null,
      })
    } else if (action === "mark_delivered") {
      await sendOrderDeliveredEmail({
        customer_email: order.customer_email,
        customer_name: order.customer_name ?? null, 
        order_id: order.id.toString(),
        items: emailItems,
        total_amount: order.total_amount,
        currency: order.currency,
        delivered_date: order.delivered_date ?? null, 
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
