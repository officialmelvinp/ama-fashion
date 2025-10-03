"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Package, CreditCard, Calendar, Search, Truck, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { handleShipOrder, handleDeliverOrder, resendOrderEmail } from "./actions"
import type { Order } from "@/lib/types" // Ensure this type includes product_display_name
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isPending, startTransition] = useTransition()
  const [shippingForm, setShippingForm] = useState<{
    orderId: string | null
    trackingNumber: string
    carrier: string
    estimatedDelivery: string
  }>({
    orderId: null,
    trackingNumber: "",
    carrier: "",
    estimatedDelivery: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders")
      if (response.status === 401) {
        router.push("/admin/login")
        return
      }
      const data = await response.json()
      const parsedOrders = (data.orders || []).map((order: any) => ({
        // Use 'any' to safely access raw data
        ...order,
        id: String(order.id), // Explicitly convert id to string
        total_amount: Number(order.total_amount),
        amount_paid: Number(order.amount_paid),
      }))
      setOrders(parsedOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setOrders([]) // Set to empty array on error to prevent filter crash
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, action: string) => {
    startTransition(async () => {
      let result
      if (action === "mark_shipped") {
        if (!shippingForm.trackingNumber || !shippingForm.carrier || !shippingForm.estimatedDelivery) {
          alert("Please fill in all shipping details: Tracking Number, Carrier, and Estimated Delivery Date.")
          return
        }
        result = await handleShipOrder(
          orderId,
          shippingForm.trackingNumber,
          shippingForm.carrier,
          shippingForm.estimatedDelivery,
        )
      } else if (action === "mark_delivered") {
        result = await handleDeliverOrder(orderId)
      }
      if (result?.success) {
        await fetchOrders() // Re-fetch orders to get updated data
        setShippingForm({ orderId: null, trackingNumber: "", carrier: "", estimatedDelivery: "" })
        toast({
          title: "Order Status Updated",
          description: result.message,
          variant: "default",
        })
      } else {
        toast({
          title: "Error",
          description: result?.error || "Failed to update order status.",
          variant: "destructive",
        })
      }
    })
  }

  const handleResendEmail = async (orderId: string, emailType: "shipped" | "delivered") => {
    startTransition(async () => {
      const result = await resendOrderEmail(orderId, emailType)
      if (result.success) {
        toast({
          title: "Email Resent",
          description: result.message,
          variant: "default",
        })
      } else {
        toast({
          title: "Email Resend Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    })
  }

  const filteredOrders = orders.filter((order) => {
    // Calculate total product display name for search from items array
    const productDisplayNames = order.items
      .map((item) => item.product_display_name)
      .join(" ")
      .toLowerCase()
    const productIds = order.items
      .map((item) => item.product_id)
      .join(" ")
      .toLowerCase()

    const matchesFilter =
      filter === "all" ||
      (filter === "paid" && order.payment_status === "Completed") ||
      (filter === "shipped" && order.shipping_status === "Shipped") ||
      (filter === "delivered" && order.shipping_status === "Delivered") ||
      (filter === "preorder" && order.items.some((item) => item.quantity_preorder > 0)) ||
      (filter === "pending" && order.payment_status === "Pending")

    const matchesSearch =
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productDisplayNames.includes(searchTerm.toLowerCase()) || 
      productIds.includes(searchTerm.toLowerCase()) || 
      (order.tracking_number && order.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesFilter && matchesSearch
  })

  const getOrderStats = () => {
    const totalOrders = orders.length
    const paidOrders = orders.filter((o) => o.payment_status === "Completed").length
    const shippedOrders = orders.filter((o) => o.shipping_status === "Shipped").length
    const deliveredOrders = orders.filter((o) => o.shipping_status === "Delivered").length
    const preOrders = orders.filter((o) => o.items.some((item) => item.quantity_preorder > 0)).length 
    const totalRevenue = orders
      .filter((o) => o.payment_status === "Completed")
      .reduce((sum, o) => sum + o.total_amount, 0)
    return { totalOrders, paidOrders, shippedOrders, deliveredOrders, preOrders, totalRevenue }
  }

  const getShippingStatusBadge = (status: string) => {
    switch (status) {
      case "Shipped":
        return <Badge className="bg-blue-100 text-blue-800">Shipped</Badge>
      case "Delivered":
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>
      case "Paid":
        return <Badge className="bg-yellow-100 text-yellow-800">Ready to Ship</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  // Helper function to format phone numbers
  const formatPhoneNumber = (phoneNumber: string | null | undefined): string => {
    if (!phoneNumber) return "Not provided"
    // Basic formatting for common phone number patterns
    const cleaned = ("" + phoneNumber).replace(/\D/g, "")
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/) // Matches 10 digits
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }

    return phoneNumber
  }

  const stats = getOrderStats()

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c2824] mx-auto mb-4"></div>
          <p className="text-[#2c2824]">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 text-center md:text-left">
      {" "}
      {/* MODIFIED: Added text-center for mobile, md:text-left for desktop */}
      <div className="mb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#2c2824]/70 flex items-center gap-2 justify-center md:justify-start">
                {" "}
                {/* MODIFIED: Centered icon/text on mobile */}
                <Package className="h-4 w-4" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2c2824]">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#2c2824]/70 flex items-center gap-2 justify-center md:justify-start">
                {" "}
                {/* MODIFIED: Centered icon/text on mobile */}
                <CreditCard className="h-4 w-4" />
                Paid Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.paidOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#2c2824]/70 flex items-center gap-2 justify-center md:justify-start">
                {" "}
                {/* MODIFIED: Centered icon/text on mobile */}
                <Truck className="h-4 w-4" />
                Shipped
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.shippedOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#2c2824]/70 flex items-center gap-2 justify-center md:justify-start">
                {" "}
                {/* MODIFIED: Centered icon/text on mobile */}
                <CheckCircle className="h-4 w-4" />
                Delivered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#2c2824]/70 flex items-center gap-2 justify-center md:justify-start">
                {" "}
                {/* MODIFIED: Centered icon/text on mobile */}
                <Calendar className="h-4 w-4" />
                Pre-Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.preOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#2c2824]/70 text-center md:text-left">Revenue</CardTitle>{" "}
              {/* MODIFIED: Centered text on mobile */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2c2824]">{stats.totalRevenue.toFixed(0)} AED</div>
            </CardContent>
          </Card>
        </div>
        {/* Filters - Only show if there are orders */}
        {orders.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mb-6 md:justify-start">
            {" "}
            {/* MODIFIED: Added flex-wrap and justify-center for mobile, md:justify-start for desktop */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by customer, email, product, or tracking..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2c2824] focus:border-transparent"
            >
              <option value="all">All Orders</option>
              <option value="paid">Paid Orders</option>
              <option value="shipped">Shipped Orders</option>
              <option value="delivered">Delivered Orders</option>
              <option value="preorder">Pre-Orders</option>
              <option value="pending">Pending</option>
            </select>
            <Button onClick={fetchOrders} variant="outline" className="text-[#2c2824] border-[#2c2824] bg-transparent">
              Refresh
            </Button>
          </div>
        )}
      </div>
      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#2c2824] mb-2">No Orders Yet</h3>
              <p className="text-[#2c2824]/60 mb-6">
                When customers place orders and make payments, they will appear here.
              </p>
              <div className="text-sm text-[#2c2824]/50">
                <p>You'll be able to:</p>
                <ul className="mt-2 space-y-1 list-none p-0">
                  {" "}
                  {/* MODIFIED: Removed default list styling */}
                  <li>• Track order status and shipping</li>
                  <li>• Add tracking numbers</li>
                  <li>• Mark orders as shipped/delivered</li>
                  <li>• Send automatic customer notifications</li>
                  <li>• View customer details and notes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-[#2c2824]/60">No orders found matching your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex flex-col items-center md:flex-row md:justify-between md:items-start">
                  {" "}
                  {/* MODIFIED: Centered header content on mobile */}
                  <div className="text-center md:text-left mb-2 md:mb-0">
                    {" "}
                    {/* MODIFIED: Centered text on mobile */}
                    <CardTitle className="text-lg text-[#2c2824]">Order #{order.id.substring(0, 8)}...</CardTitle>
                    <CardDescription>
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(order.created_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center md:justify-start">
                    {" "}
                    {/* MODIFIED: Centered badges on mobile */}
                    <Badge variant={order.payment_status === "Completed" ? "default" : "destructive"}>
                      {order.payment_status}
                    </Badge>
                    {getShippingStatusBadge(order.shipping_status)}
                    {order.items.some((item) => item.quantity_preorder > 0) && (
                      <Badge variant="secondary">Pre-Order</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Customer Info */}
                  <div className="text-center md:text-left">
                    {" "}
                    {/* MODIFIED: Centered text on mobile */}
                    <h3 className="font-semibold mb-2 text-[#2c2824]">Customer Information</h3>
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>Name:</strong> {order.customer_name ?? "N/A"}
                      </p>
                      <p>
                        <strong>Email:</strong> {order.customer_email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {formatPhoneNumber(order.phone_number)}
                      </p>
                      {order.shipping_address && (
                        <p>
                          <strong>Address:</strong> {order.shipping_address}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Order Details */}
                  <div className="text-center md:text-left">
                    {" "}
                    {/* MODIFIED: Centered text on mobile */}
                    <h3 className="font-semibold mb-2 text-[#2c2824]">Order Details</h3>
                    <div className="text-sm space-y-1">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item) => (
                          <div key={item.id} className="mb-2 p-2 border rounded bg-gray-50">
                            <p>
                              <strong>Product:</strong> {item.product_display_name || item.product_id}
                            </p>
                            <p>
                              <strong>Quantity:</strong> {item.quantity}
                            </p>
                            {(item.quantity_from_stock ?? 0) > 0 && (
                              <p>
                                <strong>In Stock:</strong> {item.quantity_from_stock}
                              </p>
                            )}
                            {(item.quantity_preorder ?? 0) > 0 && (
                              <p>
                                <strong>Pre-Order:</strong> {item.quantity_preorder}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No items found for this order.</p>
                      )}
                      <p>
                        <strong>Amount:</strong> {Number(order.amount_paid).toFixed(2)} {order.currency}
                      </p>
                      <p className="font-bold text-base pt-2">
                        <strong>Total Amount:</strong> {Number(order.total_amount).toFixed(2)} {order.currency}
                      </p>
                      <p>
                        <strong>Payment ID:</strong> {order.payment_id}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Shipping Information */}
                {(order.tracking_number || order.shipped_date || order.delivered_date) && (
                  <div className="text-center md:text-left">
                    {" "}
                    {/* MODIFIED: Centered text on mobile */}
                    <h3 className="font-semibold mb-2 text-[#2c2824]">Shipping Information</h3>
                    <div className="text-sm space-y-1 bg-blue-50 p-3 rounded">
                      {order.tracking_number && (
                        <p>
                          <strong>Tracking Number:</strong> {order.tracking_number}
                        </p>
                      )}
                      {order.shipping_carrier && (
                        <p>
                          <strong>Carrier:</strong> {order.shipping_carrier}
                        </p>
                      )}
                      {order.shipped_date && (
                        <p>
                          <strong>Shipped:</strong> {new Date(order.shipped_date).toLocaleDateString()}
                        </p>
                      )}
                      {order.delivered_date && (
                        <p>
                          <strong>Delivered:</strong> {new Date(order.delivered_date).toLocaleDateString()}
                        </p>
                      )}
                      {order.estimated_delivery_date && !order.delivered_date && (
                        <p>
                          <strong>Estimated Delivery:</strong>{" "}
                          {new Date(order.estimated_delivery_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {order.notes && (
                  <div className="text-center md:text-left">
                    {" "}
                    {/* MODIFIED: Centered text on mobile */}
                    <h3 className="font-semibold mb-2 text-[#2c2824]">Customer Notes</h3>
                    <p className="text-sm bg-gray-50 p-3 rounded">{order.notes}</p>
                  </div>
                )}
                {/* Shipping Actions */}
                <div className="border-t pt-4 text-center md:text-left">
                  {" "}
                  {/* MODIFIED: Centered text on mobile */}
                  <h3 className="font-semibold mb-3 text-[#2c2824]">Shipping Actions</h3>
                  {order.payment_status === "Completed" && (
                    <div className="space-y-3">
                      {order.shipping_status === "Paid" && ( 
                        <div className="space-y-3">
                          {shippingForm.orderId === order.id ? (
                            <div className="bg-blue-50 p-4 rounded space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Input
                                  placeholder="Tracking Number"
                                  value={shippingForm.trackingNumber}
                                  onChange={(e) =>
                                    setShippingForm((prev) => ({ ...prev, trackingNumber: e.target.value }))
                                  }
                                />
                                <Input
                                  placeholder="Carrier (e.g., DHL, FedEx)"
                                  value={shippingForm.carrier}
                                  onChange={(e) => setShippingForm((prev) => ({ ...prev, carrier: e.target.value }))}
                                />
                                <Input
                                  type="date"
                                  placeholder="Estimated Delivery"
                                  value={shippingForm.estimatedDelivery}
                                  onChange={(e) =>
                                    setShippingForm((prev) => ({ ...prev, estimatedDelivery: e.target.value }))
                                  }
                                />
                              </div>
                              <div className="flex gap-2 justify-center md:justify-start">
                                {" "}
                                {/* MODIFIED: Centered buttons on mobile */}
                                <Button
                                  onClick={() => updateOrderStatus(order.id, "mark_shipped")}
                                  disabled={isPending}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Truck className="h-4 w-4 mr-2" />
                                  {isPending ? "Marking as Shipped..." : "Mark as Shipped"}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    setShippingForm({
                                      orderId: null,
                                      trackingNumber: "",
                                      carrier: "",
                                      estimatedDelivery: "",
                                    })
                                  }
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              onClick={() =>
                                setShippingForm({
                                  orderId: order.id,
                                  trackingNumber: "",
                                  carrier: "",
                                  estimatedDelivery: "",
                                })
                              }
                              variant="outline"
                              className="text-blue-600 border-blue-600"
                            >
                              <Truck className="h-4 w-4 mr-2" />
                              Ship Order
                            </Button>
                          )}
                        </div>
                      )}
                      {order.shipping_status === "Shipped" && (
                        <div className="flex flex-col items-center gap-2 md:flex-row md:justify-start">
                          {" "}
                          {/* MODIFIED: Centered buttons on mobile */}
                          <Button
                            onClick={() => updateOrderStatus(order.id, "mark_delivered")}
                            disabled={isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {isPending ? "Marking as Delivered..." : "Mark as Delivered"}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                Resend Email
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleResendEmail(order.id, "shipped")}>
                                Resend Shipped Email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                      {order.shipping_status === "Delivered" && (
                        <div className="flex flex-col items-center gap-2 md:flex-row md:justify-start">
                          {" "}
                          {/* MODIFIED: Centered content on mobile */}
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            <span className="font-medium">Order Completed</span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                Resend Email
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleResendEmail(order.id, "delivered")}>
                                Resend Delivered Email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
