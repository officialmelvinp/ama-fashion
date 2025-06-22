import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message, region } = await request.json()

    // Use your existing environment variables
    const emailUser = process.env.EMAIL_USER || "support@amariahco.com"
    const emailPassword = process.env.EMAIL_PASSWORD
    const businessEmail = process.env.BUSINESS_EMAIL || "support@amariahco.com"

    if (!emailPassword) {
      console.error("EMAIL_PASSWORD not found in environment variables")
      return NextResponse.json(
        { success: false, error: "Email configuration error. Please contact us via WhatsApp." },
        { status: 500 },
      )
    }

    // 🏠 LOCALHOST DETECTION - Skip email sending in development
    const isLocalhost = process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === undefined

    if (isLocalhost) {
      console.log("🏠 LOCALHOST DETECTED - Simulating email send")
      console.log("📧 EMAIL CONTENT:")
      console.log("=".repeat(60))
      console.log(`From: ${email}`)
      console.log(`To: ${businessEmail}`)
      console.log(`Subject: AMA Contact Form: ${subject}`)
      console.log(`Name: ${name}`)
      console.log(`Phone: ${phone || "Not provided"}`)
      console.log(`Region: ${region}`)
      console.log(`Message: ${message}`)
      console.log("=".repeat(60))
      console.log("✅ Email would be sent in production!")

      return NextResponse.json({
        success: true,
        message: "Message received! (Development mode - check console for email content)",
      })
    }

    // 🌐 PRODUCTION - Actually send email
    console.log("🌐 PRODUCTION MODE - Sending real email")
    console.log("Using email user:", emailUser)
    console.log("Sending to business email:", businessEmail)

    // Try multiple email server configurations
    const emailConfigs = [
      {
        name: "Config 1: Port 587 STARTTLS",
        config: {
          host: "amariahco.com",
          port: 587,
          secure: false,
          auth: { user: emailUser, pass: emailPassword },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 30000,
          greetingTimeout: 15000,
          socketTimeout: 30000,
        },
      },
      {
        name: "Config 2: mail.amariahco.com Port 587",
        config: {
          host: "mail.amariahco.com",
          port: 587,
          secure: false,
          auth: { user: emailUser, pass: emailPassword },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 30000,
          greetingTimeout: 15000,
          socketTimeout: 30000,
        },
      },
      {
        name: "Config 3: Port 465 SSL",
        config: {
          host: "amariahco.com",
          port: 465,
          secure: true,
          auth: { user: emailUser, pass: emailPassword },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 30000,
          greetingTimeout: 15000,
          socketTimeout: 30000,
        },
      },
    ]

    let transporter = null
    let workingConfig = null

    // Try each configuration until one works
    for (const { name, config } of emailConfigs) {
      try {
        console.log(`Trying ${name}...`)
        const testTransporter = nodemailer.createTransport(config)
        await testTransporter.verify()
        transporter = testTransporter
        workingConfig = name
        console.log(`✅ ${name} - SUCCESS!`)
        break
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        console.log(`❌ ${name} - Failed:`, errorMessage)
        continue
      }
    }

    if (!transporter) {
      throw new Error("All email configurations failed. Please check your email server settings.")
    }

    console.log(`Using working configuration: ${workingConfig}`)

    // Email content
    const emailContent = `
New Contact Form Submission from AMA Website

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Region: ${region}
Subject: ${subject}

Message:
${message}

---
Sent from AMA Fashion website contact form
Time: ${new Date().toLocaleString()}
    `

    // Send email
    console.log("Sending email...")
    const info = await transporter.sendMail({
      from: emailUser,
      to: businessEmail,
      replyTo: email,
      subject: `AMA Contact Form: ${subject}`,
      text: emailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c2824; border-bottom: 2px solid #2c2824; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background: #f8f3ea; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
            <p><strong>Region:</strong> ${region}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #2c2824;">Message:</h3>
            <div style="background: white; padding: 15px; border-left: 4px solid #2c2824; border-radius: 4px;">
              ${message.replace(/\n/g, "<br>")}
            </div>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            Sent from AMA Fashion website contact form<br>
            Time: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    })

    console.log("Email sent successfully:", info.messageId)
    return NextResponse.json({ success: true, message: "Email sent successfully!" })
  } catch (error) {
    console.error("Email sending error:", error)

    let errorMessage = "Failed to send email. Please try again or contact us directly."

    if (error instanceof Error) {
      const errorCode = (error as any).code

      if (errorCode === "ESOCKET" || errorCode === "ETIMEDOUT") {
        errorMessage = "Email server connection timeout. Please contact us via WhatsApp or try again later."
      } else if (errorCode === "EAUTH") {
        errorMessage = "Email authentication failed. Please check credentials."
      } else if (errorCode === "ECONNECTION") {
        errorMessage = "Cannot connect to email server. Please try again later."
      }
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
