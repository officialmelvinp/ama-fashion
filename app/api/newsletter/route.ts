import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Email configuration
const emailConfig = {
  host: "elmelvinp.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // contact@elmelvinp.com
    pass: process.env.EMAIL_PASSWORD, // your email password
  },
}

// Create transporter - Fixed method name
const transporter = nodemailer.createTransport(emailConfig)

export async function POST(request: NextRequest) {
  try {
    // Log that the API route was hit
    console.log("API route hit: /api/newsletter")

    const { email } = await request.json()
    console.log("Received email:", email)

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 })
    }

    // Send welcome email to subscriber
    const welcomeEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to AMA Fashion</title>
          <style>
            body { font-family: 'Georgia', serif; line-height: 1.6; color: #2c2824; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: bold; color: #2c2824; margin-bottom: 10px; }
            .tagline { font-style: italic; color: #666; }
            .content { background: #f8f3ea; padding: 30px; border-radius: 8px; }
            .quote { font-size: 18px; font-style: italic; text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AMA</div>
              <div class="tagline">Woven From Spirit. Rooted in Heritage.</div>
            </div>
            
            <div class="content">
              <h2>Welcome to our sacred circle</h2>
              
              <p>Thank you for joining the AMA community. You've just become part of a movement that honors heritage, celebrates craftsmanship, and believes in the transformative power of intentional clothing.</p>
              
              <div class="quote">
                "Every thread a prayer. Every silhouette, a sanctuary."
              </div>
              
              <p>As a member of our community, you'll receive:</p>
              <ul>
                <li>🌿 Stories behind our fabrics and their cultural significance</li>
                <li>✂️ Early access to new collections and limited pieces</li>
                <li>🎨 Behind-the-scenes glimpses of our artisan partnerships</li>
                <li>📖 Inspiration on mindful living and intentional dressing</li>
              </ul>
              
              <p>We believe in quality over quantity, meaning over trend, and spirit over surface. Welcome to a space where fashion becomes ritual.</p>
              
              <p>With reverence,<br>The AMA Team</p>
            </div>
            
            <div class="footer">
              <p>AMA Fashion | Dubai, UAE</p>
              <p>contact@elmelvinp.com | +971 50 123 4567</p>
              <p><em>Fabric is our first memory. The skin before skin.</em></p>
            </div>
          </div>
        </body>
      </html>
    `

    try {
      // Send welcome email
      console.log("Sending welcome email to:", email)
      await transporter.sendMail({
        from: `"AMA Fashion" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to AMA - Your Journey Begins",
        html: welcomeEmailHtml,
      })
      console.log("Welcome email sent successfully")

      // Send notification to you about new subscriber
      console.log("Sending notification email to:", process.env.EMAIL_USER)
      await transporter.sendMail({
        from: `"AMA Newsletter" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // sends to contact@elmelvinp.com
        subject: "New Newsletter Subscription - AMA Fashion",
        html: `
          <h3>New Newsletter Subscription</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Source:</strong> AMA Fashion Website</p>
        `,
      })
      console.log("Notification email sent successfully")
    } catch (emailError) {
      console.error("Email sending error:", emailError)
      return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 })
    }

    return NextResponse.json({ message: "Successfully subscribed to newsletter" }, { status: 200 })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 })
  }
}
