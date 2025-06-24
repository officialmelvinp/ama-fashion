import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

const emailUser = process.env.EMAIL_USER
const emailPassword = process.env.EMAIL_PASSWORD

if (!emailUser || !emailPassword) {
  console.error("EMAIL_USER and EMAIL_PASSWORD must be defined in the environment variables.")
}

// Use the same Namecheap cPanel email configurations as contact form
const emailConfigs = [
  {
    name: "Namecheap cPanel SSL (Recommended)",
    config: {
      host: "premium169.web-hosting.com", // Your actual cPanel server
      port: 465,
      secure: true,
      auth: { user: emailUser, pass: emailPassword },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    },
  },
  {
    name: "Namecheap cPanel Non-SSL",
    config: {
      host: "premium169.web-hosting.com",
      port: 587,
      secure: false,
      auth: { user: emailUser, pass: emailPassword },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    },
  },
  {
    name: "Namecheap Alternative (mail.amariahco.com)",
    config: {
      host: "mail.amariahco.com",
      port: 465,
      secure: true,
      auth: { user: emailUser, pass: emailPassword },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    },
  },
]

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 })
    }

    // Choose an email configuration (e.g., the first one)
    const selectedConfig = emailConfigs[0].config

    // Create a transporter object using the selected configuration
    const transporter = nodemailer.createTransport(selectedConfig)

    const mailOptions = {
      from: emailUser,
      to: emailUser, // Send to yourself to confirm subscription
      subject: "New Newsletter Subscriber",
      text: `A new user has subscribed to the newsletter: ${email}`,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ message: "Successfully subscribed!" }, { status: 200 })
  } catch (error) {
    console.error("Error processing newsletter subscription:", error)
    return NextResponse.json({ message: "Failed to subscribe. Please try again later." }, { status: 500 })
  }
}
