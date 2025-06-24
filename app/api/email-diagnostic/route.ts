import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function GET() {
  try {
    console.log("🔍 Starting email diagnostic...")

    const emailUser = process.env.EMAIL_USER || "support@amariahco.com"
    const emailPassword = process.env.EMAIL_PASSWORD
    const businessEmail = process.env.BUSINESS_EMAIL || "support@amariahco.com"

    if (!emailPassword) {
      return NextResponse.json(
        {
          error: "EMAIL_PASSWORD not found in environment variables",
          credentials: {
            emailUser,
            businessEmail,
            hasPassword: false,
            passwordLength: 0,
          },
        },
        { status: 500 },
      )
    }

    // Updated cPanel configurations to match your contact/newsletter routes
    const testConfigs = [
      {
        name: "cPanel SSL (Port 465) - Primary",
        config: {
          host: "amariahco.com", // Your actual cPanel server
          port: 465,
          secure: true,
          auth: { user: emailUser, pass: emailPassword },
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 8000,
          greetingTimeout: 5000,
          socketTimeout: 8000,
        },
      },
      {
        name: "cPanel Non-SSL (Port 587) - Secondary",
        config: {
          host: "mail.amariahco.com", // Alternative cPanel server
          port: 587,
          secure: false,
          auth: { user: emailUser, pass: emailPassword },
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 8000,
          greetingTimeout: 5000,
          socketTimeout: 8000,
        },
      },
      {
        name: "cPanel Alternative SSL (Port 465) - Fallback",
        config: {
          host: "mail.amariahco.com",
          port: 465,
          secure: true,
          auth: { user: emailUser, pass: emailPassword },
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 8000,
          greetingTimeout: 5000,
          socketTimeout: 8000,
        },
      },
      {
        name: "cPanel Port 25 (Basic SMTP)",
        config: {
          host: "amariahco.com",
          port: 25,
          secure: false,
          auth: { user: emailUser, pass: emailPassword },
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 8000,
          greetingTimeout: 5000,
          socketTimeout: 8000,
        },
      },
    ]

    const tests = []

    for (const { name, config } of testConfigs) {
      const startTime = Date.now()
      try {
        console.log(`Testing ${name}...`)

        const transporter = nodemailer.createTransport(config)

        // Create verification promise with timeout
        const verifyPromise = transporter.verify()
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Connection timeout")), 8000),
        )

        await Promise.race([verifyPromise, timeoutPromise])

        const duration = Date.now() - startTime
        tests.push({
          name,
          status: "SUCCESS ✅",
          duration: `${duration}ms`,
          config: {
            host: config.host,
            port: config.port,
            secure: config.secure,
          },
        })
        console.log(`✅ ${name} - SUCCESS (${duration}ms)`)
      } catch (error) {
        const duration = Date.now() - startTime
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        tests.push({
          name,
          status: "FAILED ❌",
          duration: `${duration}ms`,
          error: errorMessage,
          config: {
            host: config.host,
            port: config.port,
            secure: config.secure,
          },
        })
        console.log(`❌ ${name} - FAILED (${duration}ms):`, errorMessage)
      }
    }

    // Summary
    const successCount = tests.filter((t) => t.status.includes("SUCCESS")).length
    const failCount = tests.filter((t) => t.status.includes("FAILED")).length

    return NextResponse.json({
      message: "Email diagnostic completed",
      summary: {
        total: tests.length,
        successful: successCount,
        failed: failCount,
        overallStatus: successCount > 0 ? "✅ At least one config working" : "❌ All configs failed",
      },
      credentials: {
        emailUser,
        businessEmail,
        hasPassword: !!emailPassword,
        passwordLength: emailPassword?.length || 0,
      },
      tests,
      recommendations:
        successCount === 0
          ? [
              "1. Verify your email account exists in cPanel",
              "2. Check if the password is correct",
              "3. Ensure MX records are properly configured",
              "4. Contact your hosting provider to verify email services are active",
              "5. Try accessing webmail at https://webmail.amariahco.com",
            ]
          : [
              `✅ Email server is working! Using: ${tests.find((t) => t.status.includes("SUCCESS"))?.name}`,
              "Your contact form and newsletter should now work properly",
              "Test the live forms on your website",
            ],
    })
  } catch (error) {
    console.error("Diagnostic error:", error)
    return NextResponse.json(
      {
        error: "Diagnostic failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
