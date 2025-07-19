"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TableBody, Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { Product, ProductStatus } from "@/lib/types"

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const fetchInventory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/inventory")
      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          router.push("/admin/login")
          return
        }
        throw new Error(errorData.error || "Failed to fetch inventory")
      }
      const data = await response.json()
      // FIX: Access the products array from the response
      setInventory(data.products || [])
    } catch (err: any) {
      console.error("Failed to fetch inventory:", err)
      setError(err.message || "An unknown error occurred")
      toast({
        title: "Error",
        description: `Failed to fetch inventory: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast, router])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const filteredInventory = useMemo(() => {
    return inventory.filter((product) =>
      [product.name, product.product_code, product.category]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [inventory, searchTerm])

  const handleStockChange = async (productId: string, newQuantity: number) => {
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          updates: { quantity_available: newQuantity },
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update stock")
      }
      toast({ title: "Success", description: "Stock updated successfully." })
      fetchInventory()
    } catch (err: any) {
      console.error("Error updating stock:", err)
      toast({
        title: "Error",
        description: `Failed to update stock: ${err.message}`,
        variant: "destructive",
      })
    }
  }

  const handlePriceChange = async (productId: string, newPriceAED: number | null, newPriceGBP: number | null) => {
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          updates: {
            price_aed: newPriceAED,
            price_gbp: newPriceGBP,
          },
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update prices")
      }
      toast({ title: "Success", description: "Prices updated successfully." })
      fetchInventory()
    } catch (err: any) {
      console.error("Error updating prices:", err)
      toast({
        title: "Error",
        description: `Failed to update prices: ${err.message}`,
        variant: "destructive",
      })
    }
  }

  const handlePreorderDateChange = async (productId: string, newPreorderDate: string | null) => {
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          updates: { pre_order_date: newPreorderDate },
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update pre-order date")
      }
      toast({ title: "Success", description: "Pre-order date updated successfully." })
      fetchInventory()
    } catch (err: any) {
      console.error("Error updating pre-order date:", err)
      toast({
        title: "Error",
        description: `Failed to update pre-order date: ${err.message}`,
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (productId: string, newStatus: ProductStatus) => {
    try {
      const response = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          updates: { status: newStatus },
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update status")
      }
      toast({ title: "Success", description: "Status updated successfully." })
      fetchInventory()
    } catch (err: any) {
      console.error("Error updating status:", err)
      toast({
        title: "Error",
        description: `Failed to update status: ${err.message}`,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>Loading inventory...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-red-500">
        <p>Error: {error}</p>
        <Button onClick={fetchInventory} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Link href="/admin/products" passHref>
          <Button>Manage Products (Add/Edit Details)</Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Total Quantity</TableHead>
              <TableHead>Price (AED)</TableHead>
              <TableHead>Price (GBP)</TableHead>
              <TableHead>Pre-order Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length > 0 ? (
              filteredInventory.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.product_code}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={product.quantity_available}
                      onChange={(e) => handleStockChange(product.id, Number.parseInt(e.target.value))}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={product.total_quantity || ""}
                      onChange={(e) => handleStockChange(product.id, Number.parseInt(e.target.value))}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={product.price_aed || ""}
                      onChange={(e) =>
                        handlePriceChange(product.id, Number.parseFloat(e.target.value), product.price_gbp)
                      }
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={product.price_gbp || ""}
                      onChange={(e) =>
                        handlePriceChange(product.id, product.price_aed, Number.parseFloat(e.target.value))
                      }
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={product.pre_order_date ? product.pre_order_date.split("T")[0] : ""}
                      onChange={(e) => handlePreorderDateChange(product.id, e.target.value || null)}
                      className="w-36"
                    />
                  </TableCell>
                  <TableCell>
                    <select
                      value={product.status}
                      onChange={(e) => handleStatusChange(product.id, e.target.value as ProductStatus)}
                      className="border rounded-md p-2"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="out-of-stock">Out of Stock</option>
                      <option value="pre-order">Pre-order</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/products?edit=${product.id}`} passHref>
                      <Button variant="outline" size="sm">
                        Edit Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
