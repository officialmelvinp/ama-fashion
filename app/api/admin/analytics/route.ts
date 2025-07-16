import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const db = neon(process.env.DATABASE_URL!);
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "daily";
    const type = searchParams.get("type") || "revenue";

    console.log(`[ANALYTICS API] Request received: type=${type}, period=${period}`);

    if (type === "revenue") {
      let dateTruncFunction: string;
      let dateFormatString: string;

      if (period === "weekly") {
        dateTruncFunction = "DATE_TRUNC('week', o.created_at)";
        dateFormatString = "YYYY-MM-DD";
      } else if (period === "monthly") {
        dateTruncFunction = "DATE_TRUNC('month', o.created_at)";
        dateFormatString = "YYYY-MM";
      } else {
        dateTruncFunction = "DATE_TRUNC('day', o.created_at)";
        dateFormatString = "YYYY-MM-DD";
      }

      // Construct the full TO_CHAR expression as a string
      const selectDateExpression = `TO_CHAR(${dateTruncFunction}::timestamp, '${dateFormatString}')`;

      const query = `
        SELECT
          ${selectDateExpression} AS date,
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

      console.log(`[ANALYTICS API] Executing revenue query for period: ${period}`);
      const revenueData = await db(query);
      console.log("[ANALYTICS API] Raw revenue data from DB:", revenueData);

      const formattedData = revenueData.map((row) => ({
        date: row.date,
        total_revenue: Number.parseFloat(row.total_revenue),
      }));

      console.log("[ANALYTICS API] Formatted revenue data:", formattedData);
      return NextResponse.json(formattedData);

    } else if (type === "top-products") {
      console.log("[ANALYTICS API] Executing top products query.");
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
      console.log("[ANALYTICS API] Raw top products data from DB:", topProductsData);

      const formattedData = topProductsData.map((row) => ({
        product_display_name: row.product_display_name,
        total_quantity_sold: Number.parseInt(row.total_quantity_sold),
        total_revenue_generated: Number.parseFloat(row.total_revenue_generated),
      }));

      console.log("[ANALYTICS API] Formatted top products data:", formattedData);
      return NextResponse.json(formattedData);

    } else {
      console.warn(`[ANALYTICS API] Invalid analytics type: ${type}`);
      return NextResponse.json(
        { error: "Invalid analytics type" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[ANALYTICS API] Error fetching analytics data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
