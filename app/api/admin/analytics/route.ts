import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Fetch total revenue over time
    // This query assumes 'orders' has a 'created_at' timestamp and 'order_items' has 'quantity' and 'unit_price'
    const revenueData = await sql`
      SELECT
        DATE_TRUNC('day', o.created_at) AS date,
        SUM(oi.quantity * oi.unit_price) AS total_revenue
      FROM
        orders o
      JOIN
        order_items oi ON o.id = oi.order_id
      WHERE
        o.order_status = 'completed' -- Corrected column name to order_status
      GROUP BY
        DATE_TRUNC('day', o.created_at)
      ORDER BY
        date ASC;
    `

    // Format the date to a simple string for the client
    const formattedData = revenueData.map((row) => ({
      date: new Date(row.date).toISOString().split("T")[0], // YYYY-MM-DD
      total_revenue: Number.parseFloat(row.total_revenue),
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
