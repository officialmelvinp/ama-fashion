"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Package, CreditCard, Calendar, Search, Truck, CheckCircle } from "lucide-react"
import AdminNav from "@/components/admin-nav"

interface Order {
  id: number
  product_id: string
  customer_email: string
  customer_name: string
  quantity_ordered: number
  quantity_in_stock: number
  quantity_preorder: number
  payment_status: string
  payment_id: string
  amount_paid: number
  currency: string
  shipping_address: string
  phone_number: string
  notes: string
  shipping_status: string
  tracking_number: string
  shipped_date: string
  delivered_date: string
  shipping_carrier: string
  estimated_delivery_date: string
  created_at: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null)
  const [shippingForm, setShippingForm] = useState<{
    orderId: number | null
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
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, action: string) => {
    setUpdatingOrder(orderId)
    try {
      const requestData: any = { orderId, action }

      if (action === "mark_shipped" && shippingForm.orderId === orderId) {
        requestData.trackingNumber = shippingForm.trackingNumber
        requestData.carrier = shippingForm.carrier
        requestData.estimatedDelivery = shippingForm.estimatedDelivery
      }

      const response = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        await fetchOrders()
        setShippingForm({ orderId: null, trackingNumber: "", carrier: "", estimatedDelivery: "" })
        alert(`Order ${action === "mark_shipped" ? "marked as shipped" : "marked as delivered"} successfully!`)
      } else {
        alert("Failed to update order status")
      }
    } catch (error) {
      console.error("Error updating order:", error)
      alert("Error updating order status")
    } finally {
      setUpdatingOrder(null)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "paid" && order.payment_status === "completed") ||
      (filter === "shipped" && order.shipping_status === "shipped") ||
      (filter === "delivered" && order.shipping_status === "delivered") ||
      (filter === "preorder" && order.quantity_preorder > 0) ||
      (filter === "pending" && order.payment_status === "pending")

    const matchesSearch =
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.tracking_number && order.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesFilter && matchesSearch
  })

  const getOrderStats = () => {
    const totalOrders = orders.length
    const paidOrders = orders.filter((o) => o.payment_status === "completed").length
    const shippedOrders = orders.filter((o) => o.shipping_status === "shipped").length
    const deliveredOrders = orders.filter((o) => o.shipping_status === "delivered").length
    const preOrders = orders.filter((o) => o.quantity_preorder > 0).length
    const totalRevenue = orders
      .filter((o) => o.payment_status === "completed")
      .reduce((sum, o) => sum + o.amount_paid, 0)

    return { totalOrders, paidOrders, shippedOrders, deliveredOrders, preOrders, totalRevenue }
  }

  const getShippingStatusBadge = (status: string) => {
    switch (status) {
      case "shipped":
        return <Badge className="bg-blue-100 text-blue-800">Shipped</Badge>
      case "delivered":
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>
      case "paid":
        return <Badge className="bg-yellow-100 text-yellow-800">Ready to Ship</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    }
    window.location.href = "/admin/login"
  }

  const stats = getOrderStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f3ea]">
        <div className="bg-white shadow-sm border-b mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-xl md:text-2xl font-serif text-[#2c2824]">Orders & Shipping</h1>
                <p className="text-sm text-[#2c2824]/60">Manage your business</p>
              </div>
              <AdminNav onLogout={logout} showBackButton={false} />
            </div>
          </div>
        </div>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c2824] mx-auto mb-4"></div>
            <p className="text-[#2c2824]">Loading orders...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f3ea]">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl md:text-2xl font-serif text-[#2c2824]">Orders & Shipping</h1>
              <p className="text-sm text-[#2c2824]/60">Manage your business</p>
            </div>
            <AdminNav onLogout={logout} showBackButton={false} />
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#2c2824]/70 flex items-center gap-2">
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
                <CardTitle className="text-sm font-medium text-[#2c2824]/70 flex items-center gap-2">
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
                <CardTitle className="text-sm font-medium text-[#2c2824]/70 flex items-center gap-2">
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
                <CardTitle className="text-sm font-medium text-[#2c2824]/70 flex items-center gap-2">
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
                <CardTitle className="text-sm font-medium text-[#2c2824]/70 flex items-center gap-2">
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
                <CardTitle className="text-sm font-medium text-[#2c2824]/70">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#2c2824]">{stats.totalRevenue.toFixed(0)} AED</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters - Only show if there are orders */}
          {orders.length > 0 && (
            <div className="flex gap-4 mb-6">
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

              <Button
                onClick={fetchOrders}
                variant="outline"
                className="text-[#2c2824] border-[#2c2824] bg-transparent"
              >
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
                  <ul className="mt-2 space-y-1">
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
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-[#2c2824]">Order #{order.id}</CardTitle>
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
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant={order.payment_status === "completed" ? "default" : "destructive"}>
                        {order.payment_status}
                      </Badge>
                      {getShippingStatusBadge(order.shipping_status)}
                      {order.quantity_preorder > 0 && <Badge variant="secondary">Pre-Order</Badge>}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Customer Info */}
                    <div>
                      <h3 className="font-semibold mb-2 text-[#2c2824]">Customer Information</h3>
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>Name:</strong> {order.customer_name}
                        </p>
                        <p>
                          <strong>Email:</strong> {order.customer_email}
                        </p>
                        <p>
                          <strong>Phone:</strong> {order.phone_number || "Not provided"}
                        </p>
                        {order.shipping_address && (
                          <p>
                            <strong>Address:</strong> {order.shipping_address}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div>
                      <h3 className="font-semibold mb-2 text-[#2c2824]">Order Details</h3>
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>Product:</strong> {order.product_id}
                        </p>
                        <p>
                          <strong>Total Quantity:</strong> {order.quantity_ordered}
                        </p>
                        {order.quantity_in_stock > 0 && (
                          <p>
                            <strong>In Stock:</strong> {order.quantity_in_stock}
                          </p>
                        )}
                        {order.quantity_preorder > 0 && (
                          <p>
                            <strong>Pre-Order:</strong> {order.quantity_preorder}
                          </p>
                        )}
                        <p>
                          <strong>Amount:</strong> {order.amount_paid} {order.currency}
                        </p>
                        <p>
                          <strong>Payment ID:</strong> {order.payment_id}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  {(order.tracking_number || order.shipped_date || order.delivered_date) && (
                    <div>
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
                    <div>
                      <h3 className="font-semibold mb-2 text-[#2c2824]">Customer Notes</h3>
                      <p className="text-sm bg-gray-50 p-3 rounded">{order.notes}</p>
                    </div>
                  )}

                  {/* Shipping Actions */}
                  {order.payment_status === "completed" && (
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3 text-[#2c2824]">Shipping Actions</h3>

                      {order.shipping_status === "paid" && (
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
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => updateOrderStatus(order.id, "mark_shipped")}
                                  disabled={updatingOrder === order.id}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Truck className="h-4 w-4 mr-2" />
                                  {updatingOrder === order.id ? "Marking as Shipped..." : "Mark as Shipped"}
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

                      {order.shipping_status === "shipped" && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, "mark_delivered")}
                          disabled={updatingOrder === order.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {updatingOrder === order.id ? "Marking as Delivered..." : "Mark as Delivered"}
                        </Button>
                      )}

                      {order.shipping_status === "delivered" && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span className="font-medium">Order Completed</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
