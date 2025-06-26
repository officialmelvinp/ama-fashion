import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params

    const result = await sql`
      SELECT 
        id,
        product_id,
        quantity_available,
        total_quantity,
        status,
        price_aed,
        price_gbp,
        preorder_ready_date,
        created_at,
        updated_at
      FROM product_inventory 
      WHERE product_id = ${productId} AND status = 'active'
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      product: result[0],
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch product" }, { status: 500 })
  }
}
