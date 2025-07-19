import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import type { Product } from "@/lib/types"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    // Execute the query. We explicitly cast the result to 'any' first,
    // then to 'Product[]' to bypass the problematic type inference.
    const products: Product[] = (await sql`
      SELECT * FROM products WHERE status IN ('active', 'pre-order', 'out-of-stock') ORDER BY name ASC;
    `) as any as Product[]

    // Explicitly convert price fields to numbers as they might come as strings from Postgres NUMERIC type
    const productsWithParsedPrices = products.map((product) => ({
      ...product,
      price_aed: product.price_aed !== null ? Number.parseFloat(product.price_aed.toString()) : null,
      price_gbp: product.price_gbp !== null ? Number.parseFloat(product.price_gbp.toString()) : null,
    }))

    return NextResponse.json({ success: true, productsWithStock: productsWithParsedPrices }, { status: 200 })
  } catch (error) {
    console.error("Error fetching available products:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch available products" }, { status: 500 })
  }
}
