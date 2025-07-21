import { type NextRequest, NextResponse } from "next/server"
import { getProductById, deleteProduct, updateProduct } from "@/lib/inventory"
import type { Product } from "@/lib/types" 

export async function GET(req: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const { productId } = params
    const product = await getProductById(productId)

    if (product) {
      return NextResponse.json(product, { status: 200 })
    } else {
      return NextResponse.json({ message: "Product not found." }, { status: 404 })
    }
  } catch (error) {
    console.error(`Error fetching product ${params.productId}:`, error)
    return NextResponse.json({ message: "Internal server error." }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const { productId } = params
    const success = await deleteProduct(productId)

    if (success) {
      return NextResponse.json({ message: "Product deleted successfully." }, { status: 200 })
    } else {
      return NextResponse.json({ message: "Failed to delete product or product not found." }, { status: 404 })
    }
  } catch (error) {
    console.error(`Error deleting product ${params.productId}:`, error)
    return NextResponse.json({ message: "Internal server error." }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { productId: string } }) {
  try {
    // Await params before destructuring productId
    const { productId } = await params
    const updates: Partial<Product> = await req.json() // Get updates from body

    if (!productId) {
      return NextResponse.json({ message: "Product ID is required for update." }, { status: 400 })
    }

    // Adjust quantity based on status for updates
    if (updates.status === "out-of-stock") {
      updates.quantity_available = 0
      updates.total_quantity = 0
      updates.pre_order_date = null
    } else if (updates.status === "pre-order" && !updates.pre_order_date) {
      return NextResponse.json({ message: "Pre-order products require a pre-order date." }, { status: 400 })
    } else if (updates.status === "pre-order") {
      updates.quantity_available = 0 // No stock available immediately
    }

    const success = await updateProduct(productId, updates) // Pass productId and updates

    if (success) {
      return NextResponse.json({ message: "Product updated successfully." }, { status: 200 })
    } else {
      return NextResponse.json({ message: "Failed to update product or product not found." }, { status: 404 })
    }
  } catch (error) {
    console.error(`Error updating product ${params.productId}:`, error)
    return NextResponse.json({ message: "Internal server error." }, { status: 500 })
  }
}
