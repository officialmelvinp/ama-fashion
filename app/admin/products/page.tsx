"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Table, TableCell, TableHead, TableRow, TableHeader, TableBody } from "@/components/ui/table"
import type { Product, ProductStatus } from "@/lib/types"
import Link from "next/link"
import { XCircle, PlusCircle, AlertCircle, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

interface CategoryInfo {
  category: string
  product_count: number
  active_products: number
}

// Helper function to convert string to kebab-case
const toKebabCase = (str: string) => {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

export default function AdminProductsPage(): React.ReactElement {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false) // Controls the add/edit dialog
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [activeCategoriesCount, setActiveCategoriesCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Form state for new/edited product (unified state)
  const [id, setId] = useState("")
  const [name, setName] = useState("")
  const [subtitle, setSubtitle] = useState<string | null>(null)
  const [materials, setMaterials] = useState<string[]>([])
  const [description, setDescription] = useState<string | null>(null)
  const [priceAed, setPriceAed] = useState<number | null>(null)
  const [priceGbp, setPriceGbp] = useState<number | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null) // For new image upload
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]) // Stores existing image URLs
  const [category, setCategory] = useState<string | null>(null)
  const [essences, setEssences] = useState<string[]>([])
  // Removed: const [colors, setColors] = useState<string[]>([])
  const [productCode, setProductCode] = useState<string | null>(null)
  const [quantityAvailable, setQuantityAvailable] = useState<number>(0)
  const [totalQuantity, setTotalQuantity] = useState<number | null>(null)
  const [preOrderDate, setPreOrderDate] = useState<string | null>(null)
  const [status, setStatus] = useState<ProductStatus>("active")

  const resetForm = useCallback(() => {
    setId("")
    setName("")
    setSubtitle(null)
    setMaterials([])
    setDescription(null)
    setPriceAed(null)
    setPriceGbp(null)
    setImageFile(null)
    setCurrentImageUrls([])
    setCategory(null)
    setEssences([])
    // Removed: setColors([])
    setProductCode(null)
    setQuantityAvailable(0)
    setTotalQuantity(null)
    setPreOrderDate(null)
    setStatus("active")
    setEditingProduct(null) // Clear editing product state
  }, [])

  // Fetch categories on component mount
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
        setActiveCategoriesCount(data.activeCategoriesCount || 0)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchProducts = useCallback(async () => {
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
        throw new Error(errorData.error || "Failed to fetch products.")
      }
      const data = await response.json()
      setProducts(data.products || [])
    } catch (err: any) {
      setError(err.message)
      console.error("Failed to fetch products:", err)
      toast({
        title: "Error",
        description: "Failed to load products.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast, router])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const filteredProducts = products.filter((product) =>
    [product.name, product.product_code, product.category, product.description]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product)
    setId(product.id)
    setName(product.name)
    setSubtitle(product.subtitle ?? null)
    setMaterials(product.materials || [])
    setDescription(product.description)
    setPriceAed(product.price_aed)
    setPriceGbp(product.price_gbp)
    setCurrentImageUrls(product.image_urls || []) // Set existing images
    setImageFile(null) // Clear any pending new file
    setCategory(product.category ?? null)
    setEssences(product.essences || [])
    setProductCode(product.product_code ?? null)
    setQuantityAvailable(product.quantity_available)
    setTotalQuantity(product.total_quantity ?? null)
    setPreOrderDate(product.pre_order_date ?? null)
    setStatus(product.status)
    setIsDialogOpen(true)
  }, [])

  const handleDeleteProduct = useCallback(
    async (productId: string) => {
      if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
        return
      }
      try {
        const response = await fetch(`/api/inventory/product/${productId}`, {
          method: "DELETE",
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to delete product.")
        }
        toast({
          title: "Product Deleted",
          description: `Product ${productId} has been deleted.`,
          variant: "default",
        })
        await fetchProducts()
      } catch (err: any) {
        console.error("Error deleting product:", err)
        toast({
          title: "Error",
          description: err.message || "Failed to delete product.",
          variant: "destructive",
        })
      }
    },
    [fetchProducts, toast],
  )

  const handleImageUpload = useCallback(async (): Promise<string | null> => {
    if (!imageFile) return null

    const formData = new FormData()
    formData.append("file", imageFile)

    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "X-Vercel-Filename": imageFile.name,
        // DO NOT set 'Content-Type' header manually when sending FormData
      },
      body: formData, // Send the FormData object directly
    })

    try {
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload image.")
      }

      const data = await response.json()
      toast({
        title: "Image Uploaded",
        description: "Product image uploaded successfully.",
      })
      return data.imageUrl
    } catch (error: any) {
      console.error("Image upload failed:", error)
      toast({
        title: "Upload Error",
        description: `Failed to upload image: ${error.message}`,
        variant: "destructive",
      })
      return null
    }
  }, [imageFile, toast])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // Basic validation
      if (!name || !description || !status) {
        toast({
          title: "Validation Error",
          description: "Product Name, Description, and Status are required.",
          variant: "destructive",
        })
        return
      }

      let finalQuantityAvailable = quantityAvailable
      let finalTotalQuantity = totalQuantity
      let finalPreOrderDate = preOrderDate

      // Logic for stock and pre-order based on status
      if (status === "out-of-stock") {
        finalQuantityAvailable = 0
        finalTotalQuantity = 0 // If out of stock, total quantity should also be 0
        finalPreOrderDate = null // Not pre-orderable if simply out of stock
      } else if (status === "pre-order") {
        finalQuantityAvailable = 0 // Pre-order means no immediate stock
        // totalQuantity and preOrderDate can be set by user for pre-order
        if (!finalPreOrderDate) {
          toast({
            title: "Validation Error",
            description: "Pre-order date is required for pre-order products.",
            variant: "destructive",
          })
          return
        }
      } else {
        // active or inactive
        // Quantity and total quantity are as set by user
        finalPreOrderDate = null // Not a pre-order product
      }

      let finalImageUrls = [...currentImageUrls]
      let primaryImageUrl: string | null = currentImageUrls[0] || null

      // If a new image file is selected, upload it first
      if (imageFile) {
        const uploadedUrl = await handleImageUpload()
        if (uploadedUrl) {
          finalImageUrls = [uploadedUrl, ...currentImageUrls.filter((url) => url !== uploadedUrl)] // New image becomes primary
          primaryImageUrl = uploadedUrl
        } else {
          // If upload failed, prevent form submission
          return
        }
      } else if (currentImageUrls.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one product image is required.",
          variant: "destructive",
        })
        return
      }

      const productData: Omit<Product, "created_at" | "updated_at"> = {
        id: editingProduct?.id || id || `new-product-${Date.now()}`, // Use existing ID or generate new
        name,
        subtitle: subtitle || null,
        description: description || "",
        price_aed: priceAed,
        price_gbp: priceGbp,
        image: primaryImageUrl || "", // Primary image is the first in the array
        image_urls: finalImageUrls,
        category: category ? toKebabCase(category) : null, // Convert to kebab-case
        materials: materials,
        essences: essences,
        // Removed: colors: colors,
        product_code: productCode || null,
        quantity_available: finalQuantityAvailable,
        total_quantity: finalTotalQuantity,
        pre_order_date: finalPreOrderDate,
        status,
      }

      try {
        const method = editingProduct ? "PUT" : "POST"
        const url = editingProduct ? `/api/inventory/product/${productData.id}` : "/api/admin/inventory/product"

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        // If response.ok is true, it means the product was updated/added successfully.
        // No need to check data.success as the API doesn't return it.
        toast({
          title: "Success",
          description: `Product ${editingProduct ? "updated" : "added"} successfully.`,
        })
        setIsDialogOpen(false)
        resetForm()
        await fetchProducts()
        await fetchCategories() // Refresh categories after adding/editing product
      } catch (error: any) {
        console.error("Submit failed:", error)
        toast({
          title: "Error",
          description: `Failed to ${editingProduct ? "update" : "add"} product: ${error.message}`,
          variant: "destructive",
        })
      }
    },
    [
      id,
      name,
      subtitle,
      materials,
      description,
      priceAed,
      priceGbp,
      imageFile, // Added imageFile to dependencies
      currentImageUrls, // Added currentImageUrls to dependencies
      category,
      essences,
      // Removed: colors,
      productCode,
      quantityAvailable,
      totalQuantity,
      preOrderDate,
      status,
      editingProduct,
      fetchProducts,
      toast,
      resetForm,
      handleImageUpload, // Added handleImageUpload to dependencies
    ],
  )

  const handleRemoveImage = useCallback(
    (urlToRemove: string) => {
      setCurrentImageUrls((prev) => prev.filter((url) => url !== urlToRemove))
      // If the removed image was the primary one, clear imageFile as well
      if (imageFile && URL.createObjectURL(imageFile) === urlToRemove) {
        setImageFile(null)
      }
    },
    [imageFile],
  )

  // Check if new category can be added
  const isNewCategory =
    category &&
    !categories.some((cat) => toKebabCase(cat.category).toLowerCase() === toKebabCase(category).toLowerCase())
  const canAddNewCategory = activeCategoriesCount < 10

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white shadow-sm border-b mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center py-4">
                    <div>
                      <h1 className="text-xl md:text-2xl font-serif text-[#2c2824]">Product Catalog</h1>
                      <p className="text-sm text-[#2c2824]/60">Manage your products</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="max-w-6xl mx-auto p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c2824] mx-auto mb-4"></div>
                  <p className="text-[#2c2824]">Loading products...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <XCircle className="mx-auto h-12 w-12 mb-4" />
        <p>Error: {error}</p>
        <p>Failed to load products. Please check your database connection and API route.</p>
        <Button onClick={fetchProducts} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="max-w-7xl mx-auto text-center md:text-left">
            <div className="bg-white shadow-sm border-b mb-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center py-4 md:flex-row md:justify-between">
                  <div className="text-center md:text-left">
                    <h1 className="text-xl md:text-2xl font-serif text-[#2c2824]">Product Catalog</h1>
                    <p className="text-sm text-[#2c2824]/60">Manage your products</p>
                  </div>
                  <div className="mt-4 md:mt-0 flex gap-2">
                    <Link href="/admin/inventory" passHref>
                      <Button className="bg-[#2c2824] hover:bg-[#2c2824]/90 text-white">Go to Inventory</Button>
                    </Link>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={resetForm}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                        </DialogHeader>

                        {/* Category Status */}
                        <Card className="mb-6">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5" />
                              Category Status
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600">
                              Active Categories: <span className="font-bold">{activeCategoriesCount}/10</span>
                            </p>
                            {isNewCategory && (
                              <p className={`text-sm mt-2 ${canAddNewCategory ? "text-green-600" : "text-red-600"}`}>
                                {canAddNewCategory
                                  ? `✓ "${category}" will be a new category`
                                  : `✗ Cannot add new category. You have reached the 10 category limit.`}
                              </p>
                            )}
                          </CardContent>
                        </Card>

                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                          {/* Image Upload */}
                          <div className="space-y-4">
                            <Label htmlFor="imageFile">Product Images *</Label>
                            <div className="flex flex-wrap gap-2 items-center">
                              {currentImageUrls.map((url, index) => (
                                <div key={index} className="relative w-24 h-24 border rounded overflow-hidden">
                                  <Image
                                    src={url || "/placeholder.svg"}
                                    alt={`Product image ${index + 1}`}
                                    fill
                                    style={{ objectFit: "cover" }}
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-0 right-0 h-6 w-6"
                                    onClick={() => handleRemoveImage(url)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              {imageFile && (
                                <div className="relative w-24 h-24 border rounded overflow-hidden">
                                  <Image
                                    src={URL.createObjectURL(imageFile) || "/placeholder.svg"}
                                    alt="New product image preview"
                                    fill
                                    style={{ objectFit: "cover" }}
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-0 right-0 h-6 w-6"
                                    onClick={() => setImageFile(null)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              <Input
                                id="imageFile"
                                type="file"
                                accept="image/jpeg, image/jpg"
                                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                                className="w-full max-w-xs"
                              />
                            </div>
                            <p className="text-sm text-gray-500">Only JPG/JPEG files, max 2MB.</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="name">Product Name *</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="subtitle">Subtitle</Label>
                            <Input
                              id="subtitle"
                              value={subtitle || ""}
                              onChange={(e) => setSubtitle(e.target.value || null)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                              id="description"
                              value={description || ""}
                              onChange={(e) => setDescription(e.target.value || null)}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Input
                              id="category"
                              value={category || ""}
                              onChange={(e) => setCategory(e.target.value || null)}
                              placeholder="e.g., Candy Combat, Evening Wear"
                              list="categories"
                            />
                            <datalist id="categories">
                              {categories.map((cat) => (
                                <option key={cat.category} value={cat.category} />
                              ))}
                            </datalist>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="price_aed">Price (AED)</Label>
                              <Input
                                id="price_aed"
                                type="number"
                                step="0.01"
                                value={priceAed ?? ""}
                                onChange={(e) => setPriceAed(Number.parseFloat(e.target.value) || null)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="price_gbp">Price (GBP)</Label>
                              <Input
                                id="price_gbp"
                                type="number"
                                step="0.01"
                                value={priceGbp ?? ""}
                                onChange={(e) => setPriceGbp(Number.parseFloat(e.target.value) || null)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="quantity_available">Available Quantity *</Label>
                              <Input
                                id="quantity_available"
                                type="number"
                                value={quantityAvailable}
                                onChange={(e) => setQuantityAvailable(Number.parseInt(e.target.value) || 0)}
                                required
                                disabled={status === "out-of-stock" || status === "pre-order"} // Disable if status is out-of-stock or pre-order
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="total_quantity">Total Quantity</Label>
                              <Input
                                id="total_quantity"
                                type="number"
                                value={totalQuantity ?? ""}
                                onChange={(e) => setTotalQuantity(Number.parseInt(e.target.value) || null)}
                                disabled={status === "out-of-stock"} // Disable if status is out-of-stock
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="status">Status *</Label>
                              <Select value={status} onValueChange={(value: ProductStatus) => setStatus(value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="inactive">Inactive</SelectItem>
                                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                                  <SelectItem value="pre-order">Pre-order</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="product_code">Product Code</Label>
                              <Input
                                id="product_code"
                                value={productCode || ""}
                                onChange={(e) => setProductCode(e.target.value || null)}
                              />
                            </div>
                          </div>

                          {(status === "pre-order" || (status === "out-of-stock" && preOrderDate)) && (
                            <div className="space-y-2">
                              <Label htmlFor="pre_order_date">Pre-order Date</Label>
                              <Input
                                id="pre_order_date"
                                type="date"
                                value={preOrderDate ? preOrderDate.split("T")[0] : ""}
                                onChange={(e) =>
                                  setPreOrderDate(e.target.value ? new Date(e.target.value).toISOString() : null)
                                }
                                required={status === "pre-order"}
                              />
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="materials">Materials (comma-separated)</Label>
                            <Input
                              id="materials"
                              value={materials.join(", ")}
                              onChange={(e) => setMaterials(e.target.value.split(",").map((s) => s.trim()))}
                              placeholder="Cotton, Silk, Polyester"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="essences">Essences (comma-separated)</Label>
                            <Input
                              id="essences"
                              value={essences.join(", ")}
                              onChange={(e) => setEssences(e.target.value.split(",").map((s) => s.trim()))}
                              placeholder="Vanilla, Rose, Lavender"
                            />
                          </div>

                          {/* Removed: Colors input field */}
                          <DialogFooter>
                            <Button type="submit" disabled={Boolean(isNewCategory && !canAddNewCategory)}>
                              {editingProduct ? "Save Changes" : "Add Product"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <Card>
              <CardHeader className="text-center md:text-left">
                <CardTitle className="text-[#2c2824]">All Products</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm mb-4"
                />
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left p-4 font-medium">Product ID</TableHead>
                        <TableHead className="text-left p-4 font-medium">Name</TableHead>
                        <TableHead className="text-left p-4 font-medium">Category</TableHead>
                        <TableHead className="text-left p-4 font-medium">Price (AED)</TableHead>
                        <TableHead className="text-left p-4 font-medium">Price (GBP)</TableHead>
                        <TableHead className="text-left p-4 font-medium">Stock</TableHead>
                        <TableHead className="text-left p-4 font-medium">Total Qty</TableHead>
                        <TableHead className="text-left p-4 font-medium">Status</TableHead>
                        <TableHead className="text-left p-4 font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <TableRow key={product.id} className="border-b hover:bg-gray-50">
                            <TableCell className="p-4 text-center md:text-left">
                              <div className="font-mono text-sm font-medium">{product.id.substring(0, 8)}...</div>
                              <div className="text-xs text-gray-500">Code: {product.product_code || "N/A"}</div>
                            </TableCell>
                            <TableCell className="p-4 text-center md:text-left">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-gray-500">{product.subtitle || "N/A"}</div>
                            </TableCell>
                            <TableCell className="p-4 text-center md:text-left">{product.category || "N/A"}</TableCell>
                            <TableCell className="p-4 text-center md:text-left">
                              {product.price_aed ? `${product.price_aed.toFixed(2)} AED` : "Not set"}
                            </TableCell>
                            <TableCell className="p-4 text-center md:text-left">
                              {product.price_gbp ? `£${product.price_gbp.toFixed(2)} GBP` : "Not set"}
                            </TableCell>
                            <TableCell className="p-4 text-center md:text-left">{product.quantity_available}</TableCell>
                            <TableCell className="p-4 text-center md:text-left">
                              {product.total_quantity ?? "N/A"}
                            </TableCell>
                            <TableCell className="p-4 text-center md:text-left">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  product.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : product.status === "pre-order"
                                      ? "bg-blue-100 text-blue-800"
                                      : product.status === "out-of-stock"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                              >
                                {product.status}
                              </span>
                            </TableCell>
                            <TableCell className="p-4">
                              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                                  Edit
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.id)}>
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            No products found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <Button
                onClick={fetchProducts}
                variant="outline"
                className="text-[#2c2824] border-[#2c2824] bg-transparent"
              >
                Refresh Products
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
