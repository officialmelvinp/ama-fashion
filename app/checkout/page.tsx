"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Header from "@/components/header"
import type { CartItem, Product, Region } from "@/lib/types" // Ensure CartItem, Product, Region are imported

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
  const [cartItems, setCartItems] = useState<CartItem[]>([])
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

  useEffect(() => {
    let loadedItems: CartItem[] = []
    const storedCartItems = localStorage.getItem("amariah_cart")

    if (storedCartItems) {
      try {
        const parsedCart: CartItem[] = JSON.parse(storedCartItems)
        const isValidCart = parsedCart.every(
          (item) =>
            item.id &&
            typeof item.selectedQuantity === "number" &&
            item.selectedQuantity >= 0 &&
            typeof item.selectedRegion === "string" &&
            typeof item.selectedPrice === "string",
        )
        if (isValidCart) {
          loadedItems = parsedCart
        } else {
          console.warn("Loaded cart from localStorage has an invalid structure. Clearing cart.")
          localStorage.removeItem("amariah_cart")
        }
      } catch (e) {
        console.error("Failed to parse cart from localStorage:", e)
        localStorage.removeItem("amariah_cart")
      }
    }

    // If no items loaded from main cart, check for a single product from "Buy Now"
    if (loadedItems.length === 0) {
      const storedSingleProduct = localStorage.getItem("selectedProduct")
      if (storedSingleProduct) {
        try {
          const parsedProduct: Product & {
            selectedQuantity?: number
            selectedRegion?: Region
            selectedPrice?: string
          } = JSON.parse(storedSingleProduct)

          // Ensure it has the necessary CartItem properties
          if (
            parsedProduct.id &&
            typeof parsedProduct.selectedQuantity === "number" &&
            parsedProduct.selectedQuantity >= 0 &&
            typeof parsedProduct.selectedRegion === "string" &&
            typeof parsedProduct.selectedPrice === "string"
          ) {
            // Convert the single product into a CartItem array
            loadedItems = [
              {
                ...parsedProduct,
                selectedQuantity: parsedProduct.selectedQuantity,
                selectedRegion: parsedProduct.selectedRegion,
                selectedPrice: parsedProduct.selectedPrice,
              } as CartItem, // Cast to CartItem
            ]
            // Clear the single product from localStorage after loading
            localStorage.removeItem("selectedProduct")
            console.log("Loaded single product from 'Buy Now' into cartItems.")
          } else {
            console.warn("Loaded single product from localStorage has an invalid structure. Clearing it.")
            localStorage.removeItem("selectedProduct")
          }
        } catch (e) {
          console.error("Failed to parse single product from localStorage:", e)
          localStorage.removeItem("selectedProduct")
        }
      }
    }

    setCartItems(loadedItems)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const extractPrice = (priceString: string) => {
    if (!priceString) return 0
    console.log("Extracting price from:", priceString)
    const aedMatch = priceString.match(/([\d.]+)\s*AED/)
    const gbpMatch = priceString.match(/£([\d.]+)\s*GBP/)
    if (aedMatch) {
      const price = Number.parseFloat(aedMatch[1])
      console.log("Extracted AED price:", price)
      return price
    } else if (gbpMatch) {
      const price = Number.parseFloat(gbpMatch[1])
      console.log("Extracted GBP price:", price)
      return price
    }
    console.log("No price match found, returning 0")
    return 0
  }

  const calculateTotalPrice = () => {
    if (cartItems.length === 0) return 0
    const total = cartItems.reduce((sum, item) => {
      const unitPrice = extractPrice(item.selectedPrice)
      return sum + unitPrice * item.selectedQuantity
    }, 0)
    console.log("Total price calculation for cart:", { total, items: cartItems.length })
    return total
  }

  const handlePayPalCheckout = async () => {
    if (cartItems.length === 0) return
    setIsLoading(true)
    setError("")
    try {
      console.log("🚀 Starting PayPal checkout process for multiple items via API route...")
      const totalPrice = calculateTotalPrice()
      const customerData = {
        ...form,
      }
      localStorage.setItem("customerInfo", JSON.stringify(customerData))

      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems: cartItems,
          totalPrice: totalPrice,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error Response:", errorData)
        throw new Error(errorData.error || "Failed to create PayPal order session")
      }

      const order = await response.json()
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
    if (cartItems.length === 0) return
    setIsLoading(true)
    setError("")
    try {
      console.log("🚀 Starting Stripe checkout process for multiple items...")
      const region = cartItems[0]?.selectedRegion || "UAE"
      const currency = region === "UAE" ? "aed" : "gbp"
      const totalPrice = calculateTotalPrice()

      let totalPriceInCents = Math.round(totalPrice * 100)
      if (currency === "aed" && totalPriceInCents < 200) {
        console.warn("Adjusting total AED price to meet Stripe minimum (2 AED). Original:", totalPrice, "AED")
        totalPriceInCents = 200
      }

      const customerData = {
        ...form,
      }
      localStorage.setItem("customerInfo", JSON.stringify(customerData))

      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems: cartItems,
          currency: currency,
          customerInfo: customerData,
          success_url: `${window.location.origin}/payment-success`,
          cancel_url: `${window.location.origin}/cancel`,
        }),
      })

      if (!response.ok) {
        let errorDetail = "Failed to create Stripe checkout session"
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          console.error("API Error Response (JSON):", errorData)
          errorDetail = errorData.error || errorDetail
        } else {
          const errorText = await response.text()
          console.error("API Error Response (Text):", errorText)
          errorDetail = errorText || errorDetail
        }
        throw new Error(errorDetail)
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif mb-4">No Items in Cart</h1>
          <Link href="/shop">
            <Button className="bg-[#2c2824] text-white">Return to Shop</Button>
          </Link>
        </div>
      </div>
    )
  }

  const totalPrice = calculateTotalPrice()
  const selectedRegion = cartItems[0]?.selectedRegion || "UAE"

  return (
    <div className="min-h-screen bg-[#f8f3ea]">
      <Header bgColor="bg-white/90 backdrop-blur-sm" textColor="text-[#2c2824]" />
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif text-center mb-12 text-[#2c2824]">Complete Your Order</h1>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-xl font-serif mb-6 text-[#2c2824]">Order Summary</h2>
              {cartItems.map((item: CartItem) => (
                <div
                  key={`${item.id}-${item.selectedRegion}`}
                  className="flex gap-6 mb-6 border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="relative w-24 h-32 flex-shrink-0">
                    <Image
                      src={item.images[0] || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg text-[#2c2824] mb-2">
                      {item.name} — {item.subtitle}
                    </h3>
                    <p className="text-sm text-[#2c2824]/80 mb-2">{item.materialLine}</p>
                    {item.colors && <p className="text-sm text-[#2c2824]/80 mb-2">Colors: {item.colors.join(" | ")}</p>}
                    <p className="text-sm italic text-[#2c2824]/90">{item.description}</p>
                    <div className="pt-2 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[#2c2824]">Unit Price:</span>
                        <span className="text-[#2c2824]">{item.selectedPrice}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#2c2824]">Quantity:</span>
                        <span className="text-[#2c2824]">
                          {item.selectedQuantity} piece{item.selectedQuantity > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center text-lg font-medium text-[#2c2824] pt-2">
                  <span>Total:</span>
                  <span>
                    {selectedRegion === "UAE" ? `${totalPrice.toFixed(2)} AED` : `£${totalPrice.toFixed(2)} GBP`}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-xl font-serif mb-6 text-[#2c2824]">Shipping Information</h2>

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
