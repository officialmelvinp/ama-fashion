import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message, region } = await request.json()

    // Create transporter using the email settings provided
    const transporter = nodemailer.createTransport({
      host: "amariahco.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: "support@amariahco.com",
        pass: process.env.EMAIL_PASSWORD, // We'll need to add this to environment variables
      },
    })

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
    await transporter.sendMail({
      from: "support@amariahco.com",
      to: "support@amariahco.com",
      replyTo: email, // This allows direct reply to the customer
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

    return NextResponse.json({ success: true, message: "Email sent successfully!" })
  } catch (error) {
    console.error("Email sending error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send email. Please try again or contact us directly." },
      { status: 500 },
    )
  }
}
