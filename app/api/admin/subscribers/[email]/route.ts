import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers" // Import cookies

const sql = neon(process.env.DATABASE_URL!)

// Helper function to check authentication
async function isAuthenticated() {
  const cookieStore = await cookies() // Await the cookies() call
  return cookieStore.get("admin_auth")?.value === "true"
}

export async function DELETE(request: NextRequest, { params }: { params: { email: string } }) {
  // Check authentication first
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Await params before destructuring
  const { email } = await params
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  try {
    // Delete the subscriber from the database
    const result = await sql`
      DELETE FROM subscribers
      WHERE email = ${email}
      RETURNING email
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Subscriber not found" }, { status: 404 })
    }

    console.log(`✅ Subscriber ${email} deleted successfully.`)
    return NextResponse.json({ success: true, message: `Subscriber ${email} deleted.` }, { status: 200 })
  } catch (error: any) {
    console.error(`❌ Error deleting subscriber ${email}:`, error)
    return NextResponse.json({ success: false, error: error.message || "Failed to delete subscriber" }, { status: 500 })
  }
}
