import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ message: "Please fill in all fields" }, { status: 400 })
    }

    const emailUser = process.env.EMAIL_USER
    const emailPassword = process.env.EMAIL_PASSWORD

    if (!emailUser || !emailPassword) {
      return NextResponse.json(
        {
          message:
            "Email user or password not found in environment variables. Please set EMAIL_USER and EMAIL_PASSWORD.",
        },
        { status: 500 },
      )
    }

    // Use your actual cPanel email server settings
    const emailConfigs = [
      {
        name: "cPanel SSL (Recommended)",
        config: {
          host: "amariahco.com", // Your actual email server
          port: 465,
          secure: true,
          auth: { user: emailUser, pass: emailPassword },
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 10000,
          greetingTimeout: 5000,
          socketTimeout: 10000,
        },
      },
      {
        name: "cPanel Non-SSL",
        config: {
          host: "mail.amariahco.com",
          port: 587,
          secure: false,
          auth: { user: emailUser, pass: emailPassword },
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 10000,
          greetingTimeout: 5000,
          socketTimeout: 10000,
        },
      },
      {
        name: "cPanel Alternative SSL", // New fallback option
        config: {
          host: "mail.amariahco.com",
          port: 465,
          secure: true,
          auth: { user: emailUser, pass: emailPassword },
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 10000,
          greetingTimeout: 5000,
          socketTimeout: 10000,
        },
      },
    ]

    async function sendEmail(mailOptions: nodemailer.SendMailOptions) {
      let transporter
      for (const config of emailConfigs) {
        try {
          transporter = nodemailer.createTransport(config.config)
          await transporter.verify()
          console.log(`Using email config: ${config.name}`)
          break // If successful, break out of the loop
        } catch (error) {
          console.error(`Failed to connect with ${config.name}: ${(error as Error).message}`)
          transporter = null // Reset transporter for the next attempt
        }
      }

      if (!transporter) {
        throw new Error("Failed to connect to any email server.")
      }

      return transporter.sendMail(mailOptions)
    }

    const mailOptions = {
      from: emailUser,
      to: emailUser,
      replyTo: email,
      subject: `Contact Form Submission from ${name}`,
      text: message,
      html: `<p>You have a new contact form submission:</p><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`,
    }

    await sendEmail(mailOptions)

    return NextResponse.json({ message: "Email sent successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ message: `Failed to send email: ${(error as Error).message}` }, { status: 500 })
  }
}
