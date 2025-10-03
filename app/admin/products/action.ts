"use server"

import { neon } from "@neondatabase/serverless" 
import { revalidatePath } from "next/cache"
import type { Product } from "@/lib/types"
import { v4 as uuidv4 } from "uuid" 

const sql = neon(process.env.DATABASE_URL!) 

export async function addProduct(product: Omit<Product, "id" | "created_at" | "updated_at">) {
  try {
    // Generate product_code if not provided by the user or if it's an empty string
    const finalProductCode =
      product.product_code && product.product_code.trim() !== ""
        ? product.product_code.trim()
        : `PROD-${uuidv4().substring(0, 8).toUpperCase()}`

    await sql`
      INSERT INTO products (
        name,
        subtitle,
        materials,
        description,
        price_aed,
        price_gbp,
        image_urls,
        category,
        essences,
        colors,
        product_code,
        quantity_available,
        total_quantity,
        pre_order_date,
        status
      ) VALUES (
        ${product.name},
        ${product.subtitle},
        ${JSON.stringify(product.materials)},
        ${product.description},
        ${product.price_aed},
        ${product.price_gbp},
        ${JSON.stringify(product.image_urls)},
        ${product.category},
        ${JSON.stringify(product.essences)},
        ${finalProductCode}, -- Use the generated/provided code
        ${product.quantity_available},
        ${product.total_quantity},
        ${product.pre_order_date},
        ${product.status}
      );
    `
    revalidatePath("/admin/products")
    revalidatePath("/shop")
    return { success: true, message: "Product added successfully." }
  } catch (error: any) {
    console.error("Error adding product:", error)
    if (
      error.message &&
      error.message.includes('duplicate key value violates unique constraint "products_product_code_key"')
    ) {
      return {
        success: false,
        message:
          "Failed to add product: Product code already exists. Please use a unique code or leave it blank to auto-generate.",
      }
    }
    return { success: false, message: `Failed to add product: ${error.message}` }
  }
}

export async function updateProduct(id: string, product: Omit<Product, "id" | "created_at" | "updated_at">) {
  try {
    // Ensure product_code is null if it's an empty string
    const finalProductCode =
      product.product_code && product.product_code.trim() !== "" ? product.product_code.trim() : null

    await sql`
      UPDATE products
      SET
        name = ${product.name},
        subtitle = ${product.subtitle},
        materials = ${JSON.stringify(product.materials)},
        description = ${product.description},
        price_aed = ${product.price_aed},
        price_gbp = ${product.price_gbp},
        image_urls = ${JSON.stringify(product.image_urls)},
        category = ${product.category},
        essences = ${JSON.stringify(product.essences)},
        product_code = ${finalProductCode}, -- Use the adjusted code
        quantity_available = ${product.quantity_available},
        total_quantity = ${product.total_quantity},
        pre_order_date = ${product.pre_order_date},
        status = ${product.status},
        updated_at = NOW()
      WHERE id = ${id};
    `
    revalidatePath("/admin/products")
    revalidatePath("/shop")
    return { success: true, message: "Product updated successfully." }
  } catch (error: any) {
    console.error("Error updating product:", error)
    if (
      error.message &&
      error.message.includes('duplicate key value violates unique constraint "products_product_code_key"')
    ) {
      return {
        success: false,
        message: "Failed to update product: Product code already exists. Please use a unique code or leave it blank.",
      }
    }
    return { success: false, message: `Failed to update product: ${error.message}` }
  }
}

export async function deleteProduct(productId: string) {
  try {
    await sql`DELETE FROM products WHERE id = ${productId};`
    revalidatePath("/admin/products")
    revalidatePath("/shop")
    return { success: true, message: "Product deleted successfully." }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { success: false, message: "Failed to delete product." }
  }
}
