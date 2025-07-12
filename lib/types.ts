// This file defines common types used across the application.

export interface ProductInventory {
  product_id: string
  product_name: string
  description: string
  price: number
  currency: string
  quantity_available: number
  preorder_available: boolean
  preorder_eta?: Date | null
  image_url?: string | null
  isAvailable?: boolean
  priceAED?: number | null
  priceGBP?: number | null
}

export interface Order {
  id: number
  product_id: string
  customer_email: string
  customer_name: string
  quantity_ordered: number
  quantity_in_stock: number
  quantity_preorder: number
  payment_status: "pending" | "completed" | "failed" | string
  payment_id: string | null
  amount_paid: number
  currency: string
  shipping_address: string | null
  phone_number: string | null
  notes: string | null
  order_type: string
  order_status: string // This is the overall order status (e.g., 'new', 'processing', 'completed')
  total_amount: number
  shipping_status: "pending" | "paid" | "shipped" | "delivered" | string // Specific status for shipping
  tracking_number: string | null // New field for tracking number
  shipping_carrier: string | null // New field for shipping carrier
  shipped_date: string | null // New field for when the order was shipped
  delivered_date: string | null // New field for when the order was delivered
  estimated_delivery_date: string | null // New field for estimated delivery
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: number
  product_id: string
  quantity_available: number
  total_quantity: number
  status: string
  price_aed?: number
  price_gbp?: number
  preorder_ready_date?: string | null
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

export interface Subscriber {
  email: string
  created_at: string
  status: string
}
