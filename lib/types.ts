// This file defines common types used across the application.

// NEW: Define Region type for consistency
export type Region = "UAE" | "UK"

// Product type now directly reflects the products table schema
export type ProductStatus = "active" | "inactive" | "out-of-stock" | "pre-order"
export interface Product {
  id: string // UUID from DB
  name: string
  subtitle?: string | null 
  description: string
  price_aed: number | null
  price_gbp: number | null 
  image: string
  image_urls: string[] 
  category?: string | null 
  materials: string[] 
  essences: string[] 
  product_code?: string | null 
  quantity_available: number // Matches DB column
  total_quantity?: number | null // Matches DB column, made optional/nullable
  pre_order_date?: string | null // Matches DB column, made optional/nullable
  status: ProductStatus // Matches DB column, using enum
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  name: string
  subtitle?: string | null 
  image_urls: string[] | null
  selectedPrice: {
    currency: string
    amount: number
  }
  selectedQuantity: number 
  category: string | null
  selectedRegion: Region
  product_code: string | null
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
  id: string 
  order_id: string 
  product_id: string 
  product_display_name: string
  quantity: number
  unit_price: number
  currency: string
  quantity_from_stock: number
  quantity_preorder: number 
  created_at: string
  updated_at: string
}

// Order type now reflects the desired orders table schema (without product_id directly)
export interface Order {
  id: string
  customer_email: string
  customer_name?: string | null
  total_amount: number
  currency: string
  payment_status: PaymentStatus 
  payment_id?: string | null
  shipping_address?: string | null
  phone_number?: string | null
  notes?: string | null
  order_type: "standard" | "preorder" | "mixed" | "purchase"
  order_status: OrderStatus 
  shipping_status: ShippingStatus 
  tracking_number?: string | null
  shipping_carrier?: string | null
  shipped_date?: string | null
  delivered_date?: string | null
  estimated_delivery_date?: string | null
  amount_paid?: number | null 
  created_at: string
  updated_at: string
  items: OrderItem[] 
  
}

export interface ProductWithStock {
  productId: string
  stockLevel: number
  isAvailable: boolean
  price_aed?: number 
  price_gbp?: number 
}

export interface OrderItemEmailData {
  product_id: string // UUID
  product_display_name: string
  quantity: number
  unit_price: number
  currency: string
}


export interface DashboardStats {
  totalRevenueAED: number
  totalRevenueGBP: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  inStockProducts: number 
  soldOutProducts: number 
  lowStockProducts: { id: string; name: string; quantity_available: number }[] 
  recentOrders: {
    id: string
    customer_name: string | null
    product_id: string 
    amount_paid: number
    currency: string
    payment_status: string
    created_at: string
  }[]
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
  New = "New", 
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
  Paid = "Paid", 
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
  status: PaymentStatus 
  customerEmail: string
  paymentIntentId?: string | null
  paypalOrderId?: string | null
  customerName?: string | null
  shippingAddress?: string | null
  phoneNumber?: string | null
  notes?: string | null
  orderType?: "standard" | "preorder" | "mixed" | "purchase"
  orderStatus?: OrderStatus
  shippingStatus?: ShippingStatus
}


export interface Subscriber {
  email: string
  created_at: string
  status: string
}

export type AdminUser = {
 
  id: string
  email: string
  created_at: string
}

export interface PayPalRequestItem {
  productId: string
  quantity: number
  price: number
  name: string
  currency: string
  image?: string // Optional, if passed
  region: Region // Added region for consistency
}
