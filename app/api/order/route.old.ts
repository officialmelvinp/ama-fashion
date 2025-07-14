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

// MODIFIED: Updated OrderEmailData to reflect multi-item structure
interface OrderEmailData {
  customer_email: string
  customer_name: string
  order_id: string
  items: {
    product_display_name: string
    quantity: number
    unit_price: number
    currency: string
  }[] // Array of items
  total_amount: number // Total amount for the order
  currency: string // Currency for the total amount
  payment_status: string
  shipping_status: string
  tracking_number?: string | null
  shipping_carrier?: string | null
  estimated_delivery_date?: string | null
  shipped_date?: string | null
  delivered_date?: string | null
}

// MODIFIED: sendOrderConfirmationEmail now accepts a single data object
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const subject = `Order Confirmation: #${data.order_id} - AMA Fashion`

  const itemsHtml = data.items
    .map(
      (item) => `
    <li>
      <strong>${item.product_display_name}</strong> - ${item.quantity} x ${item.unit_price.toFixed(2)} ${item.currency}
    </li>
  `,
    )
    .join("")

  const html = `
    <p>Dear ${data.customer_name},</p>
    <p>Thank you for your purchase from AMA Fashion!</p>
    <p>Your order <strong>#${data.order_id}</strong> has been successfully placed.</p>
    <h4>Items Ordered:</h4>
    <ul>${itemsHtml}</ul>
    <p><strong>Total Amount:</strong> ${data.total_amount.toFixed(2)} ${data.currency.toUpperCase()}</p>
    <p><strong>Payment Status:</strong> ${data.payment_status}</p>
    <p><strong>Shipping Status:</strong> ${data.shipping_status}</p>
    <p>We will notify you once your order has been shipped.</p>
    <p>If you have any questions, please contact us.</p>
    <p>Sincerely,</p>
    <p>The AMA Fashion Team</p>
  `
  return sendEmail({ to: data.customer_email, subject, html })
}

export async function sendOrderShippedEmail(data: OrderEmailData) {
  const subject = `Your AMA Fashion Order #${data.order_id} Has Shipped!`

  const itemsHtml = data.items
    .map(
      (item) => `
    <li>
      <strong>${item.product_display_name}</strong> - ${item.quantity} x ${item.unit_price.toFixed(2)} ${item.currency}
    </li>
  `,
    )
    .join("")

  const html = `
    <p>Dear ${data.customer_name},</p>
    <p>Great news! Your AMA Fashion order <strong>#${data.order_id}</strong> has been shipped.</p>
    <h4>Items Shipped:</h4>
    <ul>${itemsHtml}</ul>
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

  const itemsHtml = data.items
    .map(
      (item) => `
    <li>
      <strong>${item.product_display_name}</strong> - ${item.quantity} x ${item.unit_price.toFixed(2)} ${item.currency}
    </li>
  `,
    )
    .join("")

  const html = `
    <p>Dear ${data.customer_name},</p>
    <p>Your AMA Fashion order <strong>#${data.order_id}</strong> has been successfully delivered!</p>
    <h4>Items Delivered:</h4>
    <ul>${itemsHtml}</ul>
    <p>We hope you enjoy your purchase.</p>
    <p>If you have any questions or feedback, please contact us.</p>
    <p>Sincerely,</p>
    <p>The AMA Fashion Team</p>
  `
  return sendEmail({ to: data.customer_email, subject, html })
}