import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSubscribers, removeSubscriber } from "@/lib/database"

async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_auth")?.value === "true"
}

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const subscribers = await getSubscribers()
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
    const success = await removeSubscriber(email)

    if (success) {
      return NextResponse.json({ message: "Subscriber removed successfully" })
    } else {
      return NextResponse.json({ error: "Failed to remove subscriber" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error removing subscriber:", error)
    return NextResponse.json({ error: "Failed to remove subscriber" }, { status: 500 })
  }
}
