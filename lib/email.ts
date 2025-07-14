import nodemailer from "nodemailer"
// This line imports the 'nodemailer' library, which is a module for Node.js applications
// to send emails. It's a popular choice for handling email sending in server-side JavaScript.

// MODIFIED: Import specific email data types from lib/types.ts
import type { OrderConfirmationEmailData, OrderShippedEmailData, OrderDeliveredEmailData } from "./types"
// This line imports the necessary types from your local './types' file.
// The 'type' keyword ensures that this is a type-only import, meaning it won't
// include any runtime code from './types', which is good practice for performance
// and bundle size. These types define the structure of data for different email purposes.

// Email configuration using environment variables
console.log("EMAIL: Initializing Nodemailer transporter...")
console.log("EMAIL: Host:", process.env.EMAIL_HOST)
console.log("EMAIL: Port:", Number(process.env.EMAIL_PORT))
console.log("EMAIL: Secure:", process.env.EMAIL_SECURE === "True")
console.log("EMAIL: User (first 3 chars):", process.env.EMAIL_USER?.substring(0, 3) + "***")
console.log("EMAIL: Reject Unauthorized:", process.env.EMAIL_REJECT_UNAUTHORIZED === "False")
const transporter = nodemailer.createTransport({
  // This block sets up the email 'transporter', which is Nodemailer's way of
  // configuring how emails are sent (e.g., which SMTP server to use, authentication details).
  // It's configured using environment variables, which is crucial for security
  // (keeping sensitive credentials out of your code) and flexibility (easily changing
  // email service providers without code changes).

  host: process.env.EMAIL_HOST,
  // Specifies the hostname or IP address of the SMTP server (e.g., 'smtp.sendgrid.net').
  // It reads this value from the EMAIL_HOST environment variable.

  port: Number(process.env.EMAIL_PORT), // Ensure port is a number
  // Specifies the port of the SMTP server (e.g., 587 for TLS, 465 for SSL).
  // It reads this from EMAIL_PORT and converts it to a number, as environment variables
  // are always read as strings.

  secure: process.env.EMAIL_SECURE === "True", // Convert string "True" to boolean true
  // Determines if the connection should use SSL/TLS. If EMAIL_SECURE is "True" (string),
  // it becomes `true` (boolean); otherwise, `false`. This is important for encrypted communication.

  auth: {
    // This object contains the authentication details for the SMTP server.
    user: process.env.EMAIL_USER,
    // The username for authenticating with the SMTP server (e.g., your email address or API key).
    // Reads from EMAIL_USER environment variable.

    pass: process.env.EMAIL_PASSWORD,
    // The password or API key for authentication. Reads from EMAIL_PASSWORD environment variable.
  },

  tls: {
    // TLS (Transport Layer Security) options.
    rejectUnauthorized: process.env.EMAIL_REJECT_UNAUTHORIZED === "False", // Convert string "False" to boolean false
    // If `true`, it rejects connections if the server's SSL certificate is not valid.
    // Setting it to `false` (by checking if EMAIL_REJECT_UNAUTHORIZED is "False") can be
    // useful for development with self-signed certificates, but should generally be `true` in production
    // for security.
  },
})

// REMOVED: The duplicate OrderEmailData interface definition from here.
// It is now imported from lib/types.ts as specific types.

export async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData) {
  // This is an asynchronous function to send an order confirmation email.
  // It takes one argument, 'data', which must conform to the 'OrderConfirmationEmailData' interface.
  try {
    console.log(
      `EMAIL: Attempting to send order confirmation email to ${data.customer_email} for order ${data.order_id}`,
    )
    console.log("EMAIL: Mail options from:", process.env.EMAIL_FROM)
    console.log("EMAIL: Mail options to:", data.customer_email)
    console.log("EMAIL: Mail options subject:", `Order Confirmation #${data.order_id}`)
    // A try-catch block is used to handle potential errors during email sending.
    const itemsHtml = data.items
      .map(
        // This line generates HTML list items for each product in the order.
        // It iterates over the 'items' array within the 'data' object.
        (item) => `
      <li>
        <strong>${item.product_display_name}</strong> (x${item.quantity}) - ${item.unit_price.toFixed(2)} ${item.currency} each
      </li>
    `,
      )
      .join("")
    // The '.join("")' method concatenates all the generated HTML list items into a single string.

    const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f3ea; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #2c2824; font-size: 24px; font-weight: bold;">Thank You for Your Order! 🎉</h1>
    <p style="color: #555; font-size: 16px;">Hi ${data.customer_name || "Valued Customer"},</p>
    <p style="color: #555; font-size: 16px;">Your order #${data.order_id} has been confirmed.</p>
  </div>
  <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
  <div style="text-align: left;">
    <h2 style="color: #2c2824; font-size: 18px; font-weight: bold;">Order Details:</h2>
    <p style="color: #555; font-size: 14px;"><strong>Order ID:</strong> ${data.order_id}</p>
    ${data.items.map((item) => `<p style="color: #555; font-size: 14px;"><strong>Product:</strong> ${item.product_display_name}</p><p style="color: #555; font-size: 14px;"><strong>Quantity:</strong> ${item.quantity}</p>`).join("")}
    <p style="color: #555; font-size: 14px;"><strong>Amount Paid:</strong> ${data.total_amount.toFixed(2)} ${data.currency}</p>
    <p style="color: #555; font-size: 14px;"><strong>Payment Status:</strong> ✅ ${data.payment_status}</p>
    <p style="color: #555; font-size: 14px;"><strong>Payment Method:</strong> ${data.payment_status === "Confirmed" ? "Stripe" : "PayPal"}</p>
  </div>
  <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
  <div style="text-align: left;">
    <h2 style="color: #2c2824; font-size: 18px; font-weight: bold;">What's Next?</h2>
    <ul style="list-style-type: none; padding-left: 0; color: #555; font-size: 14px;">
      <li style="margin-bottom: 10px;">📱 We'll contact you via email and WhatsApp within 24 hours to confirm your order details and arrange delivery.</li>
      <li style="margin-bottom: 10px;">📦 Your beautiful AMA piece will be prepared with love and care.</li>
      <li>🚚 We'll coordinate delivery to your address.</li>
    </ul>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
    <p>AMA Fashion - Conscious Luxury African Fashion</p>
    <p>Dubai & UK | support@amariahco.com</p>
  </div>
</div>
`
    await transporter.sendMail({
      // This line uses the configured 'transporter' to send the email.
      from: process.env.EMAIL_FROM, // Use EMAIL_FROM from .env
      // The sender's email address. Reads from EMAIL_FROM environment variable.
      to: data.customer_email,
      // The recipient's email address, taken from the 'data' object.
      subject: `Order Confirmation #${data.order_id}`,
      // The subject line of the email, including the order ID.
      html: emailHtml,
      // The HTML content of the email.
    })
    console.log(`✅ EMAIL: Order confirmation email sent to ${data.customer_email} for order ${data.order_id}`)
    // Logs a success message to the console.
  } catch (error) {
    // If any error occurs within the try block, it's caught here.
    console.error("❌ EMAIL: Error sending order confirmation email:", error)
    // Logs the error to the console.
    throw error
    // Re-throws the error, allowing the calling function (e.g., your API route) to handle it.
  }
}

export async function sendOrderShippedEmail(data: OrderShippedEmailData) {
  // This function is similar to 'sendOrderConfirmationEmail' but is specifically for
  // sending an email when an order has been shipped. It also takes 'OrderShippedEmailData'.
  try {
    const itemsHtml = data.items
      .map(
        (item) => `
      <li>
        <strong>${item.product_display_name}</strong> (x${item.quantity}) - ${item.unit_price.toFixed(2)} ${item.currency} each
      </li>
    `,
      )
      .join("")
    const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f3ea; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #2c2824; font-size: 24px; font-weight: bold;">Your Order Has Shipped!</h1>
    <p style="color: #555; font-size: 16px;">Dear ${data.customer_name || "Valued Customer"},</p>
    <p style="color: #555; font-size: 16px;">Great news! Your AMA Fashion order #${data.order_id} has been shipped.</p>
  </div>
  <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
  <div style="text-align: left;">
    ${data.items.map((item) => `<p style="color: #555; font-size: 14px;"><strong>Product:</strong> ${item.product_display_name}</p><p style="color: #555; font-size: 14px;"><strong>Quantity:</strong> ${item.quantity}</p>`).join("")}
    ${
      data.tracking_number
        ? `<p style="color: #555; font-size: 14px;"><strong>Tracking Number:</strong> ${data.tracking_number}</p>`
        : ""
    }
    ${
      data.shipping_carrier
        ? `<p style="color: #555; font-size: 14px;"><strong>Shipping Carrier:</strong> ${data.shipping_carrier}</p>`
        : ""
    }
    ${
      data.estimated_delivery_date
        ? `<p style="color: #555; font-size: 14px;"><strong>Estimated Delivery:</strong> ${new Date(
            data.estimated_delivery_date,
          ).toLocaleDateString()}</p>`
        : ""
    }
    <p style="color: #555; font-size: 16px; margin-top: 20px;">You can track your order using the provided tracking number.</p>
    <p style="color: #555; font-size: 16px;">If you have any questions, please contact us.</p>
  </div>
  <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
    <p>Sincerely,</p>
    <p>The AMA Fashion Team</p>
    <p>AMA Fashion - Conscious Luxury African Fashion</p>
    <p>Dubai & UK | support@amariahco.com</p>
  </div>
</div>
`
    await transporter.sendMail({
      from: process.env.EMAIL_FROM, // Use EMAIL_FROM from .env
      to: data.customer_email,
      subject: `Your AMA Order #${data.order_id} Has Shipped!`,
      html: emailHtml,
    })
    console.log(`Order shipped email sent to ${data.customer_email} for order ${data.order_id}`)
  } catch (error) {
    console.error("Error sending order shipped email:", error)
    throw error
  }
}

export async function sendOrderDeliveredEmail(data: OrderDeliveredEmailData) {
  // This function is for sending an email when an order has been delivered.
  // It also takes 'OrderDeliveredEmailData'.
  try {
    const itemsHtml = data.items
      .map(
        (item) => `
      <li>
        <strong>${item.product_display_name}</strong> (x${item.quantity}) - ${item.unit_price.toFixed(2)} ${item.currency} each
      </li>
    `,
      )
      .join("")
    const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f3ea; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #2c2824; font-size: 24px; font-weight: bold;">Your Order Has Been Delivered!</h1>
    <p style="color: #555; font-size: 16px;">Dear ${data.customer_name || "Valued Customer"},</p>
    <p style="color: #555; font-size: 16px;">Your AMA Fashion order #${data.order_id} has been successfully delivered! We hope you enjoy your purchase.</p>
  </div>
  <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
  <div style="text-align: left;">
    ${data.items.map((item) => `<p style="color: #555; font-size: 14px;"><strong>Product:</strong> ${item.product_display_name}</p><p style="color: #555; font-size: 14px;"><strong>Quantity:</strong> ${item.quantity}</p>`).join("")}
    <p style="color: #555; font-size: 16px; margin-top: 20px;">If you have any questions or feedback, please contact us.</p>
  </div>
  <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
    <p>Sincerely,</p>
    <p>The AMA Fashion Team</p>
    <p>AMA Fashion - Conscious Luxury African Fashion</p>
    <p>Dubai & UK | support@amariahco.com</p>
  </div>
</div>
`
    await transporter.sendMail({
      from: process.env.EMAIL_FROM, // Use EMAIL_FROM from .env
      to: data.customer_email,
      subject: `Your AMA Order #${data.order_id} Has Been Delivered!`,
      html: emailHtml,
    })
    console.log(`Order delivered email sent to ${data.customer_email} for order ${data.order_id}`)
  } catch (error) {
    console.error("Error sending order delivered email:", error)
    throw error
  }
}

export async function sendNewsletterWelcomeEmail(email: string) {
  // This function sends a welcome email for newsletter subscribers.
  // It currently takes 'email' as a direct string parameter.
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f3ea; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2c2824; font-size: 24px; font-weight: bold;">Welcome to the AMA Newsletter!</h1>
          <p style="color: #555; font-size: 16px;">Thank you for subscribing to our newsletter. We're thrilled to have you join the AMA community!</p>
          <p style="color: #555; font-size: 16px;">Get ready for exclusive updates, new collection launches, special offers, and insights into conscious luxury African fashion.</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
          <p>AMA Fashion - Conscious Luxury African Fashion</p>
          <p>Dubai & UK | support@amariahco.com</p>
        </div>
      </div>
    `
    await transporter.sendMail({
      from: process.env.EMAIL_FROM, // Use EMAIL_FROM from .env
      to: email,
      subject: "Welcome to the AMA Newsletter!",
      html: emailHtml,
    })
    console.log(`Newsletter welcome email sent to ${email}`)
  } catch (error) {
    console.error("Error sending newsletter welcome email:", error)
    throw error
  }
}


// ###