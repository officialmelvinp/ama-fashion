import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface Subscriber {
  id: number
  email: string
  created_at: string
  status: string
}

export async function addSubscriber(email: string): Promise<{ success: boolean; message: string; isNew: boolean }> {
  try {
    // Check if subscriber already exists
    const existingSubscriber = await sql`
      SELECT email FROM subscribers WHERE email = ${email}
    `

    if (existingSubscriber.length > 0) {
      return {
        success: true,
        message: "You're already subscribed to our newsletter!",
        isNew: false,
      }
    }

    // Add new subscriber
    await sql`
      INSERT INTO subscribers (email, status)
      VALUES (${email}, 'active')
    `

    return {
      success: true,
      message: "Successfully subscribed to newsletter!",
      isNew: true,
    }
  } catch (error) {
    console.error("Database error:", error)
    return {
      success: false,
      message: "Failed to subscribe. Please try again.",
      isNew: false,
    }
  }
}

export async function getSubscribers(): Promise<Subscriber[]> {
  try {
    const result = await sql`
      SELECT id, email, created_at, status 
      FROM subscribers 
      ORDER BY created_at DESC
    `
    return result as Subscriber[]
  } catch (error) {
    console.error("Database error:", error)
    return []
  }
}

export async function removeSubscriber(email: string): Promise<boolean> {
  try {
    await sql`
      DELETE FROM subscribers WHERE email = ${email}
    `
    return true
  } catch (error) {
    console.error("Database error:", error)
    return false
  }
}

export async function getSubscriberStats() {
  try {
    const total = await sql`SELECT COUNT(*) as count FROM subscribers WHERE status = 'active'`

    const thisMonth = await sql`
      SELECT COUNT(*) as count FROM subscribers 
      WHERE status = 'active' 
      AND created_at >= date_trunc('month', CURRENT_DATE)
    `

    const thisWeek = await sql`
      SELECT COUNT(*) as count FROM subscribers 
      WHERE status = 'active' 
      AND created_at >= CURRENT_DATE - INTERVAL '7 days'
    `

    return {
      total: Number.parseInt(total[0].count),
      thisMonth: Number.parseInt(thisMonth[0].count),
      thisWeek: Number.parseInt(thisWeek[0].count),
    }
  } catch (error) {
    console.error("Database error:", error)
    return { total: 0, thisMonth: 0, thisWeek: 0 }
  }
}
