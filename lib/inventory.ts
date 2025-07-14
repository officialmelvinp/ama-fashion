import { neon } from "@neondatabase/serverless"
import type { InventoryItem, ProductWithStock, Order, ProductInventory, OrderItem } from "@/lib/types" // Import all necessary types

const sql = neon(process.env.DATABASE_URL!)

// Helper function to get product display name from the database
export async function getProductDisplayName(productId: string): Promise<string> {
  try {
    // Querying product_inventory for product_id as a fallback display name
    const result = await sql`
      SELECT product_id FROM product_inventory WHERE product_id = ${productId}
    `
    if (result.length > 0) {
      // If you have a 'product_name' column in product_inventory, use it here.
      // Otherwise, product_id is the best available display name from this table.
      return result[0].product_id
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
    // Querying product_inventory table
    const result = await sql`
      SELECT
        product_id,
        product_id as product_name, -- Using product_id as product_name for now
        NULL as description, -- Placeholder: Add description to product_inventory or join with 'products' table
        NULL as price, -- Placeholder: Add price to product_inventory or join with 'products' table
        NULL as currency, -- Placeholder: Add currency to product_inventory or join with 'products' table
        NULL as image_url, -- Placeholder: Add image_url to product_inventory or join with 'products' table
        quantity_available as "stockQuantity",
        0 as "preorderQuantity", -- Assuming no dedicated preorder_quantity column in product_inventory
        preorder_ready_date as preorder_eta,
        (quantity_available > 0) as "isAvailable",
        price_aed as "priceAED",
        price_gbp as "priceGBP"
      FROM product_inventory
      WHERE product_id = ${productId} AND status = 'active'
    `
    if (result.length > 0) {
      const row = result[0]
      return {
        product_id: row.product_id,
        product_name: row.product_name,
        description: row.description,
        price: row.price ? Number.parseFloat(row.price as string) : null, // Ensure price is a number or null
        currency: row.currency,
        stockQuantity: row.stockQuantity,
        preorderQuantity: row.preorderQuantity,
        preorder_eta: row.preorder_eta,
        image_url: row.image_url,
        isAvailable: row.isAvailable === true, // Ensure boolean type
        priceAED: row.priceAED ? Number.parseFloat(row.priceAED as string) : null,
        priceGBP: row.priceGBP ? Number.parseFloat(row.priceGBP as string) : null,
      } as ProductInventory
    }
    return null
  } catch (error) {
    console.error(`Error fetching product inventory for ${productId}:`, error)
    throw new Error("Failed to fetch product inventory.")
  }
}

// Get all products with their stock levels (including out of stock)
export async function getAllProductsWithStock(): Promise<ProductWithStock[]> {
  try {
    const result = await sql`
      SELECT
        product_id as "productId",
        quantity_available as "stockLevel", -- Corrected column name
        (quantity_available > 0) as "isAvailable", -- Corrected column name
        price_aed as "priceAED",
        price_gbp as "priceGBP"
      FROM product_inventory -- Corrected table name
      ORDER BY product_id
    `
    // Ensure priceAED and priceGBP are numbers
    return result.map((row) => ({
      ...row,
      priceAED: row.priceAED ? Number.parseFloat(row.priceAED as string) : undefined,
      priceGBP: row.priceGBP ? Number.parseFloat(row.priceGBP as string) : undefined,
    })) as ProductWithStock[]
  } catch (error) {
    console.error("Error fetching products with stock:", error)
    return []
  }
}

// Get all available products (quantity > 0)
export async function getAvailableProducts(): Promise<string[]> {
  try {
    const result = await sql`
      SELECT product_id FROM product_inventory -- Corrected table name
      WHERE quantity_available > 0 -- Corrected column name
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
  quantityOrdered: number,
): Promise<{ success: boolean; quantityFromStock: number; quantityPreorder: number }> {
  try {
    // Fetch from product_inventory
    const productResult = await sql`
      SELECT quantity_available, preorder_ready_date FROM product_inventory
      WHERE product_id = ${productId} AND status = 'active'
    `

    if (productResult.length === 0) {
      console.error(`Product ${productId} not found for stock update.`)
      return { success: false, quantityFromStock: 0, quantityPreorder: 0 }
    }

    let { quantity_available: stockQuantity } = productResult[0]
    let quantityFromStock = 0
    let quantityPreorder = 0

    if (stockQuantity >= quantityOrdered) {
      // Fulfill entirely from stock
      quantityFromStock = quantityOrdered
      stockQuantity -= quantityOrdered
    } else {
      // Fulfill partially from stock, rest from preorder
      quantityFromStock = stockQuantity
      quantityPreorder = quantityOrdered - stockQuantity
      stockQuantity = 0
      // Note: preorder_quantity is not directly updated here as it's not a column in product_inventory
      // If you need to track this, add a 'preorder_quantity' column to product_inventory.
    }

    await sql`
      UPDATE product_inventory -- Corrected table name
      SET
        quantity_available = ${stockQuantity}, -- Corrected column name
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = ${productId}
    `
    return { success: true, quantityFromStock, quantityPreorder }
  } catch (error) {
    console.error(`Error updating stock for product ${productId}:`, error)
    return { success: false, quantityFromStock: 0, quantityPreorder: 0 }
  }
}

// Admin functions
export async function getAllInventory(): Promise<InventoryItem[]> {
  try {
    const result = await sql`
      SELECT
        id, -- Added id as it's in your InventoryItem type and database data
        product_id,
        quantity_available,
        -- Assuming total_quantity is sum of quantity_available and a preorder_quantity column
        -- If not, you might need to calculate it or fetch from another source.
        -- For now, using quantity_available as total_quantity if no explicit preorder_quantity column.
        quantity_available as total_quantity, -- Using quantity_available as total_quantity
        status,
        price_aed,
        price_gbp,
        preorder_ready_date,
        created_at,
        updated_at
      FROM product_inventory -- Corrected table name
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
      UPDATE product_inventory -- Corrected table name
      SET
        quantity_available = ${newQuantity}, -- Corrected column name
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = ${productId}
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
      SELECT price_aed, price_gbp FROM product_inventory -- Corrected table name
      WHERE product_id = ${productId}
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
      UPDATE product_inventory -- Corrected table name
      SET
        price_aed = ${newPriceAED},
        price_gbp = ${newPriceGBP},
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = ${productId}
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
      UPDATE product_inventory -- Corrected table name
      SET
        preorder_ready_date = ${newPreorderDate}, -- Corrected column name
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = ${productId}
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

    // Fetch order items for each order and populate summary fields
    const ordersWithItems = await Promise.all(
      ordersData.map(async (order) => {
        const items = (await sql`
          SELECT
            id, order_id, product_id, product_display_name, quantity, unit_price, currency, created_at, updated_at
          FROM order_items
          WHERE order_id = ${order.id}
          ORDER BY id ASC
        `) as OrderItem[]

        // For the admin page's simplified display, get details of the first item
        const firstItem = items[0] || null
        let product_display_name = "N/A"
        let product_id = "N/A"
        let quantity_ordered = 0
        let quantity_in_stock = 0
        let quantity_preorder = 0

        if (firstItem) {
          product_display_name = firstItem.product_display_name
          product_id = firstItem.product_id
          quantity_ordered = firstItem.quantity
          // Fetch current stock/preorder from product_inventory table for display
          const inventory = await getProductInventory(firstItem.product_id)
          if (inventory) {
            quantity_in_stock = inventory.stockQuantity
            quantity_preorder = inventory.preorderQuantity
          }
        }

        return {
          ...order,
          items,
          product_display_name,
          product_id,
          quantity_ordered,
          quantity_in_stock,
          quantity_preorder,
        }
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

    // For getOrderById, we also need to populate the simplified fields for consistency
    const firstItem = items[0] || null
    let product_display_name = "N/A"
    let product_id = "N/A"
    let quantity_ordered = 0
    let quantity_in_stock = 0
    let quantity_preorder = 0

    if (firstItem) {
      product_display_name = firstItem.product_display_name
      product_id = firstItem.product_id
      quantity_ordered = firstItem.quantity
      const inventory = await getProductInventory(firstItem.product_id)
      if (inventory) {
        quantity_in_stock = inventory.stockQuantity
        quantity_preorder = inventory.preorderQuantity
      }
    }

    return {
      ...order,
      items,
      product_display_name,
      product_id,
      quantity_ordered,
      quantity_in_stock,
      quantity_preorder,
    }
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
interface RecordOrderData {
  items: {
    productId: string
    quantity: number
    price: number
  }[]
  totalAmount: number
  currency: string
  status: string
  customerEmail: string
  paymentIntentId?: string | null
  paypalOrderId?: string | null
  customerName?: string | null
  shippingAddress?: string | null
  phoneNumber?: string | null
  notes?: string | null
  orderType?: "standard" | "preorder" | "mixed" | "purchase" // Added "purchase"
  orderStatus?: string
  shippingStatus?: string
}

export async function recordOrder(
  data: RecordOrderData,
): Promise<{ success: boolean; orderId?: number; message?: string }> {
  const {
    items,
    totalAmount,
    currency,
    status,
    customerEmail,
    paymentIntentId,
    paypalOrderId,
    customerName,
    shippingAddress,
    phoneNumber,
    notes,
    orderType,
    orderStatus,
    shippingStatus,
  } = data

  if (!items || items.length === 0) {
    return { success: false, message: "No items provided for the order." }
  }

  try {
    // Start a transaction
    await sql`BEGIN`

    // Construct notes based on all items
    const allProductNames = (await Promise.all(items.map((item) => getProductDisplayName(item.productId)))).join(", ")
    const totalQuantityOrdered = items.reduce((sum, item) => sum + item.quantity, 0)
    const detailedNotes =
      `Payment completed. Session ID: ${paymentIntentId || paypalOrderId}. Items: ${allProductNames}. Total Quantity: ${totalQuantityOrdered}. ${notes || ""}`.trim()

    // Insert into the main orders table
    const orderResult = await sql`
      INSERT INTO orders (
        product_id, -- ADDED THIS LINE
        customer_email, customer_name, total_amount, currency, payment_status,
        shipping_address, phone_number, notes, order_type, order_status, shipping_status,
        payment_id, -- This will store either Stripe PaymentIntent ID or PayPal Order ID
        created_at, updated_at
      ) VALUES (
        ${items[0].productId}, -- ADDED THIS LINE: Use the product_id of the first item
        ${customerEmail}, ${customerName || null}, ${totalAmount}, ${currency}, ${status},
        ${shippingAddress || null}, ${phoneNumber || null}, ${detailedNotes || null}, ${orderType || "standard"},
        ${orderStatus || "new"}, ${shippingStatus || "pending"},
        ${paymentIntentId || paypalOrderId || null},
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING id
    `
    const orderId = orderResult[0].id

    // Insert each item into the order_items table
    for (const item of items) {
      // Fetch product details to get stock/preorder quantities at the time of order
      const productInventory = await getProductInventory(item.productId)
      if (!productInventory) {
        await sql`ROLLBACK`
        return { success: false, message: `Product ${item.productId} not found during order recording.` }
      }

      let quantityFromStock = 0
      let quantityPreorder = 0

      // Determine how many were from stock and how many from preorder for this specific order item
      if (productInventory.stockQuantity >= item.quantity) {
        quantityFromStock = item.quantity
        quantityPreorder = 0
      } else {
        quantityFromStock = productInventory.stockQuantity
        quantityPreorder = item.quantity - productInventory.stockQuantity
      }

      await sql`
        INSERT INTO order_items (
          order_id, product_id, quantity, unit_price, currency,
          quantity_from_stock, quantity_preorder, created_at, updated_at, product_display_name
        ) VALUES (
          ${orderId}, ${item.productId}, ${item.quantity}, ${item.price}, ${currency},
          ${quantityFromStock}, ${quantityPreorder}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${productInventory.product_name}
        )
      `
    }

    await sql`COMMIT`
    return { success: true, orderId: orderId, message: "Order recorded successfully." }
  } catch (error) {
    await sql`ROLLBACK`
    console.error("Error recording order:", error)
    return { success: false, message: "Failed to record order due to a database error." }
  }
}
