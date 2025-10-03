import { NextResponse } from "next/server"
import { getAllProducts } from "@/lib/inventory"

export const dynamic = "force-dynamic" 

export async function GET() {
  try {
    const products = await getAllProducts()
    return NextResponse.json({ products }, { status: 200 })
  } catch (error: any) {
    console.error("API Error fetching products:", error)
    return new NextResponse(JSON.stringify({ error: error.message || "Failed to fetch products" }), { status: 500 })
  }
}
