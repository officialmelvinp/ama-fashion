import { NextResponse } from "next/server"
import { getAllProductsWithStock } from "@/lib/inventory"

export async function GET() {
  try {
    const productsWithStock = await getAllProductsWithStock()

    // Create a map for easy lookup
    const stockMap = productsWithStock.reduce(
      (acc, product) => {
        acc[product.productId] = {
          stockLevel: product.stockLevel,
          isAvailable: product.isAvailable,
          priceAED: product.priceAED,
          priceGBP: product.priceGBP,
        }
        return acc
      },
      {} as Record<string, any>,
    )

    // Also return the old format for backward compatibility
    const availableProducts = productsWithStock.filter((p) => p.isAvailable).map((p) => p.productId)

    return NextResponse.json({
      success: true,
      availableProducts, // Old format
      productsWithStock: stockMap, // New enhanced format
    })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch inventory" }, { status: 500 })
  }
}
