import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function GET() {
  try {
    console.log("🔍 Email Detective - Finding your actual email server...")

    const emailUser = process.env.EMAIL_USER || "support@amariahco.com"
    const emailPassword = process.env.EMAIL_PASSWORD

    if (!emailPassword) {
      return NextResponse.json({ error: "EMAIL_PASSWORD not found" }, { status: 500 })
    }

    // Let's try common hosting providers
    const commonConfigs = [
      // Namecheap
      {
        name: "Namecheap (mail.privateemail.com)",
        config: {
          host: "mail.privateemail.com",
          port: 587,
          secure: false,
          auth: { user: emailUser, pass: emailPassword },
        },
      },
      {
        name: "Namecheap SSL (mail.privateemail.com:465)",
        config: {
          host: "mail.privateemail.com",
          port: 465,
          secure: true,
          auth: { user: emailUser, pass: emailPassword },
        },
      },
      // GoDaddy
      {
        name: "GoDaddy (smtpout.secureserver.net)",
        config: {
          host: "smtpout.secureserver.net",
          port: 587,
          secure: false,
          auth: { user: emailUser, pass: emailPassword },
        },
      },
      // Bluehost
      {
        name: "Bluehost (mail.yourdomain.com)",
        config: {
          host: "mail.amariahco.com",
          port: 587,
          secure: false,
          auth: { user: emailUser, pass: emailPassword },
        },
      },
      // SiteGround
      {
        name: "SiteGround (mail.yourdomain.com)",
        config: {
          host: "mail.amariahco.com",
          port: 465,
          secure: true,
          auth: { user: emailUser, pass: emailPassword },
        },
      },
      // Generic domain-based
      {
        name: "Generic Domain SMTP (amariahco.com:587)",
        config: {
          host: "amariahco.com",
          port: 587,
          secure: false,
          auth: { user: emailUser, pass: emailPassword },
        },
      },
      {
        name: "Generic Domain SMTP SSL (amariahco.com:465)",
        config: {
          host: "amariahco.com",
          port: 465,
          secure: true,
          auth: { user: emailUser, pass: emailPassword },
        },
      },
      // Hostinger
      {
        name: "Hostinger (smtp.hostinger.com)",
        config: {
          host: "smtp.hostinger.com",
          port: 587,
          secure: false,
          auth: { user: emailUser, pass: emailPassword },
        },
      },
    ]

    const results = []

    for (const { name, config } of commonConfigs) {
      const startTime = Date.now()
      try {
        console.log(`🔍 Testing ${name}...`)
        const transporter = nodemailer.createTransport({
          ...config,
          connectionTimeout: 5000,
          greetingTimeout: 3000,
          socketTimeout: 5000,
        })

        await transporter.verify()
        const duration = Date.now() - startTime
        results.push({
          name,
          status: "SUCCESS ✅",
          duration: `${duration}ms`,
          host: config.host,
          port: config.port,
        })
        console.log(`✅ ${name} - SUCCESS!`)
      } catch (error) {
        const duration = Date.now() - startTime
        results.push({
          name,
          status: "FAILED ❌",
          duration: `${duration}ms`,
          error: error instanceof Error ? error.message : "Unknown error",
          host: config.host,
          port: config.port,
        })
        console.log(`❌ ${name} - FAILED`)
      }
    }

    const successfulConfigs = results.filter((r) => r.status.includes("SUCCESS"))

    return NextResponse.json({
      message: "Email detective work completed",
      summary: {
        total: results.length,
        successful: successfulConfigs.length,
        failed: results.length - successfulConfigs.length,
      },
      results,
      workingConfigs: successfulConfigs,
      nextSteps:
        successfulConfigs.length > 0
          ? ["✅ Found working email server!", "Update your contact/newsletter APIs with the working config"]
          : [
              "❌ No working email servers found",
              "1. Check where you bought your domain (Namecheap, GoDaddy, etc.)",
              "2. Check if you have email hosting set up",
              "3. Verify the email account support@amariahco.com actually exists",
              "4. Try accessing webmail to test the account",
            ],
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Detective work failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
