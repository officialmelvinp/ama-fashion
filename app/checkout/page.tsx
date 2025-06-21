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
  price: string
  images: string[]
  category: string
  essences: string[]
  materialLine: string
  colors?: string[]
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

  useEffect(() => {
    // Get selected product from localStorage
    const selectedProduct = localStorage.getItem("selectedProduct")
    if (selectedProduct) {
      setProduct(JSON.parse(selectedProduct))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const extractPrice = (priceString: string) => {
    // Extract AED price from string like "850 AED ($230 USD)"
    const aedMatch = priceString.match(/(\d+)\s*AED/)
    return aedMatch ? Number.parseInt(aedMatch[1]) : 0
  }

  const getUSDPrice = (aedPrice: number) => {
    const AED_TO_USD_RATE = 0.27
    return Math.round(aedPrice * AED_TO_USD_RATE * 100) / 100
  }

  const handleCheckout = async () => {
    if (!product) return

    setIsLoading(true)
    setError("")

    try {
      console.log("🚀 Starting checkout process...")
      console.log("Product:", product.name, product.id)

      const price = extractPrice(product.price)
      console.log("💰 Extracted price:", price, "AED")

      // Check environment variables (client-side check)
      console.log("🔧 Environment check:")
      console.log("- NEXT_PUBLIC_PAYPAL_CLIENT_ID exists:", !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID)
      console.log("- NODE_ENV:", process.env.NODE_ENV)

      // Store customer info for confirmation page
      localStorage.setItem("customerInfo", JSON.stringify(form))
      console.log("💾 Customer info stored")

      // Create PayPal order
      console.log("🏦 Creating PayPal order...")
      const order = await createPayPalOrder(product.id, price)
      console.log("✅ PayPal order created:", order)

      // Redirect to PayPal
      const approveLink = order.links?.find((link: { rel: string }) => link.rel === "approve")
      console.log("🔗 Approve link:", approveLink)

      if (approveLink) {
        console.log("🚀 Redirecting to PayPal...")
        window.location.href = approveLink.href
      } else {
        throw new Error("No approval link found in PayPal response")
      }
    } catch (error) {
      console.error("❌ Checkout error:", error)

      // More detailed error handling
      let errorMessage = "There was an error processing your order. Please try again."

      if (error instanceof Error) {
        console.error("Error details:", error.message)
        errorMessage = `Error: ${error.message}`
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
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

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-medium text-[#2c2824] mb-2">
                  <span>Total (AED):</span>
                  <span>{product.price}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-[#2c2824]/70">
                  <span>PayPal will charge (USD):</span>
                  <span>${getUSDPrice(extractPrice(product.price)).toFixed(2)} USD</span>
                </div>
                <p className="text-xs text-[#2c2824]/60 mt-2">
                  * PayPal processes in USD. Exchange rate: 1 AED = $0.27 USD
                </p>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-xl font-serif mb-6 text-[#2c2824]">Shipping Information</h2>

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
                    {isLoading ? "Processing..." : "Continue to PayPal"}
                  </Button>
                </div>

                <div className="text-center text-sm text-[#2c2824]/60 mt-4">
                  <p>🔒 Secure payment powered by PayPal</p>
                  <p>📱 You&apos;ll receive WhatsApp contact after payment for delivery coordination</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
