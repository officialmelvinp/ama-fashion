// This file defines common types used across the application.
// NEW: Define Region type for consistency
export type Region = "UAE" | "UK"

// Product type now directly reflects the products table schema
export type ProductStatus = "active" | "inactive" | "out-of-stock" | "pre-order"
export interface Product {
  id: string // UUID from DB
  name: string
  subtitle?: string | null // Made optional and nullable to match DB
  description: string
  price_aed: number | null // Changed to number | null to match DB NUMERIC type
  price_gbp: number | null // Changed to number | null to match DB NUMERIC type
  image: string
  image_urls: string[] // Changed from 'images' to 'image_urls' and ensured string[] for JSONB
  category?: string | null // Made optional and nullable to match DB
  materials: string[] // Ensured string[] for JSONB
  essences: string[] // Ensured string[] for JSONB
  // colors: string[] // Removed - This was the source of the error!
  product_code?: string | null // Changed from 'productCode' to 'product_code' and made optional/nullable
  quantity_available: number // Matches DB column
  total_quantity?: number | null // Matches DB column, made optional/nullable
  pre_order_date?: string | null // Matches DB column, made optional/nullable
  status: ProductStatus // Matches DB column, using enum
  created_at: string
  updated_at: string
  // Removed client-side only properties like selectedColor, materialLine, stockLevel, isAvailable
  // as they are not part of the core Product data from the database.
  // stockLevel and isAvailable will be part of ProductWithStock or derived at runtime.
}

export interface CartItem {
  id: string
  name: string
  subtitle?: string | null // Corrected: Made optional and nullable to match Product
  image_urls: string[] | null
  selectedPrice: {
    currency: string
    amount: number
  }
  selectedQuantity: number // Changed from 'quantity' to 'selectedQuantity' for consistency
  category: string | null
  selectedRegion: Region
  product_code: string | null // Added product_code to CartItem
  price_aed: number | null
  price_gbp: number | null
  description: string | null
  materials: string[] | null
  essences: string[] | null
  quantity_available: number | null
  total_quantity: number | null
  pre_order_date: string | null
  status: ProductStatus
  created_at: string
  updated_at: string
}

// OrderItem now uses UUIDs for IDs and includes new quantity field
export interface OrderItem {
  id: string // Changed to string (UUID)
  order_id: string // Changed to string (UUID)
  product_id: string // Changed to string (UUID)
  product_display_name: string
  quantity: number
  unit_price: number
  currency: string
  quantity_from_stock: number // Added from DB schema
  quantity_preorder: number // Added from DB schema
  created_at: string
  updated_at: string
}

// Order type now reflects the desired orders table schema (without product_id directly)
export interface Order {
  id: string // Changed to string (UUID)
  customer_email: string
  customer_name?: string | null
  total_amount: number
  currency: string
  payment_status: PaymentStatus // Using enum
  payment_id?: string | null
  shipping_address?: string | null
  phone_number?: string | null
  notes?: string | null
  order_type: "standard" | "preorder" | "mixed" | "purchase"
  order_status: OrderStatus // Using enum
  shipping_status: ShippingStatus // Using enum
  tracking_number?: string | null
  shipping_carrier?: string | null
  shipped_date?: string | null
  delivered_date?: string | null
  estimated_delivery_date?: string | null
  amount_paid?: number | null // Kept as optional for now, as it was in your provided data
  created_at: string
  updated_at: string
  items: OrderItem[] // Changed to non-optional, assuming getOrderById always returns an array
  // Removed product_id, product_display_name, quantity_ordered, quantity_in_stock, quantity_preorder
  // as these are now part of the OrderItem[] array
}

// Removed ProductInventory and InventoryItem as they are redundant with the updated Product type
export interface ProductWithStock {
  productId: string
  stockLevel: number
  isAvailable: boolean
  price_aed?: number // Changed to price_aed to match DB and Product type
  price_gbp?: number // Changed to price_gbp to match DB and Product type
}

export interface OrderItemEmailData {
  product_id: string // UUID
  product_display_name: string
  quantity: number
  unit_price: number
  currency: string
}

// NEW: DashboardStats and AnalyticsDataPoint types (from previous context)
export interface DashboardStats {
  totalRevenueAED: number
  totalRevenueGBP: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  inStockProducts: number // Added for dashboard
  soldOutProducts: number // Added for dashboard
  lowStockProducts: { id: string; name: string; quantity_available: number }[] // Added for dashboard
  recentOrders: {
    id: string
    customer_name: string | null
    product_id: string // This is product_display_name from DB
    amount_paid: number
    currency: string
    payment_status: string
    created_at: string
  }[] // Added for dashboard
}

export interface AnalyticsDataPoint {
  date: string
  revenue: number
  orders: number
}

export interface TopProductData {
  product_display_name: string
  total_quantity_sold: number
  total_revenue_generated: number
}

// Enums for consistency
export enum OrderStatus {
  New = "New", // Changed to PascalCase for consistency with other enums
  Processing = "Processing",
  Completed = "Completed",
  Shipped = "Shipped",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
  Refunded = "Refunded",
  OnHold = "On-Hold",
}

export enum ShippingStatus {
  Pending = "Pending",
  Paid = "Paid", // Added 'Paid' status
  Shipped = "Shipped",
  Delivered = "Delivered",
  Returned = "Returned",
  Failed = "Failed",
}

export enum PaymentStatus {
  Pending = "Pending",
  Processing = "Processing",
  Completed = "Completed",
  Failed = "Failed",
  Refunded = "Refunded",
}

// Base type for all order-related email data
export interface BaseOrderEmailData {
  customer_email: string
  customer_name: string | null
  order_id: string
  items: OrderItemEmailData[]
  total_amount: number
  currency: string
}

// Specific type for Order Confirmation Email
export interface OrderConfirmationEmailData extends BaseOrderEmailData {
  payment_status: string // Can use PaymentStatus enum
  shipping_status: string // Can use ShippingStatus enum
}

// Specific type for Order Shipped Email
export interface OrderShippedEmailData extends BaseOrderEmailData {
  tracking_number: string | null
  shipping_carrier: string | null
  estimated_delivery_date: string | null
  shipped_date: string | null
}

// Specific type for Order Delivered Email
export interface OrderDeliveredEmailData extends BaseOrderEmailData {
  delivered_date: string | null
}

// Specific type for Newsletter Welcome Email
export interface NewsletterWelcomeEmailData {
  customer_name: string
  email: string
}

// Specific type for Vendor Notification Email
export interface VendorNotificationEmailData {
  order_id: string
  customer_name: string | null
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
  status: PaymentStatus // Using enum
  customerEmail: string
  paymentIntentId?: string | null
  paypalOrderId?: string | null
  customerName?: string | null
  shippingAddress?: string | null
  phoneNumber?: string | null
  notes?: string | null
  orderType?: "standard" | "preorder" | "mixed" | "purchase"
  orderStatus?: OrderStatus // Using enum
  shippingStatus?: ShippingStatus // Using enum
}

// NEW: Subscriber type (from previous context)
export interface Subscriber {
  email: string
  created_at: string
  status: string
}

export type AdminUser = {
  // Ensure this type is correctly defined and exported
  id: string
  email: string
  created_at: string
}
