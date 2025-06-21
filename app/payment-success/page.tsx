"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
  const token = searchParams.get("token") // This is the PayPal order ID
  const payerId = searchParams.get("PayerID")
  const [product, setProduct] = useState<Product | null>(null)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureComplete, setCaptureComplete] = useState(false)

  useEffect(() => {
    // Get stored data
    const selectedProduct = localStorage.getItem("selectedProduct")
    const storedCustomerInfo = localStorage.getItem("customerInfo")

    if (selectedProduct) {
      setProduct(JSON.parse(selectedProduct))
    }
    if (storedCustomerInfo) {
      setCustomerInfo(JSON.parse(storedCustomerInfo))
    }

    // If we have token and payerId, capture the payment
    if (token && payerId && !captureComplete) {
      capturePayment(token)
    }
  }, [token, payerId, captureComplete])

  const capturePayment = async (orderId: string) => {
    setIsCapturing(true)
    try {
      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      })

      if (response.ok) {
        setCaptureComplete(true)
        // Clear localStorage after successful payment
        localStorage.removeItem("selectedProduct")
        localStorage.removeItem("customerInfo")
      } else {
        console.error("Failed to capture payment")
      }
    } catch (error) {
      console.error("Error capturing payment:", error)
    } finally {
      setIsCapturing(false)
    }
  }

  const whatsappMessage =
    customerInfo && product
      ? `Hello! I just completed my order for ${product.name} (Order: ${token}). Looking forward to delivery coordination. Thank you!`
      : "Hello! I just completed my AMA order and would like to coordinate delivery. Thank you!"

  const whatsappUrl = `https://wa.me/971501234567?text=${encodeURIComponent(whatsappMessage)}`

  if (isCapturing) {
    return (
      <div className="min-h-screen bg-[#f8f3ea] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c2824] mx-auto mb-4"></div>
          <p className="text-lg text-[#2c2824]">Processing your payment...</p>
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
            Thank you for your order. Your payment has been processed successfully.
          </p>

          {token && (
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <h2 className="font-serif text-xl text-[#2c2824] mb-4">Order Details</h2>
              <div className="text-left space-y-2">
                <p>
                  <strong>Order ID:</strong> {token}
                </p>
                {payerId && (
                  <p>
                    <strong>Payer ID:</strong> {payerId}
                  </p>
                )}
                {product && (
                  <>
                    <p>
                      <strong>Product:</strong> {product.name} — {product.subtitle}
                    </p>
                    <p>
                      <strong>Price:</strong> {product.price}
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
                  <p className="text-sm opacity-90">You&apos;ll receive a PayPal receipt in your email shortly.</p>
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
                  <p className="text-sm opacity-90">
                    We&apos;ll coordinate delivery details via WhatsApp within 24 hours.
                  </p>
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
              <Button variant="outline" className="w-full py-3 text-lg">
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
