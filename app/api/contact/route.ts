import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message, region } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "Please fill in all required fields",
        },
        { status: 400 },
      )
    }

    const emailUser = process.env.EMAIL_USER
    const emailPassword = process.env.EMAIL_PASSWORD

    if (!emailUser || !emailPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Email configuration error. Please contact us directly.",
        },
        { status: 500 },
      )
    }

    // Use the working Namecheap cPanel config
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

    const mailOptions = {
      from: emailUser,
      to: emailUser,
      replyTo: email,
      subject: `AMA Contact Form: ${subject || "General Inquiry"}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Region:</strong> ${region || "Not specified"}</p>
        <p><strong>Subject:</strong> ${subject || "General Inquiry"}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Your message has been sent successfully. We'll get back to you soon.",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send message. Please try again or contact us directly via email or WhatsApp.",
      },
      { status: 500 },
    )
  }
}
