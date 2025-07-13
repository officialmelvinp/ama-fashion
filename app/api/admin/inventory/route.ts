import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless" // Use neon for consistency
import { updateProductStock, updateProductPrice, updatePreorderDate } from "@/lib/inventory" // Import specific update functions

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const inventory = await sql`
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
      WHERE status = 'active'
      ORDER BY product_id
    `
    return NextResponse.json({ inventory }, { status: 200 })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { productId, quantity, priceAED, priceGBP, preOrderDate, updateType } = await request.json()

    console.log(`Received PUT request for product ${productId} with updateType: ${updateType}`)

    let success = false
    let message = "No update performed."

    switch (updateType) {
      case "stock":
        if (quantity === undefined) {
          return NextResponse.json({ error: "Missing quantity for stock update" }, { status: 400 })
        }
        console.log(`Attempting to update stock for ${productId} to ${quantity}`)
        success = await updateProductStock(productId, quantity)
        message = success
          ? `Stock for ${productId} updated to ${quantity}.`
          : `Failed to update stock for ${productId}.`
        break
      case "prices":
        if (priceAED === undefined || priceGBP === undefined) {
          return NextResponse.json({ error: "Missing priceAED or priceGBP for price update" }, { status: 400 })
        }
        console.log(`Attempting to update prices for ${productId} to AED ${priceAED}, GBP ${priceGBP}`)
        success = await updateProductPrice(productId, priceAED, priceGBP, "Admin Panel Update")
        message = success ? `Prices for ${productId} updated.` : `Failed to update prices for ${productId}.`
        break
      case "preorder":
        if (preOrderDate === undefined) {
          return NextResponse.json({ error: "Missing preOrderDate for pre-order update" }, { status: 400 })
        }
        console.log(`Attempting to update pre-order date for ${productId} to ${preOrderDate}`)
        success = await updatePreorderDate(productId, preOrderDate)
        message = success
          ? `Pre-order date for ${productId} updated to ${preOrderDate || "null"}.`
          : `Failed to update pre-order date for ${productId}.`
        break
      default:
        return NextResponse.json({ error: "Invalid update type" }, { status: 400 })
    }

    if (success) {
      console.log(`✅ ${message}`)
      return NextResponse.json({ success: true, message }, { status: 200 })
    } else {
      console.error(`❌ ${message}`)
      return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error in PUT /api/admin/inventory:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 })
  }
}
