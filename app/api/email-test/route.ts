import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Test endpoint to debug email configuration
export async function GET() {
  try {
    console.log("Testing email configurations...")

    const emailUser = process.env.EMAIL_USER || "support@amariahco.com"
    const emailPassword = process.env.EMAIL_PASSWORD
    const businessEmail = process.env.BUSINESS_EMAIL || "support@amariahco.com"

    if (!emailPassword) {
      return NextResponse.json({ error: "EMAIL_PASSWORD not found" }, { status: 500 })
    }

    const configs = [
      {
        name: "Config 1: amariahco.com:587 STARTTLS",
        config: {
          host: "amariahco.com",
          port: 587,
          secure: false,
          auth: { user: emailUser, pass: emailPassword },
          connectionTimeout: 10000,
          greetingTimeout: 5000,
          socketTimeout: 10000,
        },
      },
      {
        name: "Config 2: mail.amariahco.com:587 STARTTLS",
        config: {
          host: "mail.amariahco.com",
          port: 587,
          secure: false,
          auth: { user: emailUser, pass: emailPassword },
          connectionTimeout: 10000,
          greetingTimeout: 5000,
          socketTimeout: 10000,
        },
      },
      {
        name: "Config 3: amariahco.com:25",
        config: {
          host: "amariahco.com",
          port: 25,
          secure: false,
          auth: { user: emailUser, pass: emailPassword },
          connectionTimeout: 10000,
          greetingTimeout: 5000,
          socketTimeout: 10000,
        },
      },
      {
        name: "Config 4: amariahco.com:465 SSL",
        config: {
          host: "amariahco.com",
          port: 465,
          secure: true,
          auth: { user: emailUser, pass: emailPassword },
          connectionTimeout: 10000,
          greetingTimeout: 5000,
          socketTimeout: 10000,
        },
      },
    ]

    const results = []

    for (const { name, config } of configs) {
      try {
        console.log(`Testing ${name}...`)
        const transporter = nodemailer.createTransport(config) // Fixed: removed the "r"
        await transporter.verify()
        results.push({ name, status: "SUCCESS ✅" })
        console.log(`✅ ${name} - SUCCESS`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        results.push({ name, status: "FAILED ❌", error: errorMessage })
        console.log(`❌ ${name} - FAILED:`, errorMessage)
      }
    }

    return NextResponse.json({
      message: "Email configuration test completed",
      results,
      credentials: {
        emailUser,
        businessEmail,
        hasPassword: !!emailPassword,
        passwordLength: emailPassword?.length || 0,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Test failed", details: errorMessage }, { status: 500 })
  }
}
