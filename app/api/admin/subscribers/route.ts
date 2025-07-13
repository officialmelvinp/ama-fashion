import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"

const sql = neon(process.env.DATABASE_URL!)

async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_auth")?.value === "true"
}

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const subscribers = await sql`SELECT email FROM subscribers`
    return NextResponse.json(subscribers, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching subscribers:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch subscribers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { email } = await request.json()
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  try {
    const result = await sql`
      INSERT INTO subscribers (email)
      VALUES (${email})
      ON CONFLICT (email) DO NOTHING
      RETURNING email
    `
    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Email already subscribed." }, { status: 409 })
    }
    console.log(`✅ Subscriber ${email} added successfully.`)
    return NextResponse.json({ success: true, message: `Subscriber ${email} added.` }, { status: 201 })
  } catch (error: any) {
    console.error("Error adding subscriber:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to add subscriber" }, { status: 500 })
  }
}
