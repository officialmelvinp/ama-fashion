import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// GET - Fetch all inventory
export async function GET() {
  try {
    const inventory = await sql`
      SELECT * FROM product_inventory 
      WHERE status = 'active'
      ORDER BY product_id
    `

    return NextResponse.json({
      success: true,
      inventory,
    })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch inventory",
        inventory: [],
      },
      { status: 500 },
    )
  }
}

// PUT - Update inventory quantity OR prices OR pre-order date
export async function PUT(request: NextRequest) {
  try {
    const { productId, quantity, priceAED, priceGBP, preOrderDate, updateType } = await request.json()

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

    if (updateType === "prices") {
      // Update prices
      if (priceAED === undefined || priceGBP === undefined) {
        return NextResponse.json({ success: false, error: "Both AED and GBP prices are required" }, { status: 400 })
      }

      await sql`
        UPDATE product_inventory 
        SET 
          price_aed = ${priceAED},
          price_gbp = ${priceGBP},
          updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ${productId} AND status = 'active'
      `

      return NextResponse.json({
        success: true,
        message: `Updated ${productId} prices to ${priceAED} AED / £${priceGBP} GBP`,
      })
    } else if (updateType === "preorder") {
      // Update pre-order date
      await sql`
        UPDATE product_inventory 
        SET 
          preorder_ready_date = ${preOrderDate || null},
          updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ${productId} AND status = 'active'
      `

      return NextResponse.json({
        success: true,
        message: preOrderDate
          ? `Updated ${productId} pre-order date to ${preOrderDate}`
          : `Cleared ${productId} pre-order date`,
      })
    } else {
      // Update stock quantity
      if (quantity < 0) {
        return NextResponse.json({ success: false, error: "Quantity cannot be negative" }, { status: 400 })
      }

      await sql`
        UPDATE product_inventory 
        SET 
          quantity_available = ${quantity},
          updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ${productId} AND status = 'active'
      `

      return NextResponse.json({
        success: true,
        message: `Updated ${productId} quantity to ${quantity}`,
      })
    }
  } catch (error) {
    console.error("Error updating inventory:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update inventory",
      },
      { status: 500 },
    )
  }
}
