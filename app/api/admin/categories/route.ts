import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic" // Ensure dynamic rendering

export async function GET() {
  try {
    const categories = await sql`
      SELECT
        category,
        COUNT(id) AS product_count,
        COUNT(CASE WHEN status = 'active' THEN 1 ELSE NULL END) AS active_products
      FROM products
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY category ASC;
    `

    const activeCategoriesCount = await sql`
      SELECT COUNT(DISTINCT category) AS count
      FROM products
      WHERE category IS NOT NULL AND category != '' AND status = 'active';
    `

    return NextResponse.json({
      categories: categories.map((row: any) => ({
        category: row.category,
        product_count: Number(row.product_count),
        active_products: Number(row.active_products),
      })),
      activeCategoriesCount: Number(activeCategoriesCount[0]?.count || 0),
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
