import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface InventoryItem {
  id: number
  product_id: string
  quantity_available: number
  total_quantity: number
  status: string
  price_aed?: number
  price_gbp?: number
  created_at: string
  updated_at: string
}

export interface ProductWithStock {
  productId: string
  stockLevel: number
  isAvailable: boolean
  priceAED?: number
  priceGBP?: number
}

// Get inventory for a specific product
export async function getProductInventory(productId: string): Promise<InventoryItem | null> {
  try {
    const result = await sql`
      SELECT * FROM product_inventory 
      WHERE product_id = ${productId} AND status = 'active'
    `
    return (result[0] as InventoryItem) || null
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

// Get all available products (quantity > 0) - keeping for backward compatibility
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
}): Promise<boolean> {
  try {
    await sql`
      INSERT INTO orders (
        product_id, customer_email, customer_name, 
        quantity_ordered, quantity_in_stock, quantity_preorder,
        payment_status, payment_id, amount_paid, currency,
        shipping_address, phone_number, notes
      ) VALUES (
        ${orderData.productId}, ${orderData.customerEmail}, ${orderData.customerName}, 
        ${orderData.quantityOrdered}, ${orderData.quantityFromStock}, ${orderData.quantityPreorder},
        ${orderData.paymentStatus}, ${orderData.paymentId || null}, 
        ${orderData.amountPaid}, ${orderData.currency},
        ${orderData.shippingAddress || null}, ${orderData.phoneNumber || null}, 
        ${orderData.notes || null}
      )
    `
    return true
  } catch (error) {
    console.error("Error recording order:", error)
    return false
  }
}

// Update product prices with history tracking
export async function updateProductPrice(
  productId: string,
  newPriceAED: number,
  newPriceGBP: number,
  changeReason?: string,
): Promise<boolean> {
  try {
    // Get current prices for history
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
