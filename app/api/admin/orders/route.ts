import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import nodemailer from "nodemailer"

const sql = neon(process.env.DATABASE_URL!)

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function GET() {
  try {
    const orders = await sql`
      SELECT 
        id,
        product_id,
        customer_email,
        customer_name,
        quantity_ordered,
        quantity_in_stock,
        quantity_preorder,
        payment_status,
        payment_id,
        amount_paid,
        currency,
        shipping_address,
        phone_number,
        notes,
        shipping_status,
        tracking_number,
        shipped_date,
        delivered_date,
        shipping_carrier,
        estimated_delivery_date,
        created_at
      FROM orders 
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      orders,
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
        orders: [],
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { orderId, action, trackingNumber, carrier, estimatedDelivery } = await request.json()

    let updateData: any = {}
    let emailSubject = ""
    let emailContent = ""

    if (action === "mark_shipped") {
      updateData = {
        shipping_status: "shipped",
        shipped_date: new Date().toISOString(),
        tracking_number: trackingNumber || null,
        shipping_carrier: carrier || null,
        estimated_delivery_date: estimatedDelivery || null,
      }
      emailSubject = "Your AMA Fashion Order Has Been Shipped! 📦"
    } else if (action === "mark_delivered") {
      updateData = {
        shipping_status: "delivered",
        delivered_date: new Date().toISOString(),
      }
      emailSubject = "Your AMA Fashion Order Has Been Delivered! ✨"
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
          estimated_delivery_date = ${updateData.estimated_delivery_date}
        `
            : sql`
          delivered_date = ${updateData.delivered_date}
        `
        }
      WHERE id = ${orderId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const order = result[0]

    // Send email notification to customer
    if (action === "mark_shipped") {
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f3ea; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #2c2824; text-align: center; margin-bottom: 30px;">Your Order is On Its Way! 📦</h1>
            
            <p style="color: #2c2824; font-size: 16px;">Dear ${order.customer_name},</p>
            
            <p style="color: #2c2824; font-size: 16px;">Great news! Your AMA Fashion order has been shipped and is on its way to you.</p>
            
            <div style="background-color: #f8f3ea; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2c2824; margin-top: 0;">Shipping Details</h3>
              <p style="color: #2c2824; margin: 5px 0;"><strong>Order #:</strong> ${order.id}</p>
              <p style="color: #2c2824; margin: 5px 0;"><strong>Product:</strong> ${order.product_id}</p>
              ${trackingNumber ? `<p style="color: #2c2824; margin: 5px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ""}
              ${carrier ? `<p style="color: #2c2824; margin: 5px 0;"><strong>Carrier:</strong> ${carrier}</p>` : ""}
              ${estimatedDelivery ? `<p style="color: #2c2824; margin: 5px 0;"><strong>Estimated Delivery:</strong> ${new Date(estimatedDelivery).toLocaleDateString()}</p>` : ""}
            </div>
            
            <p style="color: #2c2824; font-size: 16px;">We'll notify you again once your order has been delivered. If you have any questions, feel free to contact us on WhatsApp.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #2c2824; font-size: 14px;">Thank you for choosing AMA Fashion!</p>
              <p style="color: #2c2824; font-size: 14px;">Contact us: <a href="https://wa.me/971501234567" style="color: #2c2824;">WhatsApp</a></p>
            </div>
          </div>
        </div>
      `
    } else if (action === "mark_delivered") {
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f3ea; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #2c2824; text-align: center; margin-bottom: 30px;">Your Order Has Been Delivered! ✨</h1>
            
            <p style="color: #2c2824; font-size: 16px;">Dear ${order.customer_name},</p>
            
            <p style="color: #2c2824; font-size: 16px;">Wonderful! Your AMA Fashion order has been successfully delivered.</p>
            
            <div style="background-color: #f8f3ea; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2c2824; margin-top: 0;">Order Details</h3>
              <p style="color: #2c2824; margin: 5px 0;"><strong>Order #:</strong> ${order.id}</p>
              <p style="color: #2c2824; margin: 5px 0;"><strong>Product:</strong> ${order.product_id}</p>
              <p style="color: #2c2824; margin: 5px 0;"><strong>Delivered:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p style="color: #2c2824; font-size: 16px;">We hope you love your new AMA Fashion piece! If you have any questions or concerns, please don't hesitate to contact us.</p>
            
            <p style="color: #2c2824; font-size: 16px;">We'd love to see you wearing your new outfit - tag us on social media!</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #2c2824; font-size: 14px;">Thank you for choosing AMA Fashion!</p>
              <p style="color: #2c2824; font-size: 14px;">Contact us: <a href="https://wa.me/971501234567" style="color: #2c2824;">WhatsApp</a></p>
            </div>
          </div>
        </div>
      `
    }

    // Send email
    try {
      await transporter.sendMail({
        from: `"AMA Fashion" <${process.env.EMAIL_USER}>`,
        to: order.customer_email,
        subject: emailSubject,
        html: emailContent,
      })
    } catch (emailError) {
      console.error("Failed to send email:", emailError)
      // Don't fail the request if email fails
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
