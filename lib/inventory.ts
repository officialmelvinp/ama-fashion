import { neon } from "@neondatabase/serverless"
import type {
  Product,
  ProductStatus,
  Order,
  OrderItem,
  RecordOrderData,
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
} from "@/lib/types"

const sql = neon(process.env.DATABASE_URL!)

// Helper to convert DB row to Product type
const mapProductRow = (row: any): Product => ({
  id: row.id,
  name: row.name,
  subtitle: row.subtitle,
  description: row.description,
  price_aed: row.price_aed ? Number.parseFloat(row.price_aed) : null,
  price_gbp: row.price_gbp ? Number.parseFloat(row.price_gbp) : null,
  image: row.image_urls?.[0] || "", // Use first image from array as main image
  image_urls: row.image_urls || [],
  category: row.category,
  materials: row.materials || [],
  essences: row.essences || [],
  product_code: row.product_code,
  quantity_available: Number.parseInt(row.quantity_available),
  total_quantity: row.total_quantity ? Number.parseInt(row.total_quantity) : null,
  pre_order_date: row.pre_order_date,
  status: row.status as ProductStatus,
  created_at: row.created_at,
  updated_at: row.updated_at,
})

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const products = await sql`SELECT * FROM products WHERE status = 'active' ORDER BY created_at DESC`
    return products.map(mapProductRow)
  } catch (error) {
    console.error("Error fetching all products:", error)
    throw new Error("Failed to fetch products.")
  }
}

export const getInventory = getAllProducts // Alias for backward compatibility

// Helper function to get product display name from the database
export async function getProductDisplayName(productId: string): Promise<string> {
  try {
    const result = await sql`
      SELECT name FROM products WHERE id = ${productId}
    `
    if (result.length > 0) {
      return result[0].name
    }
    console.warn(`Product display name not found for ID: ${productId}. Using fallback.`)
    return `AMA Fashion Item (${productId})` // Fallback if not found
  } catch (error) {
    console.error(`Error fetching product display name for ${productId}:`, error)
    return `AMA Fashion Item (${productId})` // Fallback on error
  }
}

// Get a single product by ID, now returning the comprehensive Product type
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const result = await sql`
      SELECT
        id,
        name,
        subtitle,
        materials,
        description,
        price_aed,
        price_gbp,
        image_urls,
        category,
        essences,
        product_code,
        quantity_available,
        total_quantity,
        pre_order_date,
        status,
        created_at,
        updated_at
      FROM products
      WHERE id = ${productId}
    `
    if (result.length > 0) {
      const row = result[0]
      return {
        id: row.id,
        name: row.name,
        subtitle: row.subtitle,
        materials: row.materials,
        description: row.description,
        price_aed: row.price_aed ? Number.parseFloat(row.price_aed as string) : null,
        price_gbp: row.price_gbp ? Number.parseFloat(row.price_gbp as string) : null,
        image: row.image_urls?.[0] || "", // Use first image from array as main image
        image_urls: row.image_urls || [],
        category: row.category,
        essences: row.essences,
        product_code: row.product_code,
        quantity_available: row.quantity_available,
        total_quantity: row.total_quantity,
        pre_order_date: row.pre_order_date ? new Date(row.pre_order_date).toISOString() : null,
        status: row.status as ProductStatus,
        created_at: row.created_at ? new Date(row.created_at).toISOString() : "",
        updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : "",
      }
    }
    return null
  } catch (error) {
    console.error(`Error fetching product by ID ${productId}:`, error)
    throw new Error("Failed to fetch product details.")
  }
}

// Alias getProductById as getProductInventory for backward compatibility
export { getProductById as getProductInventory }

// Get all products for the shop page (only active ones)
export async function getShopProducts(): Promise<Product[]> {
  try {
    const result = await sql`
      SELECT
        id,
        name,
        subtitle,
        materials,
        description,
        price_aed,
        price_gbp,
        image_urls,
        category,
        essences,
        product_code,
        quantity_available,
        total_quantity,
        pre_order_date,
        status,
        created_at,
        updated_at
      FROM products
      WHERE status = 'active' OR status = 'pre-order' OR status = 'out-of-stock' -- Include out-of-stock for display
      ORDER BY name
    `
    return result.map((row) => ({
      id: row.id,
      name: row.name,
      subtitle: row.subtitle,
      materials: row.materials,
      description: row.description,
      price_aed: row.price_aed ? Number.parseFloat(row.price_aed as string) : null,
      price_gbp: row.price_gbp ? Number.parseFloat(row.price_gbp as string) : null,
      image: row.image_urls?.[0] || "", // Use first image from array as main image
      image_urls: row.image_urls || [],
      category: row.category,
      essences: row.essences,
      product_code: row.product_code,
      quantity_available: row.quantity_available,
      total_quantity: row.total_quantity,
      pre_order_date: row.pre_order_date ? new Date(row.pre_order_date).toISOString() : null,
      status: row.status as ProductStatus,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : "",
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : "",
    })) as Product[]
  } catch (error) {
    console.error("Error fetching shop products:", error)
    return []
  }
}

// Get all products for admin inventory page (including inactive/out of stock)
export async function getAdminProducts(): Promise<Product[]> {
  try {
    const result = await sql`
      SELECT
        id,
        name,
        subtitle,
        materials,
        description,
        price_aed,
        price_gbp,
        image_urls,
        category,
        essences,
        product_code,
        quantity_available,
        total_quantity,
        pre_order_date,
        status,
        created_at,
        updated_at
      FROM products
      ORDER BY name
    `
    return result.map((row) => ({
      id: row.id,
      name: row.name,
      subtitle: row.subtitle,
      materials: row.materials,
      description: row.description,
      price_aed: row.price_aed ? Number.parseFloat(row.price_aed as string) : null,
      price_gbp: row.price_gbp ? Number.parseFloat(row.price_gbp as string) : null,
      image: row.image_urls?.[0] || "", // Use first image from array as main image
      image_urls: row.image_urls || [],
      category: row.category,
      essences: row.essences,
      product_code: row.product_code,
      quantity_available: row.quantity_available,
      total_quantity: row.total_quantity,
      pre_order_date: row.pre_order_date ? new Date(row.pre_order_date).toISOString() : null,
      status: row.status as ProductStatus,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : "",
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : "",
    })) as Product[]
  } catch (error) {
    console.error("Error fetching all products for admin:", error)
    return []
  }
}

// Update product details (used by admin/products and admin/inventory)
export async function updateProduct(
  productId: string,
  updates: Partial<Omit<Product, "id" | "created_at" | "updated_at">>,
): Promise<boolean> {
  try {
    const {
      name,
      subtitle,
      materials,
      description,
      price_aed,
      price_gbp,
      image, // This 'image' field is the primary image path
      image_urls, // This is the full array from the client
      category,
      essences,
      product_code,
      quantity_available,
      total_quantity,
      pre_order_date,
      status,
    } = updates

    // Construct the final image_urls array for storage
    // If 'image' is provided and it's not already the first in image_urls,
    // ensure it becomes the first element in the image_urls array.
    let finalImageUrls = Array.isArray(image_urls) ? [...image_urls] : []
    if (image && finalImageUrls[0] !== image) {
      finalImageUrls = [image, ...finalImageUrls.filter((url) => url !== image)]
    } else if (image && finalImageUrls.length === 0) {
      finalImageUrls = [image] // If image_urls is empty, just add the image
    }

    // Use RETURNING id to check if any row was updated
    const updateResult = await sql`
      UPDATE products
      SET
        name = COALESCE(${name ?? null}, name),
        subtitle = COALESCE(${subtitle ?? null}, subtitle),
        materials = COALESCE(${materials ? JSON.stringify(materials) : null}::jsonb, materials),
        description = COALESCE(${description ?? null}, description),
        price_aed = COALESCE(${price_aed ?? null}, price_aed),
        price_gbp = COALESCE(${price_gbp ?? null}, price_gbp),
        image_urls = ${JSON.stringify(finalImageUrls)}::jsonb, -- Explicitly set image_urls
        category = COALESCE(${category ?? null}, category),
        essences = COALESCE(${essences ? JSON.stringify(essences) : null}::jsonb, essences),
        product_code = COALESCE(${product_code ?? null}, product_code),
        quantity_available = COALESCE(${quantity_available ?? null}, quantity_available),
        total_quantity = COALESCE(${total_quantity ?? null}, total_quantity),
        pre_order_date = COALESCE(${pre_order_date ?? null}, pre_order_date),
        status = COALESCE(${status ?? null}, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${productId}
      RETURNING id
    `
    return updateResult.length > 0 // Check length of returned rows
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error)
    return false
  }
}

// Enhanced stock update with quantity tracking
export async function updateStock(
  productId: string,
  quantityOrdered: number,
): Promise<{ success: boolean; quantityFromStock: number; quantityPreorder: number }> {
  try {
    // Fetch from products table
    const productResult = await sql`
      SELECT quantity_available, pre_order_date, status FROM products
      WHERE id = ${productId}
    `
    if (productResult.length === 0) {
      console.error(`Product ${productId} not found for stock update.`)
      return { success: false, quantityFromStock: 0, quantityPreorder: 0 }
    }

    let { quantity_available: stockQuantity, status: productStatus } = productResult[0]

    let quantityFromStock = 0
    let quantityPreorder = 0

    if (productStatus === "pre-order") {
      // If product is pre-order, all ordered quantity is pre-order
      quantityPreorder = quantityOrdered
    } else if (stockQuantity >= quantityOrdered) {
      // Fulfill entirely from stock
      quantityFromStock = quantityOrdered
      stockQuantity -= quantityOrdered
    } else {
      // Fulfill partially from stock, rest from preorder (if applicable)
      quantityFromStock = stockQuantity
      quantityPreorder = quantityOrdered - stockQuantity
      stockQuantity = 0
    }

    // Use RETURNING id to check if any row was updated
    const updateResult = await sql`
      UPDATE products
      SET
        quantity_available = ${stockQuantity},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${productId}
      RETURNING id
    `

    if (updateResult.length > 0) {
      return { success: true, quantityFromStock, quantityPreorder }
    }

    return { success: false, quantityFromStock: 0, quantityPreorder: 0 }
  } catch (error) {
    console.error(`Error updating stock for product ${productId}:`, error)
    return { success: false, quantityFromStock: 0, quantityPreorder: 0 }
  }
}

// Update product price and record history
export async function updateProductPrice(
  productId: string,
  newPriceAED: number,
  newPriceGBP: number,
  changeReason?: string,
): Promise<boolean> {
  try {
    const currentPrices = await sql`
      SELECT price_aed, price_gbp FROM products
      WHERE id = ${productId}
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

    // Use RETURNING id to check if any row was updated
    const updateResult = await sql`
      UPDATE products
      SET
        price_aed = ${newPriceAED},
        price_gbp = ${newPriceGBP},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${productId}
      RETURNING id
    `
    return updateResult.length > 0
  } catch (error) {
    console.error("Error updating product price:", error)
    return false
  }
}

// NEW: Function to update pre-order date
export async function updatePreorderDate(productId: string, newPreorderDate: string | null): Promise<boolean> {
  try {
    // Use RETURNING id to check if any row was updated
    const updateResult = await sql`
      UPDATE products
      SET
        pre_order_date = ${newPreorderDate},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${productId}
      RETURNING id
    `
    return updateResult.length > 0
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
    console.log("[lib/inventory] Fetching orders from database...")
    const ordersData = (await sql`
      SELECT
        id::text as id, customer_email, customer_name, payment_status, payment_id,
        total_amount, currency, shipping_address, phone_number, notes,
        order_type, order_status, shipping_status,
        tracking_number, shipping_carrier, shipped_date, delivered_date,
        estimated_delivery_date, created_at, updated_at, amount_paid
      FROM orders
      ORDER BY created_at DESC
    `) as Order[]
    console.log("getOrders: Fetched ordersData:", ordersData.length, "orders")
    console.log("[lib/inventory] Raw orders data fetched:", ordersData.length, "orders")

    // Fetch order items for each order and populate summary fields
    const ordersWithItems = await Promise.all(
      ordersData.map(async (order) => {
        const rawItems = await sql`
          SELECT
            id, order_id, product_id, product_display_name, quantity, unit_price, currency, created_at, updated_at,
            quantity_from_stock, quantity_preorder
          FROM order_items
          WHERE order_id = ${order.id}
          ORDER BY id ASC
        `
        console.log(`getOrders: Fetched ${rawItems.length} items for order ID: ${order.id}`)
        console.log("getOrders: Raw items for order:", rawItems) // Log raw items to see their structure
        const items: OrderItem[] = rawItems.map((item: any) => ({
          ...item,
          unit_price: Number.parseFloat(item.unit_price), // Convert to number here
          quantity: Number.parseInt(item.quantity), // Ensure quantity is also a number
        }))
        console.log(`[lib/inventory] Order ${order.id} has ${items.length} items.`)

        return {
          ...order,
          id: String(order.id),
          items,
          total_amount: Number.parseFloat(order.total_amount as any), // Ensure total_amount is number
          amount_paid: order.amount_paid ? Number.parseFloat(order.amount_paid as any) : null, // Ensure amount_paid is number or null
          payment_status: order.payment_status as PaymentStatus,
          order_status: order.order_status as OrderStatus,
          shipping_status: order.shipping_status as ShippingStatus,
        }
      }),
    )
    console.log("[lib/inventory] Orders with items processed.")
    return ordersWithItems
  } catch (error) {
    console.error("[lib/inventory] Error fetching orders:", error)
    throw new Error("Failed to fetch orders.")
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const orders = (await sql`
      SELECT
        id::text as id, customer_email, customer_name, payment_status, payment_id,
        total_amount, currency, shipping_address, phone_number, notes,
        order_type, order_status, shipping_status,
        tracking_number, shipping_carrier, shipped_date, delivered_date,
        estimated_delivery_date, created_at, updated_at, amount_paid
      FROM orders
      WHERE id = ${orderId}
    `) as Order[]
    console.log(`getOrderById: Fetched ${orders.length} orders for ID: ${orderId}`)

    if (orders.length === 0) {
      return null
    }

    const order = orders[0]

    const rawItemsById = await sql`
      SELECT
        id, order_id, product_id, product_display_name, quantity, unit_price, currency, created_at, updated_at,
        quantity_from_stock, quantity_preorder
      FROM order_items
      WHERE order_id = ${order.id}
      ORDER BY id ASC
    `
    console.log(`getOrderById: Fetched ${rawItemsById.length} items for order ID: ${order.id}`)
    console.log("getOrderById: Raw items for single order:", rawItemsById) // Log raw items to see their structure
    const items: OrderItem[] = rawItemsById.map((item: any) => ({
      ...item,
      unit_price: Number.parseFloat(item.unit_price), // Convert to number here
      quantity: Number.parseInt(item.quantity), // Ensure quantity is also a number
    }))

    return {
      ...order,
      id: String(order.id),
      items,
      total_amount: Number.parseFloat(order.total_amount as any), // Ensure total_amount is number
      amount_paid: order.amount_paid ? Number.parseFloat(order.amount_paid as any) : null, // Ensure amount_paid is number or null
      payment_status: order.payment_status as PaymentStatus,
      order_status: order.order_status as OrderStatus,
      shipping_status: order.shipping_status as ShippingStatus,
    }
  } catch (error) {
    console.error(`Error fetching order with ID ${orderId}:`, error)
    throw new Error(`Failed to fetch order with ID ${orderId}.`)
  }
}

export async function recordOrder(
  data: RecordOrderData,
): Promise<{ success: boolean; orderId?: string; message?: string }> {
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

  // Determine the payment_id to use for idempotency check
  const uniquePaymentId = paymentIntentId || paypalOrderId

  // --- Idempotency Check ---
  if (uniquePaymentId) {
    try {
      const existingOrder = await sql`
        SELECT id FROM orders
        WHERE payment_id = ${uniquePaymentId}
      `
      if (existingOrder.length > 0) {
        console.log(
          `Order with payment_id ${uniquePaymentId} already exists (ID: ${existingOrder[0].id}). Skipping duplicate record.`,
        )
        return { success: true, orderId: existingOrder[0].id, message: "Order already recorded." }
      }
    } catch (error) {
      console.error(`Error checking for existing order with payment_id ${uniquePaymentId}:`, error)
      // Continue to attempt recording, but log the issue
    }
  }
  // --- End Idempotency Check ---

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
        customer_email, customer_name, total_amount, currency, payment_status,
        shipping_address, phone_number, notes, order_type, order_status, shipping_status,
        payment_id,
        amount_paid,
        created_at, updated_at
      ) VALUES (
        ${customerEmail}, ${customerName || null}, ${totalAmount}, ${currency}, ${status},
        ${shippingAddress || null}, ${phoneNumber || null}, ${detailedNotes || null}, ${orderType || "standard"},
        ${orderStatus || "Pending"}, ${shippingStatus || "Pending"},
        ${paymentIntentId || paypalOrderId || null},
        ${totalAmount},
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING id
    `
    const orderId = orderResult[0].id

    // Insert each item into the order_items table
    for (const item of items) {
      // Fetch product details to get stock/preorder quantities at the time of order
      const product = await getProductById(item.productId)
      if (!product) {
        await sql`ROLLBACK`
        return { success: false, message: `Product ${item.productId} not found during order recording.` }
      }

      let quantityFromStock = 0
      let quantityPreorder = 0

      // Determine how many were from stock and how many from preorder for this specific order item
      if (product.status === "pre-order") {
        quantityPreorder = item.quantity
      } else if (product.quantity_available >= item.quantity) {
        quantityFromStock = item.quantity // All from stock
      } else {
        quantityFromStock = product.quantity_available // Partial from stock
        quantityPreorder = item.quantity - product.quantity_available // Rest from preorder
      }

      await sql`
        INSERT INTO order_items (
          order_id, product_id, quantity, unit_price, currency,
          quantity_from_stock, quantity_preorder, created_at, updated_at, product_display_name
        ) VALUES (
          ${orderId}, ${item.productId}, ${item.quantity}, ${item.price}, ${currency},
          ${quantityFromStock}, ${quantityPreorder}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${product.name}
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

export async function updateOrder(
  orderId: string,
  updates: Partial<Omit<Order, "id" | "items" | "created_at" | "updated_at">>,
): Promise<boolean> {
  try {
    const {
      customer_email,
      customer_name,
      payment_status,
      payment_id,
      shipping_address,
      phone_number,
      notes,
      order_type,
      order_status,
      shipping_status,
      tracking_number,
      shipping_carrier,
      shipped_date,
      delivered_date,
      estimated_delivery_date,
      total_amount,
      currency,
      amount_paid,
    } = updates

    // Use RETURNING id to check if any row was updated
    const updateResult = await sql`
      UPDATE orders
      SET
        customer_email = COALESCE(${customer_email ?? null}, customer_email),
        customer_name = COALESCE(${customer_name ?? null}, customer_name),
        total_amount = COALESCE(${total_amount ?? null}, total_amount),
        currency = COALESCE(${currency ?? null}, currency),
        payment_status = COALESCE(${payment_status ?? null}, payment_status),
        payment_id = COALESCE(${payment_id ?? null}, payment_id),
        shipping_address = COALESCE(${shipping_address ?? null}, shipping_address),
        phone_number = COALESCE(${phone_number ?? null}, phone_number),
        notes = COALESCE(${notes ?? null}, notes),
        order_type = COALESCE(${order_type ?? null}, order_type),
        order_status = COALESCE(${order_status ?? null}, order_status),
        shipping_status = COALESCE(${shipping_status ?? null}, shipping_status),
        tracking_number = COALESCE(${tracking_number ?? null}, tracking_number),
        shipping_carrier = COALESCE(${shipping_carrier ?? null}, shipping_carrier),
        shipped_date = COALESCE(${shipped_date ?? null}, shipped_date),
        delivered_date = COALESCE(${delivered_date ?? null}, delivered_date),
        estimated_delivery_date = COALESCE(${estimated_delivery_date ?? null}, estimated_delivery_date),
        amount_paid = COALESCE(${amount_paid ?? null}, amount_paid),
        updated_at = NOW()
      WHERE id = ${orderId}
      RETURNING id
    `
    return updateResult.length > 0
  } catch (error) {
    console.error(`Error updating order ${orderId}:`, error)
    return false
  }
}

export async function updateOrderItem(
  itemId: string,
  updates: Partial<Omit<OrderItem, "id" | "order_id" | "created_at" | "updated_at">>,
): Promise<boolean> {
  try {
    const { product_id, product_display_name, quantity, unit_price, currency, quantity_from_stock, quantity_preorder } =
      updates

    // Use RETURNING id to check if any row was updated
    const updateResult = await sql`
      UPDATE order_items
      SET
        product_id = COALESCE(${product_id ?? null}, product_id),
        product_display_name = COALESCE(${product_display_name ?? null}, product_display_name),
        quantity = COALESCE(${quantity ?? null}, quantity),
        unit_price = COALESCE(${unit_price ?? null}, unit_price),
        currency = COALESCE(${currency ?? null}, currency),
        quantity_from_stock = COALESCE(${quantity_from_stock ?? null}, quantity_from_stock),
        quantity_preorder = COALESCE(${quantity_preorder ?? null}, quantity_preorder),
        updated_at = NOW()
      WHERE id = ${itemId}
      RETURNING id
    `
    return updateResult.length > 0
  } catch (error) {
    console.error(`Error updating order item ${itemId}:`, error)
    return false
  }
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  try {
    // Start a transaction to ensure atomicity
    await sql`BEGIN`

    // Delete order items first
    await sql`DELETE FROM order_items WHERE order_id = ${orderId}`

    // Then delete the order itself
    // Use RETURNING id to check if any row was deleted
    const deleteResult = await sql`DELETE FROM orders WHERE id = ${orderId} RETURNING id`

    await sql`COMMIT`
    return deleteResult.length > 0
  } catch (error) {
    await sql`ROLLBACK`
    console.error(`Error deleting order ${orderId}:`, error)
    return false
  }
}

export async function deleteOrderItem(itemId: string): Promise<boolean> {
  try {
    // Use RETURNING id to check if any row was deleted
    const deleteResult = await sql`DELETE FROM order_items WHERE id = ${itemId} RETURNING id`
    return deleteResult.length > 0
  } catch (error) {
    console.error(`Error deleting order item ${itemId}:`, error)
    return false
  }
}

export async function addProduct(
  productData: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<Product | null> {
  try {
    const {
      name,
      subtitle,
      description,
      price_aed,
      price_gbp,
      image, // This is the primary image URL from the client
      image_urls, // This is the full array from the client (if provided)
      category,
      materials,
      essences,
      product_code,
      quantity_available,
      total_quantity,
      pre_order_date,
      status,
    } = productData

    // Construct the final image_urls array for storage
    // If 'image' is provided, ensure it's the first element in the image_urls array.
    let finalImageUrls = Array.isArray(image_urls) ? [...image_urls] : []
    if (image && finalImageUrls[0] !== image) {
      finalImageUrls = [image, ...finalImageUrls.filter((url) => url !== image)]
    } else if (image && finalImageUrls.length === 0) {
      finalImageUrls = [image] // If image_urls is empty, just add the image
    }

    const result = await sql`
      INSERT INTO products (
        name, subtitle, description, price_aed, price_gbp, image_urls, category, materials, essences,
        product_code, quantity_available, total_quantity, pre_order_date, status, created_at, updated_at
      ) VALUES (
        ${name},
        ${subtitle ?? null},
        ${description},
        ${price_aed ?? null},
        ${price_gbp ?? null},
        ${JSON.stringify(finalImageUrls)}::jsonb, -- Store as JSONB array
        ${category ?? null},
        ${JSON.stringify(materials || [])}::jsonb,
        ${JSON.stringify(essences || [])}::jsonb,
        ${product_code ?? null},
        ${quantity_available ?? 0},
        ${total_quantity ?? null},
        ${pre_order_date ?? null},
        ${status ?? "active"},
        NOW(), NOW()
      )
      RETURNING *;
    `
    const newProductDb = result[0]

    return {
      id: newProductDb.id,
      name: newProductDb.name,
      subtitle: newProductDb.subtitle,
      description: newProductDb.description,
      price_aed: newProductDb.price_aed,
      price_gbp: newProductDb.price_gbp,
      image: newProductDb.image_urls?.[0] || "", // Use first image from array as main image
      image_urls: newProductDb.image_urls,
      category: newProductDb.category,
      materials: newProductDb.materials,
      essences: newProductDb.essences,
      product_code: newProductDb.product_code,
      quantity_available: newProductDb.quantity_available,
      total_quantity: newProductDb.total_quantity,
      pre_order_date: newProductDb.pre_order_date,
      status: newProductDb.status,
      created_at: newProductDb.created_at,
      updated_at: newProductDb.updated_at,
    }
  } catch (error) {
    console.error("Error in addProduct:", error)
    throw error
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    // Use RETURNING id to check if any row was deleted
    const result = await sql`DELETE FROM products WHERE id = ${id} RETURNING id;`
    return result.length > 0 // Check length of returned rows
  } catch (error) {
    console.error("Error in deleteProduct:", error)
    throw error
  }
}

export async function getDashboardStats() {
  try {
    const totalRevenueAEDResult = await sql`
      SELECT COALESCE(SUM(total_amount), 0) as total_revenue_aed FROM orders WHERE order_status = 'Completed' AND currency = 'AED';
    `
    const totalRevenueGBPResult = await sql`
      SELECT COALESCE(SUM(total_amount), 0) as total_revenue_gbp FROM orders WHERE order_status = 'Completed' AND currency = 'GBP';
    `
    const totalOrdersResult = await sql`
      SELECT COUNT(*) as total_orders FROM orders;
    `
    const totalProductsResult = await sql`
      SELECT COUNT(*) as total_products FROM products;
    `
    const totalCustomersResult = await sql`
      SELECT COUNT(DISTINCT customer_email) as total_customers FROM orders;
    `

    console.log("getDashboardStats: totalRevenueAEDResult:", totalRevenueAEDResult)
    console.log("getDashboardStats: totalRevenueGBPResult:", totalRevenueGBPResult)
    console.log("getDashboardStats: totalOrdersResult:", totalOrdersResult)
    console.log("getDashboardStats: totalProductsResult:", totalProductsResult)
    console.log("getDashboardStats: totalCustomersResult:", totalCustomersResult)

    return {
      totalRevenueAED: totalRevenueAEDResult[0]?.total_revenue_aed || 0,
      totalRevenueGBP: totalRevenueGBPResult[0]?.total_revenue_gbp || 0,
      totalOrders: totalOrdersResult[0]?.total_orders || 0,
      totalProducts: totalProductsResult[0]?.total_products || 0,
      totalCustomers: totalCustomersResult[0]?.total_customers || 0,
    }
  } catch (error) {
    console.error("getDashboardStats: Error fetching dashboard stats:", error)
    return {
      totalRevenueAED: 0,
      totalRevenueGBP: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalCustomers: 0,
    }
  }
}

export async function getAnalyticsData() {
  try {
    const result = await sql`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM-DD') as date,
        SUM(total_amount) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE order_status = 'Completed'
      GROUP BY date
      ORDER BY date ASC;
    `
    return result || []
  } catch (error) {
    console.error("getAnalyticsData: Error fetching analytics data:", error)
    return []
  }
}

export async function getCategoriesWithProductCounts() {
  try {
    const result = await sql`
      SELECT
        category,
        COUNT(id) AS product_count,
        COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_products
    FROM products
    WHERE category IS NOT NULL AND category != ''
    GROUP BY category
    ORDER BY category ASC;
  `
    return result.map((row) => ({
      category: row.category,
      product_count: Number(row.product_count),
      active_products: Number(row.active_products),
    }))
  } catch (error) {
    console.error("Error fetching categories with product counts:", error)
    return []
  }
}
