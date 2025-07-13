"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

type CartItemDisplay = {
  id: string
  name: string
  subtitle: string
  images: string[]
  selectedQuantity: number
  selectedPrice: string
  selectedRegion: "UAE" | "UK"
}

type CustomerInfo = {
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

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  // PayPal redirects with 'token' (order ID) and 'PayerID'
  const paypalToken = searchParams.get("token") // PayPal order ID
  const payerId = searchParams.get("PayerID")
  // Stripe redirects with 'session_id'
  const stripeSessionId = searchParams.get("session_id")

  const [cartItems, setCartItems] = useState<CartItemDisplay[]>([]) // Changed from product to cartItems
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processComplete, setProcessComplete] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "stripe" | null>(null)

  useEffect(() => {
    // Get stored data
    const storedCartItems = localStorage.getItem("cartItems") // Changed from selectedProduct
    const storedCustomerInfo = localStorage.getItem("customerInfo")

    if (storedCartItems) {
      setCartItems(JSON.parse(storedCartItems)) // Changed from setProduct
    }
    if (storedCustomerInfo) {
      setCustomerInfo(JSON.parse(storedCustomerInfo))
    }

    // Determine payment method and process accordingly
    if (paypalToken && payerId && !processComplete) {
      setPaymentMethod("paypal")
      setOrderId(paypalToken)
      capturePayPalPayment(paypalToken)
    } else if (stripeSessionId && !processComplete) {
      setPaymentMethod("stripe")
      verifyStripeSession(stripeSessionId)
    }
  }, [paypalToken, payerId, stripeSessionId, processComplete])

  const capturePayPalPayment = async (token: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderID: token,
          customerInfo: customerInfo
            ? {
                name: `${customerInfo.firstName} ${customerInfo.lastName}`,
                email: customerInfo.email,
                phone: customerInfo.phone,
                address: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.country} ${customerInfo.postalCode}`,
              }
            : null,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setProcessComplete(true)
        setOrderId(result.captureID || token)
        // Clear localStorage after successful payment
        localStorage.removeItem("cartItems") // Changed from selectedProduct
        localStorage.removeItem("customerInfo")
      } else {
        console.error("Failed to capture PayPal payment")
      }
    } catch (error) {
      console.error("Error capturing PayPal payment:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const verifyStripeSession = async (sessionId: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/stripe/verify-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          customerInfo: customerInfo
            ? {
                name: `${customerInfo.firstName} ${customerInfo.lastName}`,
                email: customerInfo.email,
                phone: customerInfo.phone,
                address: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.country} ${customerInfo.postalCode}`,
              }
            : null,
          cartItems: cartItems, // Pass cartItems instead of product
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setProcessComplete(true)
        setOrderId(result.orderId || sessionId)
        // Clear localStorage after successful payment
        localStorage.removeItem("cartItems") // Changed from selectedProduct
        localStorage.removeItem("customerInfo")
      } else {
        console.error("Failed to verify Stripe session")
      }
    } catch (error) {
      console.error("Error verifying Stripe session:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const whatsappMessage =
    customerInfo && orderId && cartItems.length > 0
      ? `Hello! I just completed my order (Order: ${orderId}) for the following items: ${cartItems.map((item) => `${item.name} x${item.selectedQuantity}`).join(", ")}. Looking forward to delivery coordination. Thank you!`
      : "Hello! I just completed my AMA order and would like to coordinate delivery. Thank you!"
  const whatsappUrl = `https://wa.me/+447707783963?text=${encodeURIComponent(whatsappMessage)}`

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-[#f8f3ea] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c2824] mx-auto mb-4"></div>
          <p className="text-lg text-[#2c2824]">
            Processing your {paymentMethod === "paypal" ? "PayPal" : "Stripe"} payment...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f3ea]">
      {/* Navigation Header */}
      <Header bgColor="bg-white/90 backdrop-blur-sm" textColor="text-[#2c2824]" />
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#2c2824] mb-4">Payment Successful!</h1>
          <p className="text-lg text-[#2c2824]/80 mb-8">
            Thank you for your order. Your {paymentMethod === "paypal" ? "PayPal" : "Stripe"} payment has been processed
            successfully.
          </p>
          {orderId && (
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <h2 className="font-serif text-xl text-[#2c2824] mb-4">Order Details</h2>
              <div className="text-left space-y-2">
                <p>
                  <strong>Order ID:</strong> {orderId}
                </p>
                <p>
                  <strong>Payment Method:</strong> {paymentMethod === "paypal" ? "PayPal" : "Stripe"}
                </p>
                {payerId && (
                  <p>
                    <strong>Payer ID:</strong> {payerId}
                  </p>
                )}
                {/* MODIFIED: Loop through cartItems instead of single product */}
                {cartItems.length > 0 && (
                  <>
                    <h3 className="font-semibold mt-4 mb-2">Items Ordered:</h3>
                    {cartItems.map((item) => (
                      <div key={item.id} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0">
                        <p>
                          <strong>Product:</strong> {item.name} — {item.subtitle}
                        </p>
                        <p>
                          <strong>Quantity:</strong> {item.selectedQuantity}
                        </p>
                        <p>
                          <strong>Price:</strong> {item.selectedPrice}
                        </p>
                      </div>
                    ))}
                    {/* Calculate and display total price for all items */}
                    <p className="font-bold text-lg mt-4">
                      Total:{" "}
                      {cartItems
                        .reduce((sum, item) => {
                          const priceMatch = item.selectedPrice.match(/[\d.]+/)
                          const price = priceMatch ? Number.parseFloat(priceMatch[0]) : 0
                          return sum + price * item.selectedQuantity
                        }, 0)
                        .toFixed(2)}{" "}
                      {cartItems[0]?.selectedRegion === "UAE" ? "AED" : "GBP"}
                    </p>
                  </>
                )}
                {customerInfo && (
                  <>
                    <p>
                      <strong>Customer:</strong> {customerInfo.firstName} {customerInfo.lastName}
                    </p>
                    <p>
                      <strong>Email:</strong> {customerInfo.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {customerInfo.phone}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
          <div className="bg-[#2c2824] text-white p-8 rounded-lg mb-8">
            <h2 className="font-serif text-2xl mb-4">Next Steps</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📧</span>
                <div>
                  <h3 className="font-medium mb-1">Email Confirmation</h3>
                  <p className="text-sm opacity-90">
                    You'll receive a confirmation email with your order details shortly.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <h3 className="font-medium mb-1">WhatsApp Coordination</h3>
                  <p className="text-sm opacity-90">
                    Contact us on WhatsApp to coordinate delivery and any special requests.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚚</span>
                <div>
                  <h3 className="font-medium mb-1">Delivery</h3>
                  <p className="text-sm opacity-90">We'll coordinate delivery details via WhatsApp within 24 hours.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Button
              onClick={() => window.open(whatsappUrl, "_blank")}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
            >
              📱 Contact us on WhatsApp
            </Button>
            <Link href="/shop">
              <Button variant="outline" className="w-full py-3 text-lg bg-transparent">
                Continue Shopping
              </Button>
            </Link>
          </div>
          <div className="mt-12 text-center">
            <p className="text-sm text-[#2c2824]/60 italic">
              &ldquo;Every thread a prayer. Every silhouette, a sanctuary.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
