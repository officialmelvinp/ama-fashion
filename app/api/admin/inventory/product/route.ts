import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import type { Product } from "@/lib/types"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const productData: Omit<Product, "id" | "created_at" | "updated_at"> = await request.json()

    // Validation
    if (!productData.name || !productData.description || !productData.status) {
      return NextResponse.json(
        { error: "Missing required fields: name, description, and status are required" },
        { status: 400 },
      )
    }

    // The 'image' field from productData is the URL of the uploaded image.
    // We need to ensure it's added to the image_urls array.
    const imageUrlsToStore = productData.image ? [productData.image] : []

    // Check category limit if this is a new category
    if (productData.category) {
      const existingCategories = await sql`
        SELECT DISTINCT category 
        FROM products 
        WHERE category IS NOT NULL 
        AND category != '' 
        AND status = 'active'
      `

      const categoryExists = existingCategories.some(
        (cat) => cat.category.toLowerCase() === productData.category!.toLowerCase(),
      )

      if (!categoryExists && existingCategories.length >= 10) {
        return NextResponse.json(
          { error: "Maximum 10 categories allowed. Please deactivate a category first or use an existing one." },
          { status: 400 },
        )
      }
    }

    // Insert new product
    const newProduct = await sql`
      INSERT INTO products (
        name, 
        subtitle,
        description, 
        price_aed, 
        price_gbp,
        image_urls, -- Only store image_urls, not a separate 'image' column
        category,
        materials,
        essences,
        -- Removed: colors,
        product_code,
        quantity_available,
        total_quantity,
        pre_order_date,
        status
      ) VALUES (
        ${productData.name},
        ${productData.subtitle || null},
        ${productData.description},
        ${productData.price_aed || null},
        ${productData.price_gbp || null},
        ${JSON.stringify(imageUrlsToStore)}::jsonb, -- Store as JSONB array
        ${productData.category || null},
        ${JSON.stringify(productData.materials || [])}::jsonb,
        ${JSON.stringify(productData.essences || [])}::jsonb,
        ${productData.product_code || `AUTO-${Date.now()}` || null},
        ${productData.quantity_available || 0},
        ${productData.total_quantity || null},
        ${productData.pre_order_date || null},
        ${productData.status}
      )
      RETURNING *;
    `

    // Parse the returned product data
    const product = {
      ...newProduct[0],
      price_aed: newProduct[0].price_aed ? Number.parseFloat(newProduct[0].price_aed.toString()) : null,
      price_gbp: newProduct[0].price_gbp ? Number.parseFloat(newProduct[0].price_gbp.toString()) : null,
      quantity_available: Number(newProduct[0].quantity_available || 0),
      total_quantity: newProduct[0].total_quantity ? Number(newProduct[0].total_quantity) : null,
      image_urls: Array.isArray(newProduct[0].image_urls)
        ? newProduct[0].image_urls
        : JSON.parse(newProduct[0].image_urls || "[]"),
      materials: Array.isArray(newProduct[0].materials)
        ? newProduct[0].materials
        : JSON.parse(newProduct[0].materials || "[]"),
      essences: Array.isArray(newProduct[0].essences)
        ? newProduct[0].essences
        : JSON.parse(newProduct[0].essences || "[]"),
        
      // Ensure 'image' field is derived from image_urls for consistency
      image:
        Array.isArray(newProduct[0].image_urls) && newProduct[0].image_urls.length > 0
          ? newProduct[0].image_urls[0]
          : "",
    }

    return NextResponse.json(
      {
        success: true,
        product: product,
        message: "Product added successfully!",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("API Error adding product:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to add product",
      },
      { status: 500 },
    )
  }
}
