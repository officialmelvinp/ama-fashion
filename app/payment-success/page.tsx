"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

// Define types for the data received from the API
type OrderItemDisplay = {
  product_id: string
  product_display_name: string
  quantity: number
  unit_price: number
  currency: string
}

type CustomerInfoDisplay = {
  firstName: string
  lastName: string
  email: string
  phone: string | null
  address: string | null
  city: string
  country: string
  postalCode: string
  notes: string | null
}

type OrderDetailsFromAPI = {
  items: OrderItemDisplay[]
  customerInfo: CustomerInfoDisplay
  totalAmount: number
  currency: string
  paymentMethod: "paypal" | "stripe"
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const paypalToken = searchParams.get("token")
  const payerId = searchParams.get("PayerID")
  const stripeSessionId = searchParams.get("session_id")
  const isMockSimulation = searchParams.get("mock") === "true" // NEW: Check for mock parameter

  const [orderDetails, setOrderDetails] = useState<OrderDetailsFromAPI | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processComplete, setProcessComplete] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paymentMethodUsed, setPaymentMethodUsed] = useState<"paypal" | "stripe" | null>(null)

  useEffect(() => {
    // Only attempt to process if not already complete and a session/token is present
    if (!processComplete) {
      if (isMockSimulation) {
        // NEW: Handle mock simulation
        console.log("MOCK SIMULATION: Initiating mock payment success.")
        simulateMockPayment()
      } else if (paypalToken && payerId) {
        setPaymentMethodUsed("paypal")
        setOrderId(paypalToken)
        // Load customerInfo and cartItems from localStorage to pass to API
        let customerInfoFromStorage: CustomerInfoDisplay | null = null
        const storedCustomerInfo = localStorage.getItem("customerInfo")
        if (storedCustomerInfo) {
          try {
            customerInfoFromStorage = JSON.parse(storedCustomerInfo)
          } catch (e) {
            console.error("Failed to parse customerInfo from localStorage:", e)
          }
        }
        let cartItemsFromStorage: any[] = [] // Use any[] as it's the raw data from localStorage
        const storedCartItems = localStorage.getItem("amariah_cart")
        if (storedCartItems) {
          try {
            cartItemsFromStorage = JSON.parse(storedCartItems)
          } catch (e) {
            console.error("Failed to parse cart from localStorage:", e)
          }
        }
        capturePayPalPayment(paypalToken, customerInfoFromStorage, cartItemsFromStorage)
      } else if (stripeSessionId) {
        setPaymentMethodUsed("stripe")
        // Load customerInfo and cartItems from localStorage to pass to API
        let customerInfoFromStorage: CustomerInfoDisplay | null = null
        const storedCustomerInfo = localStorage.getItem("customerInfo")
        if (storedCustomerInfo) {
          try {
            customerInfoFromStorage = JSON.parse(storedCustomerInfo)
          } catch (e) {
            console.error("Failed to parse customerInfo from localStorage:", e)
          }
        }
        let cartItemsFromStorage: any[] = [] // Use any[] as it's the raw data from localStorage
        const storedCartItems = localStorage.getItem("amariah_cart")
        if (storedCartItems) {
          try {
            cartItemsFromStorage = JSON.parse(storedCartItems)
          } catch (e) {
            console.error("Failed to parse cart from localStorage:", e)
          }
        }
        verifyStripeSession(stripeSessionId, customerInfoFromStorage, cartItemsFromStorage)
      }
    }
  }, [paypalToken, payerId, stripeSessionId, processComplete, isMockSimulation]) // Add isMockSimulation to dependencies

  const simulateMockPayment = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/mock-payment-success") // Call the new mock API
      if (response.ok) {
        const result = await response.json()
        setProcessComplete(true)
        setOrderId(result.orderId)
        setOrderDetails(result.orderData)
        setPaymentMethodUsed(result.orderData.paymentMethod) // Set payment method from mock data
        // No need to clear localStorage for mock, as it wasn't used for the "payment"
      } else {
        console.error("Failed to fetch mock payment data.")
      }
    } catch (error) {
      console.error("Error fetching mock payment data:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const capturePayPalPayment = async (token: string, customerInfo: CustomerInfoDisplay | null, cartItems: any[]) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderID: token,
          customerInfo: customerInfo,
          cartItems: cartItems, // Pass cartItems from localStorage to API
        }),
      })
      if (response.ok) {
        const result = await response.json()
        setProcessComplete(true)
        setOrderId(result.orderId || token) // Use orderId from API response
        setOrderDetails(result.orderData) // Set full order details from API
        localStorage.removeItem("amariah_cart")
        localStorage.removeItem("customerInfo")
        localStorage.removeItem("selectedProduct") // Clear single product too
      } else {
        const errorData = await response.json()
        console.error("Failed to capture PayPal payment:", errorData)
        // Optionally set an error state to display to the user
      }
    } catch (error) {
      console.error("Error capturing PayPal payment:", error)
      // Optionally set an error state
    } finally {
      setIsProcessing(false)
    }
  }

  const verifyStripeSession = async (sessionId: string, customerInfo: CustomerInfoDisplay | null, cartItems: any[]) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/stripe/verify-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          customerInfo: customerInfo,
          cartItems: cartItems, // Pass cartItems from localStorage to API
        }),
      })
      if (response.ok) {
        const result = await response.json()
        setProcessComplete(true)
        setOrderId(result.orderId || sessionId) // Use orderId from API response
        setOrderDetails(result.orderData) // Set full order details from API
        localStorage.removeItem("amariah_cart")
        localStorage.removeItem("customerInfo")
        localStorage.removeItem("selectedProduct") // Clear single product too
      } else {
        const errorData = await response.json()
        console.error("Failed to verify Stripe session:", errorData)
        // Optionally set an error state to display to the user
      }
    } catch (error) {
      console.error("Error verifying Stripe session:", error)
      // Optionally set an error state
    } finally {
      setIsProcessing(false)
    }
  }

  const whatsappMessage =
    orderDetails && orderId
      ? `Hello! I just completed my order (Order: ${orderId}) for the following items: ${orderDetails.items.map((item) => `${item.product_display_name} x${item.quantity}`).join(", ")}. Looking forward to delivery coordination. Thank you!`
      : "Hello! I just completed my AMA order and would like to coordinate delivery. Thank you!"
  const whatsappUrl = `https://wa.me/+447707783963?text=${encodeURIComponent(whatsappMessage)}`

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-[#f8f3ea] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c2824] mx-auto mb-4"></div>
          <p className="text-lg text-[#2c2824]">
            Processing your {paymentMethodUsed === "paypal" ? "PayPal" : "Stripe"} payment...
          </p>
        </div>
      </div>
    )
  }

  // Display a message if order details are not available after processing
  if (!orderDetails && processComplete) {
    return (
      <div className="min-h-screen bg-[#f8f3ea] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-serif text-[#2c2824] mb-4">Order Not Found</h1>
          <p className="text-lg text-[#2c2824]/80 mb-8">
            We couldn't retrieve your order details. Please check your email for confirmation or contact support.
          </p>
          <Link href="/shop">
            <Button className="bg-[#2c2824] text-white">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Only render the success page content if orderDetails are available
  if (!orderDetails) {
    return null // Or a loading spinner if you prefer
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
            Thank you for your order. Your {orderDetails.paymentMethod} payment has been processed successfully.
          </p>
          {orderId && (
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <h2 className="font-serif text-xl text-[#2c2824] mb-4">Order Details</h2>
              <div className="text-left space-y-2">
                <p>
                  <strong>Order ID:</strong> {orderId}
                </p>
                <p>
                  <strong>Payment Method:</strong> {orderDetails.paymentMethod}
                </p>
                {/* Display items from orderDetails */}
                {orderDetails.items.length > 0 && (
                  <>
                    <h3 className="font-semibold mt-4 mb-2">Items Ordered:</h3>
                    {orderDetails.items.map((item) => (
                      <div key={item.product_id} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0">
                        <p>
                          <strong>Product:</strong> {item.product_display_name}
                        </p>
                        <p>
                          <strong>Quantity:</strong> {item.quantity}
                        </p>
                        <p>
                          <strong>Price:</strong> {item.unit_price.toFixed(2)} {item.currency}
                        </p>
                      </div>
                    ))}
                    <p className="font-bold text-lg mt-4">
                      Total: {orderDetails.totalAmount.toFixed(2)} {orderDetails.currency}
                    </p>
                  </>
                )}
                {orderDetails.customerInfo && (
                  <>
                    <p>
                      <strong>Customer:</strong> {orderDetails.customerInfo.firstName}{" "}
                      {orderDetails.customerInfo.lastName}
                    </p>
                    <p>
                      <strong>Email:</strong> {orderDetails.customerInfo.email}
                    </p>
                    {orderDetails.customerInfo.phone && (
                      <p>
                        <strong>Phone:</strong> {orderDetails.customerInfo.phone}
                      </p>
                    )}
                    {orderDetails.customerInfo.address && (
                      <p>
                        <strong>Address:</strong> {orderDetails.customerInfo.address}
                      </p>
                    )}
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
