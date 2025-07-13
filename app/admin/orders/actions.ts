"use server"

import { neon } from "@neondatabase/serverless"
import { getOrderById } from "@/lib/inventory" // This now includes getOrderById
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "@/lib/email" // This is the new email utility file
import { revalidatePath } from "next/cache" // Added revalidatePath for cache invalidation

const sql = neon(process.env.DATABASE_URL!)

export async function handleShipOrder(
  orderId: number,
  trackingNumber: string,
  shippingCarrier: string,
  estimatedDeliveryDate: string,
) {
  try {
    // Update order status in the database
    await sql`
      UPDATE orders
      SET
        shipping_status = 'shipped',
        tracking_number = ${trackingNumber},
        shipping_carrier = ${shippingCarrier},
        shipped_date = CURRENT_TIMESTAMP,
        estimated_delivery_date = ${estimatedDeliveryDate || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId}
    `

    // Fetch updated order details to send email.
    const updatedOrder = await getOrderById(orderId)

    if (updatedOrder) {
      await sendOrderShippedEmail({
        customer_email: updatedOrder.customer_email,
        customer_name: updatedOrder.customer_name,
        order_id: updatedOrder.id.toString(),
        items: updatedOrder.items, // Pass the items array
        total_amount: updatedOrder.total_amount, // Pass total amount
        currency: updatedOrder.currency, // Pass currency
        payment_status: updatedOrder.payment_status,
        shipping_status: "shipped",
        tracking_number: updatedOrder.tracking_number,
        shipping_carrier: updatedOrder.shipping_carrier,
        estimated_delivery_date: updatedOrder.estimated_delivery_date,
        shipped_date: updatedOrder.shipped_date,
      })
    }

    revalidatePath("/admin/orders") // Revalidate the admin orders page to show updated status
    return { success: true, message: `Order #${orderId} marked as shipped.` }
  } catch (error: any) {
    console.error("Error shipping order:", error)
    return { success: false, error: `Failed to ship order: ${error.message}` }
  }
}

export async function handleDeliverOrder(orderId: number) {
  try {
    // Update order status in the database
    await sql`
      UPDATE orders
      SET
        shipping_status = 'delivered',
        delivered_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId}
    `

    // Fetch updated order details to send email.
    const updatedOrder = await getOrderById(orderId)

    if (updatedOrder) {
      await sendOrderDeliveredEmail({
        customer_email: updatedOrder.customer_email,
        customer_name: updatedOrder.customer_name,
        order_id: updatedOrder.id.toString(),
        items: updatedOrder.items, // Pass the items array
        total_amount: updatedOrder.total_amount, // Pass total amount
        currency: updatedOrder.currency, // Pass currency
        payment_status: updatedOrder.payment_status,
        shipping_status: "delivered",
        delivered_date: updatedOrder.delivered_date,
      })
    }

    revalidatePath("/admin/orders") // Revalidate the admin orders page to show updated status
    return { success: true, message: `Order #${orderId} marked as delivered.` }
  } catch (error: any) {
    console.error("Error delivering order:", error)
    return { success: false, error: `Failed to deliver order: ${error.message}` }
  }
}

export async function resendOrderEmail(orderId: number, emailType: "shipped" | "delivered") {
  try {
    // Fetch order details, including product_display_name
    const order = await getOrderById(orderId)

    if (!order) {
      return { success: false, error: `Order #${orderId} not found.` }
    }

    let result
    if (emailType === "shipped") {
      result = await sendOrderShippedEmail({
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        order_id: order.id.toString(),
        items: order.items, // Pass the items array
        total_amount: order.total_amount, // Pass total amount
        currency: order.currency, // Pass currency
        payment_status: order.payment_status,
        shipping_status: order.shipping_status,
        tracking_number: order.tracking_number,
        shipping_carrier: order.shipping_carrier,
        estimated_delivery_date: order.estimated_delivery_date,
        shipped_date: order.shipped_date,
      })
    } else if (emailType === "delivered") {
      result = await sendOrderDeliveredEmail({
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        order_id: order.id.toString(),
        items: order.items, // Pass the items array
        total_amount: order.total_amount, // Pass total amount
        currency: order.currency, // Pass currency
        payment_status: order.payment_status,
        shipping_status: order.shipping_status,
        delivered_date: order.delivered_date,
      })
    } else {
      return { success: false, error: "Invalid email type specified." }
    }

    if (result?.success) {
      return { success: true, message: `Successfully resent ${emailType} email for order #${orderId}.` }
    } else {
      return { success: false, error: result?.message || `Failed to resend ${emailType} email for order #${orderId}.` }
    }
  } catch (error: any) {
    console.error(`Error resending ${emailType} email for order #${orderId}:`, error)
    return { success: false, error: `Failed to resend email: ${error.message}` }
  }
}
