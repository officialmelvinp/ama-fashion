import { neon } from "@neondatabase/serverless"
import type { InventoryItem, ProductWithStock, Order, ProductInventory } from "@/lib/types" // Import all necessary types

const sql = neon(process.env.DATABASE_URL!)

// Get inventory for a specific product, now returning ProductInventory type
export async function getProductInventory(productId: string): Promise<ProductInventory | null> {
  try {
    // Assuming product_name and other details are in a 'products' table, joined with 'product_inventory'
    // If product_name is directly in product_inventory, adjust this query.
    const result = await sql`
      SELECT
        pi.product_id,
        p.product_name, -- Assuming 'p' is an alias for a 'products' table
        p.description,
        pi.price_aed as price, -- Using price_aed as the main price for ProductInventory
        'AED' as currency, -- Assuming AED as default currency for this view
        pi.quantity_available,
        (pi.quantity_available = 0 AND pi.preorder_ready_date IS NOT NULL) as preorder_available,
        pi.preorder_ready_date as preorder_eta,
        p.image_url,
        (pi.quantity_available > 0) as isAvailable,
        pi.price_aed as "priceAED",
        pi.price_gbp as "priceGBP"
      FROM product_inventory pi
      JOIN products p ON pi.product_id = p.product_id -- Join with a 'products' table
      WHERE pi.product_id = ${productId} AND pi.status = 'active'
    `
    return (result[0] as ProductInventory) || null
  } catch (error) {
    console.error("Error fetching product inventory:", error)
    return null
  }
}

// Get all products with their stock levels (including out of stock)
export async function getAllProductsWithStock(): Promise<ProductWithStock[]> {
  try {
    const result = await sql`
      SELECT
        product_id as "productId",
        quantity_available as "stockLevel",
        (quantity_available > 0) as "isAvailable",
        price_aed as "priceAED",
        price_gbp as "priceGBP"
      FROM product_inventory
      WHERE status = 'active'
      ORDER BY product_id
    `
    return result as ProductWithStock[]
  } catch (error) {
    console.error("Error fetching products with stock:", error)
    return []
  }
}

// Get all available products (quantity > 0)
export async function getAvailableProducts(): Promise<string[]> {
  try {
    const result = await sql`
      SELECT product_id FROM product_inventory
      WHERE quantity_available > 0 AND status = 'active'
    `
    return result.map((row: any) => row.product_id)
  } catch (error) {
    console.error("Error fetching available products:", error)
    return []
  }
}

// Enhanced stock update with quantity tracking
export async function updateStock(
  productId: string,
  quantityPurchased = 1,
): Promise<{
  success: boolean
  quantityFromStock: number
  quantityPreorder: number
  remainingStock: number
}> {
  try {
    // Get current stock
    const currentStock = await sql`
      SELECT quantity_available FROM product_inventory
      WHERE product_id = ${productId} AND status = 'active'
    `
    if (currentStock.length === 0) {
      return { success: false, quantityFromStock: 0, quantityPreorder: 0, remainingStock: 0 }
    }
    const available = currentStock[0].quantity_available
    const quantityFromStock = Math.min(quantityPurchased, available)
    const quantityPreorder = Math.max(0, quantityPurchased - available)

    // Update stock (don't go below 0)
    const result = await sql`
      UPDATE product_inventory
      SET
        quantity_available = GREATEST(0, quantity_available - ${quantityFromStock}),
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = ${productId} AND status = 'active'
      RETURNING quantity_available
    `
    return {
      success: true,
      quantityFromStock,
      quantityPreorder,
      remainingStock: result[0]?.quantity_available || 0,
    }
  } catch (error) {
    console.error("Error updating stock:", error)
    return { success: false, quantityFromStock: 0, quantityPreorder: 0, remainingStock: 0 }
  }
}

// Admin functions
export async function getAllInventory(): Promise<InventoryItem[]> {
  try {
    const result = await sql`
      SELECT * FROM product_inventory
      WHERE status = 'active'
      ORDER BY product_id
    `
    return result as InventoryItem[]
  } catch (error) {
    console.error("Error fetching all inventory:", error)
    return []
  }
}

export async function updateProductStock(productId: string, newQuantity: number): Promise<boolean> {
  try {
    await sql`
      UPDATE product_inventory
      SET
        quantity_available = ${newQuantity},
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = ${productId} AND status = 'active'
    `
    return true
  } catch (error) {
    console.error("Error updating product stock:", error)
    return false
  }
}

// Enhanced order recording with quantity breakdown
export async function recordOrder(orderData: {
  productId: string
  customerEmail: string
  customerName: string
  quantityOrdered: number
  quantityFromStock: number
  quantityPreorder: number
  paymentStatus: "pending" | "completed" | "failed"
  paymentId?: string
  amountPaid: number
  currency: string
  shippingAddress?: string
  phoneNumber?: string
  notes?: string
  orderType: string
  orderStatus: string
  totalAmount: number
  shippingStatus: string
}): Promise<boolean> {
  try {
    await sql`
      INSERT INTO orders (
        product_id, customer_email, customer_name, quantity_ordered,
        quantity_in_stock, quantity_preorder, payment_status, payment_id,
        amount_paid, currency, shipping_address, phone_number, notes,
        order_type, order_status, total_amount, shipping_status
      ) VALUES (
        ${orderData.productId}, ${orderData.customerEmail}, ${orderData.customerName},
        ${orderData.quantityOrdered}, ${orderData.quantityFromStock}, ${orderData.quantityPreorder},
        ${orderData.paymentStatus}, ${orderData.paymentId || null},
        ${orderData.amountPaid}, ${orderData.currency},
        ${orderData.shippingAddress || null}, ${orderData.phoneNumber || null},
        ${orderData.notes || null}, ${orderData.orderType}, ${orderData.orderStatus}, ${orderData.totalAmount},
        ${orderData.shippingStatus}
      )
    `
    return true
  } catch (error) {
    console.error("Error recording order:", error)
    return false
  }
}

// Get price history for a product
export async function updateProductPrice(
  productId: string,
  newPriceAED: number,
  newPriceGBP: number,
  changeReason?: string,
): Promise<boolean> {
  try {
    const currentPrices = await sql`
      SELECT price_aed, price_gbp FROM product_inventory
      WHERE product_id = ${productId} AND status = 'active'
    `
    if (currentPrices.length > 0) {
      const oldPriceAED = currentPrices[0].price_aed
      const oldPriceGBP = currentPrices[0].price_gbp

      // Record price history
      await sql`
        INSERT INTO price_history (
          product_id, old_price_aed, new_price_aed,
          old_price_gbp, new_price_gbp, change_reason
        ) VALUES (
          ${productId}, ${oldPriceAED}, ${newPriceAED},
          ${oldPriceGBP}, ${newPriceGBP}, ${changeReason || "Admin update"}
        )
      `
    }

    // Update prices
    await sql`
      UPDATE product_inventory
      SET
        price_aed = ${newPriceAED},
        price_gbp = ${newPriceGBP},
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = ${productId} AND status = 'active'
    `
    return true
  } catch (error) {
    console.error("Error updating product price:", error)
    return false
  }
}

// Get price history for a product
export async function getPriceHistory(productId: string): Promise<any[]> {
  try {
    const result = await sql`
      SELECT * FROM price_history
      WHERE product_id = ${productId}
      ORDER BY created_at DESC
      LIMIT 10
    `
    return result
  } catch (error) {
    console.error("Error fetching price history:", error)
    return []
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    // Ensure all columns from the Order interface are selected
    const orders = (await sql`
      SELECT
        o.id, o.product_id, p.product_name AS product_display_name, o.customer_email, o.customer_name, o.quantity_ordered,
        o.quantity_in_stock, o.quantity_preorder, o.payment_status, o.payment_id,
        o.amount_paid, o.currency, o.shipping_address, o.phone_number, o.notes,
        o.order_type, o.order_status, o.total_amount, o.shipping_status,
        o.tracking_number, o.shipping_carrier, o.shipped_date, o.delivered_date,
        o.estimated_delivery_date, o.created_at, o.updated_at
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.product_id
      ORDER BY o.created_at DESC
    `) as Order[]
    return orders
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw new Error("Failed to fetch orders.")
  }
}

export async function getOrderById(orderId: number): Promise<Order | null> {
  try {
    // MODIFIED: Added LEFT JOIN to product_inventory to fetch product_display_name
    const orders = (await sql`
      SELECT
        o.id, o.product_id, p.product_name AS product_display_name, o.customer_email, o.customer_name, o.quantity_ordered,
        o.quantity_in_stock, o.quantity_preorder, o.payment_status, o.payment_id,
        o.amount_paid, o.currency, o.shipping_address, o.phone_number, o.notes,
        o.order_type, o.order_status, o.total_amount, o.shipping_status,
        o.tracking_number, o.shipping_carrier, o.shipped_date, o.delivered_date,
        o.estimated_delivery_date, o.created_at, o.updated_at
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.product_id
      WHERE o.id = ${orderId}
    `) as Order[]
    return orders.length > 0 ? orders[0] : null
  } catch (error) {
    console.error(`Error fetching order with ID ${orderId}:`, error)
    throw new Error(`Failed to fetch order with ID ${orderId}.`)
  }
}
