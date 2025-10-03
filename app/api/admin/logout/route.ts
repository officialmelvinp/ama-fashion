import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Clear the authentication cookie
    const cookieStore = await cookies()
    cookieStore.delete("session") 

    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error during logout:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}
