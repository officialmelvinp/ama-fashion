"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createPayPalOrder } from "@/lib/paypal"
import Header from "@/components/header"

type Product = {
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
  materialLine?: string
  colors?: string[]
  selectedRegion?: "UAE" | "UK"
  selectedPrice?: string
  selectedQuantity?: number
  stockLevel?: number
  preOrderDate?: string
}

type CheckoutForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  postalCode: string
  notes: string
}

export default function CheckoutPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<CheckoutForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "stripe">("stripe")
  const [preOrderDate, setPreOrderDate] = useState<string | null>(null)

  useEffect(() => {
    // Get selected product from localStorage
    const selectedProduct = localStorage.getItem("selectedProduct")
    if (selectedProduct) {
      const product = JSON.parse(selectedProduct)
      setProduct(product)
      // Fetch pre-order date for this product
      fetchPreOrderDate(product.id)
    }
  }, [])

  const fetchPreOrderDate = async (productId: string) => {
    try {
      const response = await fetch(`/api/inventory/product/${productId}`)
      const data = await response.json()
      if (data.success && data.product?.preorder_ready_date) {
        setPreOrderDate(data.product.preorder_ready_date)
      }
    } catch (error) {
      console.error("Error fetching pre-order date:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const extractPrice = (priceString: string) => {
    if (!priceString) return 0
    console.log("Extracting price from:", priceString) // Debug log
    // Handle decimal numbers - updated regex to capture decimals
    const aedMatch = priceString.match(/([\d.]+)\s*AED/)
    const gbpMatch = priceString.match(/£([\d.]+)\s*GBP/)
    if (aedMatch) {
      const price = Number.parseFloat(aedMatch[1]) // Use parseFloat instead of parseInt
      console.log("Extracted AED price:", price) // Debug log
      return price
    } else if (gbpMatch) {
      const price = Number.parseFloat(gbpMatch[1]) // Use parseFloat instead of parseInt
      console.log("Extracted GBP price:", price) // Debug log
      return price
    }
    console.log("No price match found, returning 0") // Debug log
    return 0
  }

  const calculateTotalPrice = () => {
    if (!product) return 0
    const unitPrice = extractPrice(product.selectedPrice || product.priceAED)
    const quantity = product.selectedQuantity || 1
    const total = unitPrice * quantity
    console.log("Price calculation:", { unitPrice, quantity, total }) // Debug log
    return total
  }

  const getOrderBreakdown = () => {
    if (!product) return { inStock: 0, preOrder: 0 }
    const quantity = product.selectedQuantity || 1
    const stockLevel = product.stockLevel || 0
    const inStock = Math.min(quantity, stockLevel)
    const preOrder = Math.max(0, quantity - stockLevel)
    return { inStock, preOrder }
  }

  const handlePayPalCheckout = async () => {
    if (!product) return
    setIsLoading(true)
    setError("")
    try {
      console.log("🚀 Starting PayPal checkout process...")
      const totalPrice = calculateTotalPrice()
      const customerData = {
        ...form,
        quantity: product.selectedQuantity || 1,
        orderBreakdown: getOrderBreakdown(),
      }
      localStorage.setItem("customerInfo", JSON.stringify(customerData))
      const order = await createPayPalOrder(product.id, totalPrice)
      console.log("✅ PayPal order created:", order)
      const approveLink = order.links?.find((link: { rel: string }) => link.rel === "approve")
      if (approveLink) {
        console.log("🚀 Redirecting to PayPal...")
        window.location.href = approveLink.href
      } else {
        throw new Error("No approval link found in PayPal response")
      }
    } catch (error) {
      console.error("❌ PayPal checkout error:", error)
      setError(error instanceof Error ? error.message : "PayPal checkout failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStripeCheckout = async () => {
    if (!product) return
    setIsLoading(true)
    setError("")
    try {
      console.log("🚀 Starting Stripe checkout process...")
      const region = product.selectedRegion || "UAE"
      const currency = region === "UAE" ? "aed" : "gbp"
      const totalPrice = calculateTotalPrice()
      const quantityOrdered = product.selectedQuantity || 1
      const productPriceInCents = Math.round(totalPrice * 100) // Convert to cents/smallest unit [^3]

      const customerData = {
        ...form,
        quantity: quantityOrdered,
        orderBreakdown: getOrderBreakdown(),
      }
      localStorage.setItem("customerInfo", JSON.stringify(customerData))

      // Create Stripe checkout session
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name, // Added missing parameter
          productPriceInCents: productPriceInCents, // Added missing parameter
          quantityOrdered: quantityOrdered, // Added missing parameter
          amount: totalPrice, // This might be redundant if productPriceInCents is used for line items
          currency: currency,
          region: region,
          customerInfo: customerData,
          success_url: `${window.location.origin}/success`, // Added success URL
          cancel_url: `${window.location.origin}/cancel`, // Added cancel URL
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create Stripe checkout session")
      }
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error("❌ Stripe checkout error:", error)
      setError(error instanceof Error ? error.message : "Stripe checkout failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckout = () => {
    if (paymentMethod === "paypal") {
      handlePayPalCheckout()
    } else {
      handleStripeCheckout()
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif mb-4">No Product Selected</h1>
          <Link href="/shop">
            <Button className="bg-[#2c2824] text-white">Return to Shop</Button>
          </Link>
        </div>
      </div>
    )
  }

  const quantity = product.selectedQuantity || 1
  const unitPrice = extractPrice(product.selectedPrice || product.priceAED)
  const totalPrice = calculateTotalPrice()
  const { inStock, preOrder } = getOrderBreakdown()
  const selectedRegion = product.selectedRegion || "UAE"

  return (
    <div className="min-h-screen bg-[#f8f3ea]">
      {/* Navigation Header */}
      <Header bgColor="bg-white/90 backdrop-blur-sm" textColor="text-[#2c2824]" />
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif text-center mb-12 text-[#2c2824]">Complete Your Order</h1>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Summary */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-xl font-serif mb-6 text-[#2c2824]">Order Summary</h2>
              <div className="flex gap-6 mb-6">
                <div className="relative w-24 h-32 flex-shrink-0">
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-lg text-[#2c2824] mb-2">
                    {product.name} — {product.subtitle}
                  </h3>
                  <p className="text-sm text-[#2c2824]/80 mb-2">{product.materialLine}</p>
                  {product.colors && (
                    <p className="text-sm text-[#2c2824]/80 mb-2">Colors: {product.colors.join(" | ")}</p>
                  )}
                  <p className="text-sm italic text-[#2c2824]/90">{product.description}</p>
                </div>
              </div>
              {/* Quantity and Price Breakdown */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#2c2824]">Unit Price:</span>
                  <span className="text-[#2c2824]">{product.selectedPrice || product.priceAED}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#2c2824]">Quantity:</span>
                  <span className="text-[#2c2824]">
                    {quantity} piece{quantity > 1 ? "s" : ""}
                  </span>
                </div>
                {/* Order Type Breakdown */}
                {preOrder > 0 && (
                  <div className="bg-orange-50 p-3 rounded-lg text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-orange-800">In Stock:</span>
                      <span className="text-orange-800">
                        {inStock} piece{inStock !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-orange-800">Pre-Order:</span>
                      <span className="text-orange-800">
                        {preOrder} piece{preOrder !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {preOrderDate && (
                      <div className="flex justify-between">
                        <span className="text-orange-800 font-medium">Expected Ready:</span>
                        <span className="text-orange-800 font-medium">
                          {new Date(preOrderDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    {!preOrderDate && (
                      <div className="text-orange-700 text-xs mt-1">
                        Pre-order timeline will be confirmed via WhatsApp
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-medium text-[#2c2824] pt-2 border-t">
                  <span>Total:</span>
                  <span>{selectedRegion === "UAE" ? `${totalPrice} AED` : `£${totalPrice} GBP`}</span>
                </div>
              </div>
            </div>
            {/* Checkout Form */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-xl font-serif mb-6 text-[#2c2824]">Shipping Information</h2>
              {/* Payment Method Selection */}
              <div className="mb-6">
                <Label className="text-base font-medium mb-3 block">Choose Payment Method</Label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("stripe")}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      paymentMethod === "stripe"
                        ? "border-[#2c2824] bg-[#2c2824]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium text-[#2c2824] mb-1">💳 Credit/Debit Card (Recommended)</div>
                    <div className="text-xs text-[#2c2824]/60">
                      {selectedRegion === "UAE"
                        ? "🇦🇪 UAE cards • Emirates NBD, ADCB, FAB, etc. • Pay in AED"
                        : "🇬🇧 UK cards • Barclays, HSBC, Lloyds, etc. • Pay in GBP"}
                    </div>
                    <div className="text-xs text-[#2c2824]/60 mt-1">
                      ✅ Visa, Mastercard • Apple Pay, Google Pay • 3D Secure protected
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("paypal")}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      paymentMethod === "paypal"
                        ? "border-[#2c2824] bg-[#2c2824]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium text-[#2c2824] mb-1">🅿️ PayPal</div>
                    <div className="text-xs text-[#2c2824]/60">
                      PayPal account or card • Processes in USD • International support
                    </div>
                    <div className="text-xs text-[#2c2824]/60 mt-1">
                      {selectedRegion === "UAE"
                        ? "💱 Converts from AED to USD automatically"
                        : "💱 Converts from GBP to USD automatically"}
                    </div>
                  </button>
                </div>
              </div>
              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                  <p className="text-red-600 text-xs mt-2">Check the browser console (F12) for more details.</p>
                </div>
              )}
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      autoComplete="given-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      autoComplete="family-name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number (for WhatsApp contact) *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="+971 50 123 4567"
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    autoComplete="street-address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      autoComplete="address-level2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      name="country"
                      value={form.country}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      autoComplete="country-name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleInputChange}
                    className="mt-1"
                    autoComplete="postal-code"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="Any special requests or delivery instructions..."
                    rows={3}
                  />
                </div>
                <div className="pt-6">
                  <Button
                    onClick={handleCheckout}
                    disabled={
                      isLoading ||
                      !form.firstName ||
                      !form.lastName ||
                      !form.email ||
                      !form.phone ||
                      !form.address ||
                      !form.city ||
                      !form.country
                    }
                    className="w-full bg-[#2c2824] text-white hover:bg-[#2c2824]/90 py-3 text-lg"
                  >
                    {isLoading
                      ? "Processing..."
                      : paymentMethod === "paypal"
                        ? "Continue to PayPal"
                        : "Pay with Card (Stripe)"}
                  </Button>
                </div>
                <div className="text-center text-sm text-[#2c2824]/60 mt-4">
                  <p>🔒 Secure payment powered by {paymentMethod === "paypal" ? "PayPal" : "Stripe"}</p>
                  <p>📱 You&apos;ll receive WhatsApp contact after payment for delivery coordination</p>
                  {/* Order Type Information */}
                  {preOrder > 0 && (
                    <div className="bg-orange-50 p-3 rounded-lg mt-3 text-xs">
                      <p className="text-orange-800 font-medium">📦 Mixed Order Information:</p>
                      <p className="text-orange-700">
                        {inStock} piece{inStock !== 1 ? "s" : ""} will ship immediately • {preOrder} piece
                        {preOrder !== 1 ? "s" : ""} will be pre-ordered
                      </p>
                      {preOrderDate ? (
                        <p className="text-orange-700">
                          Pre-order items expected ready by{" "}
                          {new Date(preOrderDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      ) : (
                        <p className="text-orange-700">You&apos;ll be contacted via WhatsApp for pre-order timeline</p>
                      )}
                    </div>
                  )}
                  {paymentMethod === "stripe" && (
                    <div className="text-xs mt-2 space-y-1">
                      <p>💳 {selectedRegion === "UAE" ? "UAE" : "UK"} cards supported • No account required</p>
                      <p>🌍 International cards welcome • 3D Secure protected</p>
                    </div>
                  )}
                  {paymentMethod === "paypal" && (
                    <div className="text-xs mt-2">
                      <p>🌍 Works with cards from any country • PayPal handles currency conversion</p>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
