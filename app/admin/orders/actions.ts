"use server"
import { neon } from "@neondatabase/serverless"
import { revalidatePath } from "next/cache"
import { getOrderById } from "@/lib/inventory" // Import getOrderById
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "@/lib/email" // Import email functions
import type { OrderItemEmailData } from "@/lib/types" // Import the type


const sql = neon(process.env.DATABASE_URL!)

export async function handleShipOrder(
  orderId: string, // Changed from number to string
  trackingNumber: string,
  carrier: string,
  estimatedDelivery: string,
) {
  try {
    await sql`
      UPDATE orders
      SET
        shipping_status = 'Shipped', -- Use enum value
        tracking_number = ${trackingNumber},
        shipping_carrier = ${carrier},
        shipped_date = CURRENT_TIMESTAMP,
        estimated_delivery_date = ${estimatedDelivery || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId}
    `
    // Fetch updated order details to send email
    const order = await getOrderById(orderId)
    if (order) {
      const emailItems: OrderItemEmailData[] = order.items.map((item) => ({
        product_id: item.product_id,
        product_display_name: item.product_display_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency: item.currency,
      }))
      await sendOrderShippedEmail({
        customer_email: order.customer_email,
        customer_name: order.customer_name ?? null, // Use ?? null to handle undefined
        order_id: order.id.toString(),
        items: emailItems,
        total_amount: order.total_amount,
        currency: order.currency,
        // Removed payment_status and shipping_status as they are not part of OrderShippedEmailData
        tracking_number: order.tracking_number ?? null, // Use ?? null
        shipping_carrier: order.shipping_carrier ?? null, // Use ?? null
        estimated_delivery_date: order.estimated_delivery_date ?? null, // Use ?? null
        shipped_date: order.shipped_date ?? null, // Use ?? null
      })
    }
    revalidatePath("/admin/orders")
    return { success: true, message: `Order #${orderId} marked as shipped.` }
  } catch (error) {
    console.error("Error marking order as shipped:", error)
    return { success: false, error: "Failed to mark order as shipped." }
  }
}

export async function handleDeliverOrder(orderId: string) {
  // Changed from number to string
  try {
    await sql`
      UPDATE orders
      SET
        shipping_status = 'Delivered', -- Use enum value
        delivered_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId}
    `
    // Fetch updated order details to send email
    const order = await getOrderById(orderId)
    if (order) {
      const emailItems: OrderItemEmailData[] = order.items.map((item) => ({
        product_id: item.product_id,
        product_display_name: item.product_display_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency: item.currency,
      }))
      await sendOrderDeliveredEmail({
        customer_email: order.customer_email,
        customer_name: order.customer_name ?? null, // Use ?? null
        order_id: order.id.toString(),
        items: emailItems,
        total_amount: order.total_amount,
        currency: order.currency,
        // Removed payment_status and shipping_status as they are not part of OrderDeliveredEmailData
        delivered_date: order.delivered_date ?? null, // Use ?? null
      })
    }
    revalidatePath("/admin/orders")
    return { success: true, message: `Order #${orderId} marked as delivered.` }
  } catch (error) {
    console.error("Error marking order as delivered:", error)
    return { success: false, error: "Failed to mark order as delivered." }
  }
}

export async function resendOrderEmail(orderId: string, emailType: "shipped" | "delivered") {
  // Changed from number to string
  try {
    const order = await getOrderById(orderId)
    if (!order) {
      return { success: false, error: "Order not found." }
    }
    const emailItems: OrderItemEmailData[] = order.items.map((item) => ({
      product_id: item.product_id,
      product_display_name: item.product_display_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      currency: item.currency,
    }))
    if (emailType === "shipped") {
      await sendOrderShippedEmail({
        customer_email: order.customer_email,
        customer_name: order.customer_name ?? null, // Use ?? null
        order_id: order.id.toString(),
        items: emailItems,
        total_amount: order.total_amount,
        currency: order.currency,
        // Removed payment_status and shipping_status as they are not part of OrderShippedEmailData
        tracking_number: order.tracking_number ?? null, // Use ?? null
        shipping_carrier: order.shipping_carrier ?? null, // Use ?? null
        estimated_delivery_date: order.estimated_delivery_date ?? null, // Use ?? null
        shipped_date: order.shipped_date ?? null, // Use ?? null
      })
    } else if (emailType === "delivered") {
      await sendOrderDeliveredEmail({
        customer_email: order.customer_email,
        customer_name: order.customer_name ?? null, // Use ?? null
        order_id: order.id.toString(),
        items: emailItems,
        total_amount: order.total_amount,
        currency: order.currency,
        // Removed payment_status and shipping_status as they are not part of OrderDeliveredEmailData
        delivered_date: order.delivered_date ?? null, // Use ?? null
      })
    }
    return { success: true, message: `Email resent for order #${orderId}.` }
  } catch (error) {
    console.error(`Error resending ${emailType} email for order #${orderId}:`, error)
    return { success: false, error: `Failed to resend ${emailType} email.` }
  }
}
