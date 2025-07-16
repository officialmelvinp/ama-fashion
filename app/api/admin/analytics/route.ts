import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "daily";
    const type = searchParams.get("type") || "revenue";

    if (type === "revenue") {
      let dateTruncClause = "DATE_TRUNC('day', o.created_at)";
      let dateFormat = "YYYY-MM-DD";

      if (period === "weekly") {
        dateTruncClause = "DATE_TRUNC('week', o.created_at)";
        dateFormat = "YYYY-MM-DD";
      } else if (period === "monthly") {
        dateTruncClause = "DATE_TRUNC('month', o.created_at)";
        dateFormat = "YYYY-MM";
      }

      // ✅ Compose SQL string directly to avoid parameter issues
      const query = `
        SELECT
          TO_CHAR(${dateTruncClause}, '${dateFormat}') AS date,
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

      const revenueData = await sql(query);

      const formattedData = revenueData.map((row: any) => ({
        date: row.date,
        total_revenue: Number.parseFloat(row.total_revenue),
      }));

      return NextResponse.json(formattedData);
    } else if (type === "top-products") {
      const query = `
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

      const topProductsData = await sql(query);

      const formattedData = topProductsData.map((row: any) => ({
        product_display_name: row.product_display_name,
        total_quantity_sold: Number.parseInt(row.total_quantity_sold),
        total_revenue_generated: Number.parseFloat(row.total_revenue_generated),
      }));

      return NextResponse.json(formattedData);
    } else {
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
