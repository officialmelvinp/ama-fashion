import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic" // Ensure dynamic rendering

export async function GET() {
  try {
    console.log("[API] DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not Set")
    // Product Stats
    const totalProductsResult = await sql`SELECT COUNT(*) as total_products FROM products;`
    console.log("[API] totalProductsResult:", totalProductsResult)
    const inStockProductsResult =
      await sql`SELECT COUNT(*) as in_stock_products FROM products WHERE quantity_available > 0;`
    console.log("[API] inStockProductsResult:", inStockProductsResult)
    const soldOutProductsResult =
      await sql`SELECT COUNT(*) as sold_out_products FROM products WHERE quantity_available = 0;`
    console.log("[API] soldOutProductsResult:", soldOutProductsResult)
    const lowStockProductsResult = await sql`
  SELECT id, name, quantity_available FROM products
  WHERE quantity_available > 0 AND quantity_available <= 5 AND status = 'active'
  ORDER BY quantity_available ASC;
`
    console.log("[API] lowStockProductsResult:", lowStockProductsResult)

    // Order Stats
    const totalOrdersResult = await sql`SELECT COUNT(*) as total_orders FROM orders;`
    const paidOrdersResult = await sql`SELECT COUNT(*) as paid_orders FROM orders WHERE payment_status = 'Paid';`
    const pendingOrdersResult =
      await sql`SELECT COUNT(*) as pending_orders FROM orders WHERE payment_status = 'Pending';`
    const totalRevenueAEDResult =
      await sql`SELECT COALESCE(SUM(total_amount), 0) as total_revenue_aed FROM orders WHERE order_status = 'Completed' AND currency = 'AED';`
    const totalRevenueGBPResult =
      await sql`SELECT COALESCE(SUM(total_amount), 0) as total_revenue_gbp FROM orders WHERE order_status = 'Completed' AND currency = 'GBP';`

    // Subscriber Stats (assuming a 'subscribers' table exists)
    // If you don't have a 'subscribers' table, you might need to adjust this or remove it.
    const totalSubscribersResult = await sql`SELECT COUNT(*) as total_subscribers FROM subscribers;`

    // Recent Orders (fetching top 5 unique orders with their first product name)
    const recentOrdersRaw = await sql`
  SELECT
    o.id,
    o.customer_name,
    o.amount_paid,
    o.currency,
    o.payment_status,
    o.created_at,
    (SELECT oi.product_display_name FROM order_items oi WHERE oi.order_id = o.id ORDER BY oi.created_at ASC LIMIT 1) as product_display_name
  FROM orders o
  ORDER BY o.created_at DESC
  LIMIT 5;
`

    const totalProducts = Number(totalProductsResult[0]?.total_products || 0)
    const inStockProducts = Number(inStockProductsResult[0]?.in_stock_products || 0)
    const soldOutProducts = Number(soldOutProductsResult[0]?.sold_out_products || 0)
    const lowStockProducts = lowStockProductsResult.map((item: any) => ({
      id: item.id,
      name: item.name,
      quantity_available: Number(item.quantity_available),
    }))

    const totalOrders = Number(totalOrdersResult[0]?.total_orders || 0)
    const paidOrders = Number(paidOrdersResult[0]?.paid_orders || 0)
    const pendingOrders = Number(pendingOrdersResult[0]?.pending_orders || 0)
    const totalRevenueAED = Number(totalRevenueAEDResult[0]?.total_revenue_aed || 0)
    const totalRevenueGBP = Number(totalRevenueGBPResult[0]?.total_revenue_gbp || 0)
    const totalSubscribers = Number(totalSubscribersResult[0]?.total_subscribers || 0)

    const recentOrders = recentOrdersRaw.map((order: any) => ({
      id: order.id,
      customer_name: order.customer_name,
      product_id: order.product_display_name || "N/A", // Use the fetched product_display_name
      amount_paid: Number.parseFloat(order.amount_paid?.toString() || "0"),
      currency: order.currency,
      payment_status: order.payment_status,
      created_at: order.created_at,
    }))

    return NextResponse.json({
      totalProducts,
      inStockProducts,
      soldOutProducts,
      lowStockProducts,
      totalOrders,
      paidOrders,
      pendingOrders,
      totalRevenueAED,
      totalRevenueGBP,
      totalSubscribers,
      recentOrders,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
