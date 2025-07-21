"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, ShoppingCart, Users, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/utils"

interface DashboardStats {
  totalProducts: number
  inStockProducts: number
  soldOutProducts: number
  totalOrders: number
  paidOrders: number
  pendingOrders: number
  totalSubscribers: number
  totalRevenueAED: number
  totalRevenueGBP: number
  recentOrders: Array<{
    id: string
    customer_name: string | null
    product_id: string // product_display_name
    amount_paid: number
    currency: string
    payment_status: string
    created_at: string
  }>
  lowStockProducts: Array<{
    id: string
    name: string
    quantity_available: number
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/dashboard-stats") // Consolidated API endpoint

      if (response.status === 401) {
        router.push("/admin/login")
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data: DashboardStats = await response.json()
      setStats(data)
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error)
      toast({
        title: "Error",
        description: `Failed to load dashboard statistics: ${error.message}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c2824] mx-auto mb-4"></div>
        <p className="text-[#2c2824]">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white shadow-sm border-b mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl md:text-2xl font-serif text-[#2c2824]">AMA Admin Dashboard</h1>
              <p className="text-sm text-[#2c2824]/60">Manage your business</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.inStockProducts || 0} in stock, {stats?.soldOutProducts || 0} sold out
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.paidOrders || 0} paid, {stats?.pendingOrders || 0} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSubscribers || 0}</div>
            <p className="text-xs text-muted-foreground">Newsletter subscribers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats?.totalRevenueAED || 0, "AED")} / {formatPrice(stats?.totalRevenueGBP || 0, "GBP")}
            </div>
            <p className="text-xs text-muted-foreground">Total revenue from completed orders</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 sm:px-6 lg:px-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{order.customer_name}</p>
                      <p className="text-xs text-gray-500">{order.product_id}</p>
                      <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatPrice(order.amount_paid, order.currency)}</p>
                      <Badge variant={order.payment_status === "Paid" ? "default" : "secondary"} className="text-xs">
                        {order.payment_status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Link href="/admin/orders" className="block text-center text-sm text-[#2c2824] hover:underline mt-4">
                  View all orders →
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Inventory Alerts
            </CardTitle>
            <CardDescription>Products running low on stock</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-orange-600">Low stock warning</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        {product.quantity_available} left
                      </Badge>
                    </div>
                  </div>
                ))}
                <Link href="/admin/inventory" className="block text-center text-sm text-[#2c2824] hover:underline mt-4">
                  Manage inventory →
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                <p className="text-gray-500">All products well stocked</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg font-semibold text-[#2c2824] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/inventory">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Package className="h-8 w-8 text-[#2c2824] mx-auto mb-2" />
                <h3 className="font-medium text-[#2c2824]">Manage Inventory</h3>
                <p className="text-sm text-gray-500 mt-1">Update stock levels and pricing</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/orders">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <ShoppingCart className="h-8 w-8 text-[#2c2824] mx-auto mb-2" />
                <h3 className="font-medium text-[#2c2824]">View Orders</h3>
                <p className="text-sm text-gray-500 mt-1">Process and ship customer orders</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/subscribers">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-[#2c2824] mx-auto mb-2" />
                <h3 className="font-medium text-[#2c2824]">View Subscribers</h3>
                <p className="text-sm text-gray-500 mt-1">Manage newsletter subscribers</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </>
  )
}
