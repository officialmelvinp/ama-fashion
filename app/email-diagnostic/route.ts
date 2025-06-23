import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    credentials: {
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "✅ Present" : "❌ Missing",
      BUSINESS_EMAIL: process.env.BUSINESS_EMAIL,
    },
    tests: [] as any[],
  }

  const emailUser = process.env.EMAIL_USER || "support@amariahco.com"
  const emailPassword = process.env.EMAIL_PASSWORD
  const businessEmail = process.env.BUSINESS_EMAIL || "support@amariahco.com"

  if (!emailPassword) {
    return NextResponse.json({
      ...results,
      error: "EMAIL_PASSWORD not found",
    })
  }

  // Test configurations based on your Namecheap settings
  const testConfigs = [
    {
      name: "Namecheap SSL (Port 465)",
      config: {
        host: "amariahco.com",
        port: 465,
        secure: true,
        auth: { user: emailUser, pass: emailPassword },
        connectionTimeout: 5000,
        greetingTimeout: 3000,
        socketTimeout: 5000,
      },
    },
    {
      name: "Namecheap Non-SSL (Port 587)",
      config: {
        host: "mail.amariahco.com",
        port: 587,
        secure: false,
        auth: { user: emailUser, pass: emailPassword },
        connectionTimeout: 5000,
        greetingTimeout: 3000,
        socketTimeout: 5000,
      },
    },
    {
      name: "Alternative SSL with mail subdomain",
      config: {
        host: "mail.amariahco.com",
        port: 465,
        secure: true,
        auth: { user: emailUser, pass: emailPassword },
        connectionTimeout: 5000,
        greetingTimeout: 3000,
        socketTimeout: 5000,
      },
    },
    {
      name: "STARTTLS on main domain",
      config: {
        host: "amariahco.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: { user: emailUser, pass: emailPassword },
        connectionTimeout: 5000,
        greetingTimeout: 3000,
        socketTimeout: 5000,
      },
    },
  ]

  for (const { name, config } of testConfigs) {
    const testResult = {
      name,
      config: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.auth.user,
      },
      status: "TESTING",
      error: null as string | null,
      duration: 0,
    }

    const startTime = Date.now()

    try {
      console.log(`Testing ${name}...`)
      const transporter = nodemailer.createTransport(config)

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout (5s)")), 5000),
      )

      // Race between verification and timeout
      await Promise.race([transporter.verify(), timeoutPromise])

      testResult.status = "SUCCESS ✅"
      testResult.duration = Date.now() - startTime
      console.log(`✅ ${name} - SUCCESS in ${testResult.duration}ms`)
    } catch (error) {
      testResult.status = "FAILED ❌"
      testResult.error = error instanceof Error ? error.message : "Unknown error"
      testResult.duration = Date.now() - startTime
      console.log(`❌ ${name} - FAILED: ${testResult.error} (${testResult.duration}ms)`)
    }

    results.tests.push(testResult)
  }

  return NextResponse.json(results)
}
