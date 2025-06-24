import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { addSubscriber } from "@/lib/database"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email is required",
        },
        { status: 400 },
      )
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email format",
        },
        { status: 400 },
      )
    }

    // Save to database first
    const dbResult = await addSubscriber(email)

    if (!dbResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: dbResult.message,
        },
        { status: 500 },
      )
    }

    // Send emails using working Namecheap config
    const emailUser = process.env.EMAIL_USER
    const emailPassword = process.env.EMAIL_PASSWORD

    if (emailUser && emailPassword) {
      const transporter = nodemailer.createTransport({
        host: "premium169.web-hosting.com",
        port: 465,
        secure: true,
        auth: { user: emailUser, pass: emailPassword },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
      })

      // Send notification to AMA
      await transporter.sendMail({
        from: emailUser,
        to: emailUser,
        subject: "New Newsletter Subscriber",
        html: `
          <h2>New Newsletter Subscriber</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Status:</strong> ${dbResult.isNew ? "New subscriber" : "Already subscribed"}</p>
          <p><strong>Subscribed at:</strong> ${new Date().toLocaleString()}</p>
        `,
      })

      // Send welcome email to subscriber (only if new)
      if (dbResult.isNew) {
        await transporter.sendMail({
          from: `"AMA Fashion" <${emailUser}>`,
          to: email,
          subject: "Welcome to the AMA Manifestation ✨",
          html: `
            <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2c2824; text-align: center; font-size: 2em;">Welcome to AMA</h1>
              
              <p style="color: #2c2824; font-size: 1.1em; line-height: 1.6;">
                Thank you for joining our manifestation, beautiful soul.
              </p>
              
              <p style="color: #2c2824; font-style: italic; line-height: 1.6;">
                You'll be the first to know about new collections, exclusive offers, and spiritually-rooted content that honors our lineage.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://amariahco.com/shop" style="background: #2c2824; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                  Explore Our Collections
                </a>
              </div>
              
              <p style="color: #2c2824; font-style: italic; text-align: center; margin-top: 30px;">
                "Every thread a prayer. Every silhouette, a sanctuary."
              </p>
              
              <div style="text-align: center; margin-top: 20px; color: #2c2824;">
                <p>Follow our journey:</p>
                <p>📱 WhatsApp: <a href="https://wa.me/971501234567">+971 50 123 4567</a></p>
                <p>📧 Email: support@amariahco.com</p>
              </div>
            </div>
          `,
        })
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: dbResult.message,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to subscribe. Please try again later.",
      },
      { status: 500 },
    )
  }
}
