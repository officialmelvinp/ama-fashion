"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AdminNav from "@/components/admin-nav"

type InventoryItem = {
  id: number
  product_id: string
  quantity_available: number
  total_quantity: number
  status: string
  price_aed?: number
  price_gbp?: number
  preorder_ready_date?: string
  created_at: string
  updated_at: string
}

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [editingPrices, setEditingPrices] = useState<string | null>(null)
  const [editingPreOrder, setEditingPreOrder] = useState<string | null>(null)
  const [priceInputs, setPriceInputs] = useState<{ [key: string]: { aed: string; gbp: string } }>({})
  const [preOrderInputs, setPreOrderInputs] = useState<{ [key: string]: string }>({})
  const router = useRouter()

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await fetch("/api/admin/inventory")
      if (response.status === 401) {
        router.push("/admin/login")
        return
      }
      const data = await response.json()
      setInventory(data.inventory || [])
    } catch (error) {
      console.error("Failed to fetch inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStock = async (productId: string, newQuantity: number) => {
    setUpdating(productId)
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      })

      if (response.ok) {
        await fetchInventory()
      } else {
        alert("Failed to update stock")
      }
    } catch (error) {
      console.error("Error updating stock:", error)
      alert("Error updating stock")
    } finally {
      setUpdating(null)
    }
  }

  const updatePrices = async (productId: string, priceAED: number, priceGBP: number) => {
    setUpdating(productId)
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          priceAED,
          priceGBP,
          updateType: "prices",
        }),
      })

      if (response.ok) {
        await fetchInventory()
        setEditingPrices(null)
        setPriceInputs((prev) => {
          const newInputs = { ...prev }
          delete newInputs[productId]
          return newInputs
        })
      } else {
        alert("Failed to update prices")
      }
    } catch (error) {
      console.error("Error updating prices:", error)
      alert("Error updating prices")
    } finally {
      setUpdating(null)
    }
  }

  const updatePreOrderDate = async (productId: string, preOrderDate: string) => {
    setUpdating(productId)
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          preOrderDate: preOrderDate || null,
          updateType: "preorder",
        }),
      })

      if (response.ok) {
        await fetchInventory()
        setEditingPreOrder(null)
        setPreOrderInputs((prev) => {
          const newInputs = { ...prev }
          delete newInputs[productId]
          return newInputs
        })
      } else {
        alert("Failed to update pre-order date")
      }
    } catch (error) {
      console.error("Error updating pre-order date:", error)
      alert("Error updating pre-order date")
    } finally {
      setUpdating(null)
    }
  }

  const handleQuantityChange = (productId: string, newQuantity: string) => {
    const quantity = Number.parseInt(newQuantity)
    if (!isNaN(quantity) && quantity >= 0) {
      updateStock(productId, quantity)
    }
  }

  const startEditingPrices = (item: InventoryItem) => {
    setEditingPrices(item.product_id)
    setPriceInputs((prev) => ({
      ...prev,
      [item.product_id]: {
        aed: item.price_aed?.toString() || "",
        gbp: item.price_gbp?.toString() || "",
      },
    }))
  }

  const handlePriceInputChange = (productId: string, currency: "aed" | "gbp", value: string) => {
    setPriceInputs((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [currency]: value,
      },
    }))
  }

  const savePrices = (productId: string) => {
    const inputs = priceInputs[productId]
    if (inputs) {
      const aed = Number.parseFloat(inputs.aed) || 0
      const gbp = Number.parseFloat(inputs.gbp) || 0
      updatePrices(productId, aed, gbp)
    }
  }

  const cancelPriceEdit = (productId: string) => {
    setEditingPrices(null)
    setPriceInputs((prev) => {
      const newInputs = { ...prev }
      delete newInputs[productId]
      return newInputs
    })
  }

  const startEditingPreOrder = (item: InventoryItem) => {
    setEditingPreOrder(item.product_id)
    setPreOrderInputs((prev) => ({
      ...prev,
      [item.product_id]: item.preorder_ready_date ? item.preorder_ready_date.split("T")[0] : "",
    }))
  }

  const handlePreOrderInputChange = (productId: string, value: string) => {
    setPreOrderInputs((prev) => ({
      ...prev,
      [productId]: value,
    }))
  }

  const savePreOrderDate = (productId: string) => {
    const date = preOrderInputs[productId]
    updatePreOrderDate(productId, date)
  }

  const cancelPreOrderEdit = (productId: string) => {
    setEditingPreOrder(null)
    setPreOrderInputs((prev) => {
      const newInputs = { ...prev }
      delete newInputs[productId]
      return newInputs
    })
  }

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    }
    window.location.href = "/admin/login"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f3ea]">
        <div className="bg-white shadow-sm border-b mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-xl md:text-2xl font-serif text-[#2c2824]">Inventory Management</h1>
                <p className="text-sm text-[#2c2824]/60">Manage your business</p>
              </div>
              <AdminNav onLogout={logout} showBackButton={false} />
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c2824] mx-auto mb-4"></div>
            <p className="text-[#2c2824]">Loading inventory...</p>
          </div>
        </div>
      </div>
    )
  }

  const inStockCount = inventory.filter((item) => item.quantity_available > 0).length
  const soldOutCount = inventory.filter((item) => item.quantity_available === 0).length
  const totalValue = inventory.reduce((sum, item) => sum + (item.price_aed || 0) * item.quantity_available, 0)

  return (
    <div className="min-h-screen bg-[#f8f3ea]">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl md:text-2xl font-serif text-[#2c2824]">Inventory Management</h1>
              <p className="text-sm text-[#2c2824]/60">Manage your business</p>
            </div>
            <AdminNav onLogout={logout} showBackButton={false} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#2c2824]/70">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#2c2824]">{inventory.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#2c2824]/70">In Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{inStockCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#2c2824]/70">Sold Out</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{soldOutCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#2c2824]/70">Total Value (AED)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{totalValue.toFixed(0)}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#2c2824]">Product Inventory & Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Product ID</th>
                    <th className="text-left p-4 font-medium">Stock</th>
                    <th className="text-left p-4 font-medium">Price AED</th>
                    <th className="text-left p-4 font-medium">Price GBP</th>
                    <th className="text-left p-4 font-medium">Pre-Order Date</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-mono text-sm font-medium">{item.product_id}</div>
                        <div className="text-xs text-gray-500">Total: {item.total_quantity}</div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={item.quantity_available}
                            onChange={(e) => handleQuantityChange(item.product_id, e.target.value)}
                            className="w-20"
                            disabled={updating === item.product_id}
                          />
                          {updating === item.product_id && <span className="text-sm text-gray-500">Updating...</span>}
                        </div>
                      </td>

                      <td className="p-4">
                        {editingPrices === item.product_id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={priceInputs[item.product_id]?.aed || ""}
                            onChange={(e) => handlePriceInputChange(item.product_id, "aed", e.target.value)}
                            className="w-24"
                            placeholder="AED"
                          />
                        ) : (
                          <div className="font-medium">{item.price_aed ? `${item.price_aed} AED` : "Not set"}</div>
                        )}
                      </td>

                      <td className="p-4">
                        {editingPrices === item.product_id ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={priceInputs[item.product_id]?.gbp || ""}
                            onChange={(e) => handlePriceInputChange(item.product_id, "gbp", e.target.value)}
                            className="w-24"
                            placeholder="GBP"
                          />
                        ) : (
                          <div className="font-medium">{item.price_gbp ? `£${item.price_gbp}` : "Not set"}</div>
                        )}
                      </td>

                      <td className="p-4">
                        {editingPreOrder === item.product_id ? (
                          <Input
                            type="date"
                            value={preOrderInputs[item.product_id] || ""}
                            onChange={(e) => handlePreOrderInputChange(item.product_id, e.target.value)}
                            className="w-40"
                          />
                        ) : (
                          <div className="font-medium">
                            {item.preorder_ready_date
                              ? new Date(item.preorder_ready_date).toLocaleDateString()
                              : "Not set"}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.quantity_available > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.quantity_available > 0 ? "In Stock" : "Sold Out"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2 flex-wrap">
                          {editingPreOrder === item.product_id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => savePreOrderDate(item.product_id)}
                                disabled={updating === item.product_id}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Save Date
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => cancelPreOrderEdit(item.product_id)}
                                disabled={updating === item.product_id}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : editingPrices === item.product_id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => savePrices(item.product_id)}
                                disabled={updating === item.product_id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => cancelPriceEdit(item.product_id)}
                                disabled={updating === item.product_id}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditingPreOrder(item)}
                                disabled={updating === item.product_id}
                              >
                                Set Pre-Order Date
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditingPrices(item)}
                                disabled={updating === item.product_id}
                              >
                                Edit Prices
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStock(item.product_id, 0)}
                                disabled={updating === item.product_id}
                              >
                                Mark Sold Out
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStock(item.product_id, 1)}
                                disabled={updating === item.product_id}
                              >
                                Restock (1)
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button onClick={fetchInventory} variant="outline" className="text-[#2c2824] border-[#2c2824] bg-transparent">
            Refresh Inventory
          </Button>
        </div>
      </div>
    </div>
  )
}
