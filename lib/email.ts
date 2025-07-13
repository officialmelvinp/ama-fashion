import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  html: string
}

// Configure your email transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true", // Use 'true' for 465, 'false' for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  // This is often needed for self-signed certs or specific server configurations.
  // In production, ensure your certificates are valid to avoid this.
  tls: {
    rejectUnauthorized: process.env.EMAIL_REJECT_UNAUTHORIZED === "false",
  },
  // Add timeouts for better reliability, consistent with your diagnostic
  connectionTimeout: 8000, // 8 seconds
  greetingTimeout: 5000, // 5 seconds
  socketTimeout: 8000, // 8 seconds
})

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER, // Use EMAIL_FROM if set, otherwise EMAIL_USER
      to,
      subject,
      html,
    }
    await transporter.sendMail(mailOptions)
    console.log(`Email sent to ${to} with subject: ${subject}`)
    return { success: true, message: "Email sent successfully." }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, message: `Failed to send email: ${error}` }
  }
}

interface OrderEmailData {
  customer_email: string
  customer_name: string
  order_id: string
  product_name: string
  quantity_ordered: number
  amount_paid: number
  currency: string
  payment_status: string
  shipping_status: string
  tracking_number?: string | null
  shipping_carrier?: string | null
  estimated_delivery_date?: string | null
  shipped_date?: string | null
  delivered_date?: string | null
}

export async function sendOrderConfirmationEmail(
  customer_email: string,
  customer_name: string,
  order_id: string,
  product_name: string,
  quantity_ordered: number,
  amount_paid: number,
  currency: string,
  payment_status: string,
  shipping_status: string,
) {
  const subject = `Order Confirmation: #${order_id} - AMA Fashion`
  const html = `
    <p>Dear ${customer_name},</p>
    <p>Thank you for your purchase from AMA Fashion!</p>
    <p>Your order <strong>#${order_id}</strong> has been successfully placed.</p>
    <p><strong>Product:</strong> ${product_name}</p>
    <p><strong>Quantity:</strong> ${quantity_ordered}</p>
    <p><strong>Total Amount:</strong> ${amount_paid.toFixed(2)} ${currency.toUpperCase()}</p>
    <p><strong>Payment Status:</strong> ${payment_status}</p>
    <p><strong>Shipping Status:</strong> ${shipping_status}</p>
    <p>We will notify you once your order has been shipped.</p>
    <p>If you have any questions, please contact us.</p>
    <p>Sincerely,</p>
    <p>The AMA Fashion Team</p>
  `
  return sendEmail({ to: customer_email, subject, html })
}

export async function sendOrderShippedEmail(data: OrderEmailData) {
  const subject = `Your AMA Fashion Order #${data.order_id} Has Shipped!`
  const html = `
    <p>Dear ${data.customer_name},</p>
    <p>Great news! Your AMA Fashion order <strong>#${data.order_id}</strong> has been shipped.</p>
    <p><strong>Product:</strong> ${data.product_name}</p>
    <p><strong>Quantity:</strong> ${data.quantity_ordered}</p>
    <p><strong>Tracking Number:</strong> ${data.tracking_number || "N/A"}</p>
    <p><strong>Shipping Carrier:</strong> ${data.shipping_carrier || "N/A"}</p>
    <p><strong>Estimated Delivery:</strong> ${data.estimated_delivery_date ? new Date(data.estimated_delivery_date).toLocaleDateString() : "N/A"}</p>
    <p>You can track your order using the provided tracking number.</p>
    <p>If you have any questions, please contact us.</p>
    <p>Sincerely,</p>
    <p>The AMA Fashion Team</p>
  `
  return sendEmail({ to: data.customer_email, subject, html })
}

export async function sendOrderDeliveredEmail(data: OrderEmailData) {
  const subject = `Your AMA Fashion Order #${data.order_id} Has Been Delivered!`
  const html = `
    <p>Dear ${data.customer_name},</p>
    <p>Your AMA Fashion order <strong>#${data.order_id}</strong> has been successfully delivered!</p>
    <p><strong>Product:</strong> ${data.product_name}</p>
    <p><strong>Quantity:</strong> ${data.quantity_ordered}</p>
    <p>We hope you enjoy your purchase.</p>
    <p>If you have any questions or feedback, please contact us.</p>
    <p>Sincerely,</p>
    <p>The AMA Fashion Team</p>
  `
  return sendEmail({ to: data.customer_email, subject, html })
}

const resendOrderEmail = async (orderId: number, emailType: "shipped" | "delivered", productDisplayName: string) => {
  try {
    // Fetch order details from the database
    // const order = await getOrderDetails(orderId); // Replace with your actual data fetching logic

    // Mock order data for testing
    const order = {
      customer_email: "test@example.com",
      customer_name: "Test Customer",
      product_name: productDisplayName,
      quantity_ordered: 1,
      amount_paid: 100,
      currency: "USD",
      payment_status: "completed",
      shipping_status: "shipped",
      tracking_number: "1234567890",
      shipping_carrier: "DHL",
      estimated_delivery_date: "2024-01-30",
      shipped_date: "2024-01-23",
      delivered_date: "2024-01-29",
    }

    if (emailType === "shipped") {
      await sendOrderShippedEmail({
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        order_id: String(orderId),
        product_name: order.product_name,
        quantity_ordered: order.quantity_ordered,
        amount_paid: order.amount_paid,
        currency: order.currency,
        payment_status: order.payment_status,
        shipping_status: order.shipping_status,
        tracking_number: order.tracking_number,
        shipping_carrier: order.shipping_carrier,
        estimated_delivery_date: order.estimated_delivery_date,
        shipped_date: order.shipped_date,
      })
      return { success: true, message: "Shipped email resent successfully" }
    } else if (emailType === "delivered") {
      await sendOrderDeliveredEmail({
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        order_id: String(orderId),
        product_name: order.product_name,
        quantity_ordered: order.quantity_ordered,
        amount_paid: order.amount_paid,
        currency: order.currency,
        payment_status: order.payment_status,
        shipping_status: order.shipping_status,
        delivered_date: order.delivered_date,
      })
      return { success: true, message: "Delivered email resent successfully" }
    } else {
      return { success: false, error: "Invalid email type" }
    }
  } catch (error: any) {
    console.error("Error resending order email:", error)
    return { success: false, error: error.message || "Failed to resend order email" }
  }
}

export { resendOrderEmail }
