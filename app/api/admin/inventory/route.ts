import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import type { Product } from "@/lib/types"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const products = await sql`SELECT * FROM products ORDER BY name ASC;`

    // Type assertion and price parsing
    const productsWithParsedPrices = (products as Product[]).map((product) => ({
      ...product,
      price_aed: product.price_aed !== null ? Number.parseFloat(product.price_aed.toString()) : null,
      price_gbp: product.price_gbp !== null ? Number.parseFloat(product.price_gbp.toString()) : null,
    }))

    return NextResponse.json(
      {
        success: true,
        products: productsWithParsedPrices,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching admin inventory products:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch admin inventory products",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { id, updates } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

    // Handle different update scenarios with separate queries
    let result

    if (updates.quantity_available !== undefined) {
      result = await sql`
        UPDATE products 
        SET quantity_available = ${updates.quantity_available}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `
    } else if (updates.total_quantity !== undefined) {
      result = await sql`
        UPDATE products 
        SET total_quantity = ${updates.total_quantity}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `
    } else if (updates.price_aed !== undefined && updates.price_gbp !== undefined) {
      result = await sql`
        UPDATE products 
        SET price_aed = ${updates.price_aed}, price_gbp = ${updates.price_gbp}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `
    } else if (updates.price_aed !== undefined) {
      result = await sql`
        UPDATE products 
        SET price_aed = ${updates.price_aed}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `
    } else if (updates.price_gbp !== undefined) {
      result = await sql`
        UPDATE products 
        SET price_gbp = ${updates.price_gbp}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `
    } else if (updates.pre_order_date !== undefined) {
      result = await sql`
        UPDATE products 
        SET pre_order_date = ${updates.pre_order_date}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `
    } else if (updates.status !== undefined) {
      result = await sql`
        UPDATE products 
        SET status = ${updates.status}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `
    } else {
      return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 })
    }

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    // Parse the updated product
    const updatedProduct = {
      ...result[0],
      price_aed: result[0].price_aed ? Number.parseFloat(result[0].price_aed.toString()) : null,
      price_gbp: result[0].price_gbp ? Number.parseFloat(result[0].price_gbp.toString()) : null,
    }

    return NextResponse.json(
      {
        success: true,
        product: updatedProduct,
        message: "Product updated successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
