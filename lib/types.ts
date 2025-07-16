// This file defines common types used across the application.
// NEW: Define Region type for consistency
export type Region = "UAE" | "UK"

// Moved Product type from shop-client.tsx and added optional properties for cart
export interface Product {
  id: string
  name: string
  subtitle: string
  materials: string[]
  description: string
  priceAED: string
  priceGBP: string
  images: string[]
  category: string
  essences: string[]
  colors?: string[]
  selectedColor?: string
  materialLine?: string
  productCode?: string
  stockLevel?: number // Added from shop-client.tsx
  isAvailable?: boolean // Added from shop-client.tsx
  // selectedQuantity and selectedRegion will be part of CartItem, not base Product
}

// NEW: Define CartItem type
export interface CartItem extends Product {
  selectedQuantity: number
  selectedRegion: Region
  selectedPrice: string // The formatted price string for the selected region
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: string
  product_display_name: string
  quantity: number
  unit_price: number
  currency: string
  created_at: string
  updated_at: string
}

export interface ProductInventory {
  product_id: string
  product_name: string
  description: string | null // Can be null if not in DB or joined
  price: number | null // Can be null if not in DB or joined
  currency: string | null // Can be null if not in DB or joined
  stockQuantity: number // Renamed from quantity_available
  preorderQuantity: number // Renamed from preorder_available
  preorder_eta?: string | null // Changed from Date | null to string | null to match DB
  image_url?: string | null // Can be null if not in DB or joined
  isAvailable?: boolean
  priceAED?: number | null
  priceGBP?: number | null
}

export interface Order {
  id: number
  customer_email: string
  customer_name: string | null
  payment_status: "pending" | "completed" | "failed" | string
  payment_id: string | null
  shipping_address: string | null
  phone_number: string | null
  notes: string | null
  order_type: string
  order_status: string // This is the overall order status (e.g., 'new', 'processing', 'completed')
  total_amount: number // Total amount for the order
  currency: string // Keep currency for the total amount
  shipping_status: "pending" | "paid" | "shipped" | "delivered" | string // Specific status for shipping
  tracking_number: string | null // New field for tracking number
  shipping_carrier: string | null // New field for shipping carrier
  shipped_date: string | null // New field for when the order was shipped
  delivered_date: string | null // New field for when the order was delivered
  estimated_delivery_date: string | null // New field for estimated delivery
  created_at: string
  updated_at: string
  items: OrderItem[] // Array of order items (will be populated by API or constructed)
  // ADDED: Fields that are still directly on the 'orders' table in your DB, made optional
  product_id?: string // From orders table
  product_display_name?: string // From join with products table
  quantity_ordered?: number // From orders table
  quantity_in_stock?: number // ADDED: Derived from product_inventory for display
  quantity_preorder?: number // ADDED: Derived from product_inventory for display
  amount_paid?: number // From orders table, now explicitly number after casting
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

// NEW: Type for data passed to email functions for each item
export interface OrderItemEmailData {
  product_id: string // ADD THIS LINE
  product_display_name: string
  quantity: number
  unit_price: number
  currency: string
}

// Base type for all order-related email data
export interface BaseOrderEmailData {
  customer_email: string
  customer_name: string | null // MODIFIED: Allow customer_name to be null
  order_id: string
  items: OrderItemEmailData[]
  total_amount: number
  currency: string
}

// Specific type for Order Confirmation Email
export interface OrderConfirmationEmailData extends BaseOrderEmailData {
  payment_status: string
  shipping_status: string
}

// Specific type for Order Shipped Email
export interface OrderShippedEmailData extends BaseOrderEmailData {
  tracking_number: string | null // Made nullable to match component
  shipping_carrier: string | null // Made nullable to match component
  estimated_delivery_date: string | null // Made nullable to match component
  shipped_date: string | null // Made nullable to match component
}

// Specific type for Order Delivered Email
export interface OrderDeliveredEmailData extends BaseOrderEmailData {
  delivered_date: string | null // Made nullable to match component
}

// Specific type for Newsletter Welcome Email
export interface NewsletterWelcomeEmailData {
  customer_name: string
  email: string
}

// Specific type for Vendor Notification Email
export interface VendorNotificationEmailData {
  order_id: string
  customer_name: string | null // MODIFIED: Allow customer_name to be null
  customer_email: string
  payment_id?: string | null
  phone_number: string | null
  shipping_address: string | null
  total_amount: number
  currency: string
  items: OrderItemEmailData[]
  payment_method: string
}

export interface RecordOrderData {
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
