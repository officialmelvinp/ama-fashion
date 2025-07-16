import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const db = neon(process.env.DATABASE_URL!);
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "daily";
    const type = searchParams.get("type") || "revenue";

    if (type === "revenue") {
      let dateTruncExpression = "DATE_TRUNC('day', o.created_at)";
      let dateFormat = "YYYY-MM-DD";

      if (period === "weekly") {
        dateTruncExpression = "DATE_TRUNC('week', o.created_at)";
        dateFormat = "YYYY-MM-DD";
      } else if (period === "monthly") {
        dateTruncExpression = "DATE_TRUNC('month', o.created_at)";
        dateFormat = "YYYY-MM";
      }

      // Build the query string entirely
      const query = `
        SELECT
          TO_CHAR(${dateTruncExpression}::timestamp, '${dateFormat}') AS date,
          SUM(oi.quantity * oi.unit_price) AS total_revenue
        FROM
          orders o
        JOIN
          order_items oi ON o.id = oi.order_id
        WHERE
          o.order_status = 'completed'
        GROUP BY
          date
        ORDER BY
          date ASC;
      `;

      const revenueData = await db(query);

      const formattedData = revenueData.map((row) => ({
        date: row.date,
        total_revenue: Number.parseFloat(row.total_revenue),
      }));

      return NextResponse.json(formattedData);
    } 
    
    else if (type === "top-products") {
      const topProductsData = await db`
        SELECT
          oi.product_display_name,
          SUM(oi.quantity) AS total_quantity_sold,
          SUM(oi.quantity * oi.unit_price) AS total_revenue_generated
        FROM
          order_items oi
        JOIN
          orders o ON oi.order_id = o.id
        WHERE
          o.order_status = 'completed'
        GROUP BY
          oi.product_display_name
        ORDER BY
          total_quantity_sold DESC
        LIMIT 5;
      `;

      const formattedData = topProductsData.map((row) => ({
        product_display_name: row.product_display_name,
        total_quantity_sold: Number.parseInt(row.total_quantity_sold),
        total_revenue_generated: Number.parseFloat(row.total_revenue_generated),
      }));

      return NextResponse.json(formattedData);
    } 
    
    else if (type === "subscriber-growth") {
      const subscriberGrowthData = await db`
        SELECT
          TO_CHAR(created_at, 'YYYY-MM') AS month,
          COUNT(*) AS subscribers
        FROM
          subscribers
        GROUP BY
          month
        ORDER BY
          month ASC;
      `;

      const formattedData = subscriberGrowthData.map((row) => ({
        month: row.month,
        subscribers: Number.parseInt(row.subscribers),
      }));

      return NextResponse.json(formattedData);
    } 
    
    else {
      return NextResponse.json(
        { error: "Invalid analytics type" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
