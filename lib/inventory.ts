import { neon } from "@neondatabase/serverless"
import type { InventoryItem, ProductWithStock, Order, ProductInventory, OrderItem } from "@/lib/types" // Import all necessary types

const sql = neon(process.env.DATABASE_URL!)

// Helper function to get product display name from the database
export async function getProductDisplayName(productId: string): Promise<string> {
  try {
    const result = await sql`
      SELECT product_name FROM products WHERE product_id = ${productId}
    `
    if (result.length > 0) {
      return result[0].product_name
    }
    console.warn(`Product display name not found for ID: ${productId}. Using fallback.`)
    return `AMA Fashion Item (${productId})` // Fallback if not found
  } catch (error) {
    console.error(`Error fetching product display name for ${productId}:`, error)
    return `AMA Fashion Item (${productId})` // Fallback on error
  }
}

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

// NEW: Function to update pre-order date
export async function updatePreorderDate(productId: string, newPreorderDate: string | null): Promise<boolean> {
  try {
    await sql`
      UPDATE product_inventory
      SET
        preorder_ready_date = ${newPreorderDate},
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = ${productId} AND status = 'active'
    `
    return true
  } catch (error) {
    console.error("Error updating pre-order date:", error)
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
    const ordersData = (await sql`
      SELECT
        id, customer_email, customer_name, payment_status, payment_id,
        total_amount, currency, shipping_address, phone_number, notes,
        order_type, order_status, shipping_status,
        tracking_number, shipping_carrier, shipped_date, delivered_date,
        estimated_delivery_date, created_at, updated_at
      FROM orders
      ORDER BY created_at DESC
    `) as Order[]

    // Fetch order items for each order
    const ordersWithItems = await Promise.all(
      ordersData.map(async (order) => {
        const items = (await sql`
          SELECT
            id, order_id, product_id, product_display_name, quantity, unit_price, currency, created_at, updated_at
          FROM order_items
          WHERE order_id = ${order.id}
          ORDER BY id ASC
        `) as OrderItem[]
        return { ...order, items }
      }),
    )

    return ordersWithItems
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw new Error("Failed to fetch orders.")
  }
}

export async function getOrderById(orderId: number): Promise<Order | null> {
  try {
    const orders = (await sql`
      SELECT
        id, customer_email, customer_name, payment_status, payment_id,
        total_amount, currency, shipping_address, phone_number, notes,
        order_type, order_status, shipping_status,
        tracking_number, shipping_carrier, shipped_date, delivered_date,
        estimated_delivery_date, created_at, updated_at
      FROM orders
      WHERE id = ${orderId}
    `) as Order[]

    if (orders.length === 0) {
      return null
    }

    const order = orders[0]

    const items = (await sql`
      SELECT
        id, order_id, product_id, product_display_name, quantity, unit_price, currency, created_at, updated_at
      FROM order_items
      WHERE order_id = ${order.id}
      ORDER BY id ASC
    `) as OrderItem[]

    return { ...order, items }
  } catch (error) {
    console.error(`Error fetching order with ID ${orderId}:`, error)
    throw new Error(`Failed to fetch order with ID ${orderId}.`)
  }
}

/**
 * Records a new order.
 * In a real application, this would interact with a database to persist order details.
 * @param orderData - The data for the order to be recorded.
 * @returns A success message or an error.
 */
export async function recordOrder(orderData: {
  items: Array<{ productId: string; quantity: number; price: number }>
  totalAmount: number
  currency: string
  status: string
  customerEmail: string
  paymentIntentId?: string // Optional: for Stripe payment intent ID
  paypalOrderId?: string // Optional: for PayPal order ID
  // Add any other relevant order details like shipping address, customer ID, etc.
}) {
  console.log("--- Recording Order ---")
  console.log("Order Data:", JSON.stringify(orderData, null, 2))
  console.log("-----------------------")

  // Placeholder for actual database interaction
  // Example:
  // const newOrder = await sql`
  //   INSERT INTO orders (
  //     customer_email, customer_name, payment_status, total_amount, currency,
  //     payment_id, order_type, order_status, shipping_status
  //   ) VALUES (
  //     ${orderData.customerEmail},
  //     ${orderData.customerName || 'Guest'}, // Assuming customerName might be optional
  //     ${orderData.status},
  //     ${orderData.totalAmount},
  //     ${orderData.currency},
  //     ${orderData.paymentIntentId || orderData.paypalOrderId || null},
  //     ${orderData.items.some(item => item.quantityPreorder > 0) ? 'preorder' : 'standard'}, // Determine order type
  //     'new', // Initial order status
  //     'pending' // Initial shipping status
  //   ) RETURNING id
  // `
  // const orderId = newOrder[0].id;

  // // Insert order items
  // for (const item of orderData.items) {
  //   await sql`
  //     INSERT INTO order_items (
  //       order_id, product_id, product_display_name, quantity, unit_price, currency
  //     ) VALUES (
  //       ${orderId},
  //       ${item.productId},
  //       ${await getProductDisplayName(item.productId)}, // Fetch display name
  //       ${item.quantity},
  //       ${item.price},
  //       ${orderData.currency}
  //     )
  //   `
  // }

  // For now, just simulate success
  return { success: true, message: "Order recorded successfully (simulated)" }
}

/**
 * Placeholder function to get available quantity of a product.
 * In a real application, this would query your product inventory.
 * @param productId - The ID of the product.
 * @returns The available quantity.
 */
export async function getAvailableQuantity(productId: string): Promise<number> {
  console.log(`Simulating fetching available quantity for product: ${productId}`)
  // Return a dummy quantity for demonstration
  return 100
}

/**
 * Placeholder function to update the quantity of a product.
 * In a real application, this would update your product inventory.
 * @param productId - The ID of the product.
 * @param quantityChange - The amount to change the quantity by (positive for add, negative for subtract).
 * @returns True if successful, false otherwise.
 */
export async function updateQuantity(productId: string, quantityChange: number): Promise<boolean> {
  console.log(`Simulating updating quantity for product ${productId} by ${quantityChange}`)
  // Simulate success
  return true
}
