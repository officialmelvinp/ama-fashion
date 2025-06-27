"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Users, Mail, Calendar, Search, Trash2, Package, ShoppingCart } from "lucide-react"

type Subscriber = {
  id: number
  email: string
  created_at: string
  status: string
}

export default function AdminDashboard() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, thisWeek: 0 })
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/admin/subscribers")
        if (response.status === 401) {
          router.push("/admin/login")
          return
        }
        if (response.ok) {
          const data = await response.json()
          setSubscribers(data.subscribers)

          // Calculate stats from the data
          const now = new Date()
          const thisMonth = data.subscribers.filter((sub: Subscriber) => {
            const subDate = new Date(sub.created_at)
            return subDate.getMonth() === now.getMonth() && subDate.getFullYear() === now.getFullYear()
          }).length

          const thisWeek = data.subscribers.filter((sub: Subscriber) => {
            const subDate = new Date(sub.created_at)
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return subDate >= weekAgo
          }).length

          setStats({
            total: data.subscribers.length,
            thisMonth,
            thisWeek,
          })
        }
      } catch (error) {
        console.error("Failed to fetch subscribers:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const filteredSubscribers = subscribers.filter((sub) => sub.email.toLowerCase().includes(searchTerm.toLowerCase()))

  const exportToCSV = () => {
    setIsExporting(true)
    const csvContent = [
      "Email,Date Subscribed,Status",
      ...filteredSubscribers.map(
        (sub) => `${sub.email},${new Date(sub.created_at).toLocaleDateString()},${sub.status}`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ama-subscribers-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setIsExporting(false)
  }

  const removeSubscriber = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email}?`)) return

    try {
      const response = await fetch("/api/admin/subscribers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setSubscribers((prev) => prev.filter((sub) => sub.email !== email))
        setStats((prev) => ({ ...prev, total: prev.total - 1 }))
      }
    } catch (error) {
      console.error("Failed to remove subscriber:", error)
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

  return (
    <div className="min-h-screen bg-[#f8f3ea]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-serif text-[#2c2824]">AMA Admin Dashboard</h1>
              <p className="text-sm text-[#2c2824]/60">Manage your business</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/inventory">
                <Button variant="outline" className="text-[#2c2824] border-[#2c2824] bg-transparent">
                  <Package className="h-4 w-4 mr-2" />
                  Inventory Management
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button variant="outline" className="text-[#2c2824] border-[#2c2824] bg-transparent">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Orders & Payments
                </Button>
              </Link>
              <Button onClick={logout} variant="outline" className="text-[#2c2824] border-[#2c2824] bg-transparent">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-[#2c2824]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2c2824]">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-[#2c2824]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2c2824]">{stats.thisMonth}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Mail className="h-4 w-4 text-[#2c2824]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2c2824]">{stats.thisWeek}</div>
            </CardContent>
          </Card>
        </div>

        {/* Subscribers Management */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-xl font-serif text-[#2c2824]">Newsletter Subscribers</CardTitle>
              <Button
                onClick={exportToCSV}
                disabled={isExporting}
                className="bg-[#2c2824] text-white hover:bg-[#2c2824]/90"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Exporting..." : "Export CSV"}
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search subscribers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 max-w-md"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c2824] mx-auto"></div>
                <p className="mt-2 text-[#2c2824]/60">Loading subscribers...</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email Address
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date Subscribed
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSubscribers.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                              {searchTerm ? "No subscribers found matching your search." : "No subscribers yet."}
                            </td>
                          </tr>
                        ) : (
                          filteredSubscribers.map((subscriber) => (
                            <tr key={subscriber.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{subscriber.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {new Date(subscriber.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  {subscriber.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Button
                                  onClick={() => removeSubscriber(subscriber.email)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  Showing {filteredSubscribers.length} of {stats.total} subscribers
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
