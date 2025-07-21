"use client"

import Link from "next/link"
import type React from "react"
import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatPrice } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Header from "@/components/header"
import { useCart } from "@/context/cart-context"
import type { CartItem, Region } from "@/lib/types" 

interface CheckoutForm {
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

export default function CheckoutClientContent() {
  const searchParams = useSearchParams()
  const initialRegion = (searchParams.get("region") as Region) || "UAE"
  const { cart, clearCart, calculateTotal } = useCart()
  const router = useRouter()
  const { toast } = useToast()

  const [selectedRegion, setSelectedRegion] = useState<Region>(initialRegion)
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
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    setSelectedRegion(initialRegion)
  }, [initialRegion])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const { amount: cartTotalAmount, currency: cartTotalCurrency } = useMemo(
    () => calculateTotal(selectedRegion),
    [calculateTotal, selectedRegion],
  )

  const regionalCartItems: CartItem[] = useMemo(
    () => cart.filter((item) => item.selectedRegion === selectedRegion),
    [cart, selectedRegion],
  )

  const handleStripeCheckout = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems: regionalCartItems.map((item) => ({
            productId: item.id,
            quantity: item.selectedQuantity,
            price: item.selectedPrice.amount,
            name: item.name,
            image: item.image_urls?.[0],
            currency: item.selectedPrice.currency,
            region: item.selectedRegion, 
          })),
          customerInfo: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            address: form.address,
            city: form.city,
            country: form.country,
            postalCode: form.postalCode,
            notes: form.notes,
          },
          region: selectedRegion,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create Stripe checkout session.")
      }

      const { url } = await response.json()
      console.log("Stripe checkout URL received:", url) 
      if (url) {
        window.location.href = url
      } else {
        throw new Error("No checkout URL received from Stripe.")
      }
    } catch (error: any) {
      console.error("Stripe checkout error:", error)
      toast({
        title: "Checkout Error",
        description: error.message || "There was an issue with your Stripe checkout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayPalCheckout = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems: regionalCartItems.map((item) => ({
            productId: item.id,
            quantity: item.selectedQuantity,
            price: item.selectedPrice.amount, 
            name: item.name,
            currency: item.selectedPrice.currency,
            region: item.selectedRegion, // Pass region for consistency
          })),
          customerInfo: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            address: form.address,
            city: form.city,
            country: form.country,
            postalCode: form.postalCode,
            notes: form.notes,
          },
          region: selectedRegion,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create PayPal order.")
      }

      const { id: orderID, links } = await response.json() // PayPal returns 'id' for order ID
      const approvalLink = links.find((link: any) => link.rel === "approve")?.href

      if (approvalLink) {
        // Redirect to PayPal for approval
        window.location.href = approvalLink
      } else {
        throw new Error("No PayPal approval link received.")
      }
    } catch (error: any) {
      console.error("PayPal checkout error:", error)
      toast({
        title: "Checkout Error",
        description: error.message || "There was an issue with your PayPal checkout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInitiateCheckout = () => {
    if (paymentMethod === "paypal") {
      handlePayPalCheckout()
    } else {
      handleStripeCheckout()
    }
  }

  if (regionalCartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif mb-4">No Items in Cart for {selectedRegion}</h1>
          <Link href="/shop">
            <Button className="bg-[#2c2824] text-white">Return to Shop</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f3ea]">
      <Header bgColor="bg-white/90 backdrop-blur-sm" textColor="text-[#2c2824]" />
      <div className="container mx-auto py-12 px-4 text-center lg:text-left">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif text-center mb-12 text-[#2c2824]">
            Complete Your Order ({selectedRegion})
          </h1>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-xl font-serif mb-6 text-[#2c2824]">Order Summary</h2>
              {regionalCartItems.map((item: CartItem) => (
                <div
                  key={`${item.id}-${item.selectedRegion}`}
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 border-b pb-4 last:border-b-0 last:pb-0 items-center sm:items-start"
                >
                  <div className="relative w-24 h-32 flex-shrink-0">
                    <Image
                      src={item.image_urls?.[0] || "/placeholder.svg?height=64&width=64"}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-serif text-lg text-[#2c2824] mb-2">
                      {item.name} {item.subtitle ? `— ${item.subtitle}` : ""}
                    </h3>
                    {item.materials && item.materials.length > 0 && (
                      <p className="text-sm text-[#2c2824]/80 mb-2">Materials: {item.materials.join(" | ")}</p>
                    )}
                    <p className="text-sm italic text-[#2c2824]/90">{item.description}</p>
                    <div className="pt-2 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[#2c2824]">Unit Price:</span>
                        <span className="text-[#2c2824]">
                          {formatPrice(item.selectedPrice.amount, item.selectedPrice.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#2c2824]">Quantity:</span>
                        <span className="text-[#2c2824]">
                          {item.selectedQuantity} piece{item.selectedQuantity > 1 ? "s" : ""}
                        </span>
                      </div>
                      {item.pre_order_date && (
                        <div className="flex justify-between items-center text-orange-600 text-sm">
                          <span>Pre-order ETA:</span>
                          <span>{new Date(item.pre_order_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center text-lg font-medium text-[#2c2824] pt-2">
                  <span>Total:</span>
                  <span>{formatPrice(cartTotalAmount, cartTotalCurrency)}</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    type="button" 
                    onClick={handleInitiateCheckout}
                    disabled={
                      isProcessing ||
                      !form.firstName ||
                      !form.lastName ||
                      !form.email ||
                      !form.phone ||
                      !form.address ||
                      !form.city ||
                      !form.country ||
                      regionalCartItems.length === 0
                    }
                    className="w-full bg-[#2c2824] text-white hover:bg-[#2c2824]/90 py-3 text-lg"
                  >
                    {isProcessing
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
