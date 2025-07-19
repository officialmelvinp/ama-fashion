import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import type { Product } from "@/lib/types"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic" // Ensure dynamic rendering

export async function GET() {
  try {
    const products = await sql`SELECT * FROM products ORDER BY created_at DESC`

    const mappedProducts: Product[] = products.map((row: any) => ({
      id: row.id,
      name: row.name,
      subtitle: row.subtitle,
      description: row.description,
      price_aed: row.price_aed ? Number.parseFloat(row.price_aed) : null,
      price_gbp: row.price_gbp ? Number.parseFloat(row.price_gbp) : null,
      image: row.image_urls?.[0] || "", // Use first image from array as main image
      image_urls: row.image_urls || [],
      category: row.category,
      materials: row.materials || [],
      essences: row.essences || [],
      // Removed: colors: row.colors || [],
      product_code: row.product_code,
      quantity_available: Number.parseInt(row.quantity_available),
      total_quantity: row.total_quantity ? Number.parseInt(row.total_quantity) : null,
      pre_order_date: row.pre_order_date,
      status: row.status,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
    }))

    return NextResponse.json({ products: mappedProducts })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }
}
