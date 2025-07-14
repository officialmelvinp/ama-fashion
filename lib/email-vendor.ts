import nodemailer from "nodemailer"
// This line imports the 'nodemailer' library. Nodemailer is a popular Node.js module
// that makes it easy to send emails from your server. It handles the complexities
// of connecting to SMTP servers and formatting email messages.

import type { OrderItemEmailData } from "@/lib/types" // Keep this type
// This line imports the 'OrderItemEmailData' type from your shared types file (`@/lib/types`).
// The `type` keyword ensures that this is a type-only import, meaning it's used
// solely for TypeScript's type checking and doesn't add any runtime code to your bundle.
// 'OrderItemEmailData' defines the structure for individual product items when sending emails.

// Email configuration
const transporter = nodemailer.createTransport({
  // This block initializes a 'transporter' object using Nodemailer.
  // The transporter is responsible for sending emails. It's configured with
  // the details of the SMTP server (Simple Mail Transfer Protocol) that will
  // actually send the emails.

  host: "premium169.web-hosting.com", // Corrected host
  // This specifies the hostname of the SMTP server. This is the address of the
  // mail server that Nodemailer will connect to. You've hardcoded it here.

  port: 465,
  // This specifies the port number for the SMTP server. Port 465 is commonly
  // used for secure SMTP connections (SMTPS) using SSL/TLS.

  secure: true,
  // This boolean indicates that the connection should use SSL/TLS.
  // When `true`, Nodemailer will attempt to establish a secure connection.

  auth: {
    // This object provides the authentication credentials for logging into the SMTP server.
    user: process.env.EMAIL_USER,
    // This is the username (usually an email address) for your email account on the SMTP server.
    // It's retrieved from an environment variable named `EMAIL_USER` for security.

    pass: process.env.EMAIL_PASSWORD,
    // This is the password for your email account. It's retrieved from an
    // environment variable named `EMAIL_PASSWORD` for security.
  },

  tls: {
    // This object contains options specifically for the TLS (Transport Layer Security) connection.
    rejectUnauthorized: false, // Added to handle potential certificate issues
    // If `true`, Nodemailer will reject connections if the server's SSL certificate
    // is not valid or cannot be verified. Setting it to `false` (as you have)
    // can help in development environments or with certain hosting providers that
    // might use self-signed certificates, but it's generally recommended to be `true`
    // in production for better security, unless you have a specific reason not to.
  },
})

interface SendVendorNotificationEmailProps {
  // This defines a TypeScript interface named 'SendVendorNotificationEmailProps'.
  // An interface acts as a blueprint, specifying the expected structure and types
  // of properties for an object. This ensures that any object passed to the
  // `sendVendorNotificationEmail` function adheres to this defined shape.

  order_id: string
  // The unique identifier for the order.
  customer_name: string
  // The full name of the customer.
  customer_email: string
  // The email address of the customer.
  phone_number: string | null
  // The customer's phone number, which can be a string or `null` if not provided.
  shipping_address: string | null
  // The customer's shipping address, which can be a string or `null`.
  total_amount: number
  // The total monetary value of the order.
  currency: string
  // The currency code for the total amount (e.g., "AED", "GBP").
  items: OrderItemEmailData[]
  // An array of `OrderItemEmailData` objects, detailing each product in the order.
  payment_method: string
  // The method used for payment (e.g., "Stripe", "PayPal").
  payment_id?: string
}

export async function sendVendorNotificationEmail({
  // This declares an asynchronous function named `sendVendorNotificationEmail`.
  // The `async` keyword means it will perform operations that might take time
  // (like sending an email over the network) and can use `await`.
  // The curly braces `{}` indicate object destructuring in the function parameters.
  // This allows you to directly extract properties from the `SendVendorNotificationEmailProps`
  // object into individual variables (e.g., `order_id`, `customer_name`) for easier use.

  order_id,
  customer_name,
  customer_email,
  phone_number,
  shipping_address,
  total_amount,
  currency,
  items,
  payment_method,
  payment_id,
}: SendVendorNotificationEmailProps) {
  // These are the individual properties being destructured from the input object,
  // which must conform to the `SendVendorNotificationEmailProps` interface.

  try {
    // A `try...catch` block is used for error handling. Code inside the `try` block
    // is executed, and if any error occurs, the execution jumps to the `catch` block.

    console.log("Attempting to send vendor email...")
    // This line logs a message to the console, indicating that the email sending process has started.

    const data = {
      order_id,
      customer_name,
      customer_email,
      phone_number,
      shipping_address,
      total_amount,
      currency,
      items,
      payment_method,
      payment_id,
    }

    const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f3ea; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #2c2824; font-size: 24px; font-weight: bold;">🎉 New Stripe Order Received!</h1>
  </div>
  <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
  <div style="text-align: left;">
    <h2 style="color: #2c2824; font-size: 18px; font-weight: bold;">Order Information:</h2>
    <p style="color: #555; font-size: 14px;"><strong>Payment ID:</strong> ${data.payment_id || data.order_id}</p>
    ${data.items.map((item) => `<p style="color: #555; font-size: 14px;"><strong>Product:</strong> ${item.product_display_name}</p><p style="color: #555; font-size: 14px;"><strong>Quantity:</strong> ${item.quantity}</p>`).join("")}
    <p style="color: #555; font-size: 14px;"><strong>Amount:</strong> ${data.total_amount.toFixed(2)} ${data.currency}</p>
    <p style="color: #555; font-size: 14px;"><strong>Order Type:</strong> purchase</p>
    <p style="color: #555; font-size: 14px;"><strong>Payment Method:</strong> ${data.payment_method}</p>
  </div>
  <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
  <div style="text-align: left;">
    <h2 style="color: #2c2824; font-size: 18px; font-weight: bold;">Customer Details:</h2>
    <p style="color: #555; font-size: 14px;"><strong>Name:</strong> ${data.customer_name}</p>
    <p style="color: #555; font-size: 14px;"><strong>Email:</strong> ${data.customer_email}</p>
    <p style="color: #555; font-size: 14px;"><strong>Phone:</strong> ${data.phone_number || "Not provided"}</p>
    <p style="color: #555; font-size: 14px;"><strong>Address:</strong> ${data.shipping_address || "Not provided"}</p>
  </div>
  <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
  <div style="text-align: left;">
    <h2 style="color: #2c2824; font-size: 18px; font-weight: bold;">Action Items:</h2>
    <ul style="list-style-type: none; padding-left: 0; color: #555; font-size: 14px;">
      <li style="margin-bottom: 5px;">✅ Contact customer via WhatsApp within 24 hours</li>
      <li style="margin-bottom: 5px;">✅ Confirm order details and delivery preferences</li>
      <li style="margin-bottom: 5px;">✅ Prepare the ${data.items.map((item) => item.product_display_name).join(", ")} for delivery</li>
      <li>✅ Update order status in admin panel</li>
    </ul>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
    <p>AMA Fashion - Conscious Luxury African Fashion</p>
    <p>Dubai & UK | support@amariahco.com</p>
  </div>
</div>
`
    const mailOptions = {
      // This object defines the email's content and metadata for Nodemailer.
      from: '"AMA Orders" <support@amariahco.com>',
      // The sender's email address, displayed in the recipient's inbox.
      // It includes a friendly name "AMA Orders" and the email address.
      to: process.env.VENDOR_EMAIL_RECIPIENT || "support@amariahco.com",
      // The recipient's email address, determined earlier.
      subject: `🎉 New Order: ${total_amount.toFixed(2)} ${currency} (${items.length} items) - Order ID: ${order_id}`,
      // The subject line of the email, dynamically generated with order details.
      html: emailHtml,
      // The HTML content of the email body, generated earlier.
    }

    await transporter.sendMail(mailOptions)
    // This is the core Nodemailer function call. It uses the configured `transporter`
    // to send the email defined by `mailOptions`. The `await` keyword means the
    // function will pause here until the email sending operation is complete.

    console.log("Vendor email sent successfully to:", process.env.VENDOR_EMAIL_RECIPIENT || "support@amariahco.com")
    // Logs a success message to the console, confirming the email was sent and to whom.
  } catch (error) {
    // If any error occurred during the `try` block (e.g., network issue, invalid SMTP credentials),
    // it will be caught here.
    console.error("❌ Error sending vendor email:", error)
    // Logs the error message to the console, prefixed with an '❌' for easy identification.
    throw error // Re-throw to ensure the calling function knows it failed
    // Re-throws the error. This is important because it allows the function that
    // called `sendVendorNotificationEmail` (e.g., your Stripe webhook handler)
    // to know that an error occurred and handle it appropriately (e.g., log it,
    // send an alert, or return an error response).
  }
}
