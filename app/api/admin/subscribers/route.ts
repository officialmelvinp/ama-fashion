import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import fs from "fs"
import path from "path"

// Path to subscribers file
const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json")

// Middleware to check admin authentication
async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_auth")?.value === "true"
}

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if subscribers file exists
    if (!fs.existsSync(SUBSCRIBERS_FILE)) {
      return NextResponse.json({ subscribers: [] })
    }

    const data = fs.readFileSync(SUBSCRIBERS_FILE, "utf8")
    const subscribers = JSON.parse(data)

    return NextResponse.json({ subscribers })
  } catch (error) {
    console.error("Error fetching subscribers:", error)
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { email } = await request.json()

    if (!fs.existsSync(SUBSCRIBERS_FILE)) {
      return NextResponse.json({ error: "No subscribers found" }, { status: 404 })
    }

    const data = fs.readFileSync(SUBSCRIBERS_FILE, "utf8")
    const subscribers = JSON.parse(data)

    // Remove subscriber
    const updatedSubscribers = subscribers.filter((sub: any) => sub.email !== email)

    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(updatedSubscribers, null, 2), "utf8")

    return NextResponse.json({ message: "Subscriber removed successfully" })
  } catch (error) {
    console.error("Error removing subscriber:", error)
    return NextResponse.json({ error: "Failed to remove subscriber" }, { status: 500 })
  }
}
