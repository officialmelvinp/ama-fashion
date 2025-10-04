"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { QuantitySelector } from "@/components/quantity-selector"
import { useCart } from "@/context/cart-context"
import type { Product, Region, CartItem } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPrice } from "@/lib/utils"
import Header from "@/components/header"
import { generateProductSchema } from "@/lib/seo"
import { useToast } from "@/hooks/use-toast"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

export default function ShopPageClient() {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [productStockMap, setProductStockMap] = useState<
    Record<
      string,
      { stockLevel: number; isAvailable: boolean; isPreOrder: boolean; status: string; pre_order_date: string | null }
    >
  >({})
  const [selectedRegion, setSelectedRegion] = useState<Region>("UAE")
  const [activeFilter, setActiveFilter] = useState<string>("all")

  useEffect(() => {
    const initialQuantities: { [key: string]: number } = {}
    products.forEach((product) => {
      initialQuantities[product.id] = 1
    })
    setQuantities(initialQuantities)
  }, [products])

  const fetchProductsWithStock = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/inventory/available")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: { success: boolean; productsWithStock: Product[] } = await response.json()

      if (data.success && Array.isArray(data.productsWithStock)) {
        const activeProducts = data.productsWithStock.filter((p) => p.status !== "inactive")
        setProducts(activeProducts)
        const fetchedStockMap: Record<
          string,
          {
            stockLevel: number
            isAvailable: boolean
            isPreOrder: boolean
            status: string
            pre_order_date: string | null
          }
        > = {}
        activeProducts.forEach((item: Product) => {
          fetchedStockMap[item.id] = {
            stockLevel: item.quantity_available || 0,
            isAvailable: item.quantity_available > 0 && item.status === "active",
            isPreOrder:
              item.status === "pre-order" ||
              (item.status === "out-of-stock" && item.pre_order_date !== null) ||
              (item.status === "active" && item.quantity_available < (item.total_quantity ?? 0)),
            status: item.status,
            pre_order_date: item.pre_order_date || null,
          }
        })
        setProductStockMap(fetchedStockMap)
      } else {
        console.error("API response did not contain productsWithStock array or was not successful:", data)
        setProducts([])
      }
    } catch (error: any) {
      console.error("Error fetching products with stock:", error)
      toast({
        title: "Error",
        description: `Failed to fetch products: ${error.message}.`,
        variant: "destructive",
      })
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchProductsWithStock()
  }, [fetchProductsWithStock])

  useEffect(() => {
    const hash = window.location.hash.replace("#", "")
    if (hash) {
      const allCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[]
      const hashToFilter: { [key: string]: string } = {}
      allCategories.forEach((cat) => {
        if (cat) {
          hashToFilter[cat.toLowerCase().replace(/\s+/g, "-")] = cat
        }
      })
      const filterValue = hashToFilter[hash]
      if (filterValue) {
        setActiveFilter(filterValue)
        setTimeout(() => {
          const element = document.getElementById(hash)
          if (element) {
            element.scrollIntoView({ behavior: "smooth" })
          }
        }, 100)
      }
    }
  }, [products])

  const handleQuantityChange = useCallback((productId: string, quantity: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: quantity }))
  }, [])

  const handleAddToCart = useCallback(
    (product: Product) => {
      const quantity = quantities[product.id] || 1
      const stockInfo = productStockMap[product.id]
      if (!stockInfo) {
        toast({
          title: "Error",
          description: `Stock information not found for ${product.name}.`,
          variant: "destructive",
        })
        return
      }

      let selectedPrice: { currency: string; amount: number } = { currency: "AED", amount: product.price_aed || 0 }
      if (selectedRegion === "UK") {
        selectedPrice = { currency: "GBP", amount: product.price_gbp || 0 }
      }

      const itemToAdd: CartItem = {
        ...product,
        subtitle: product.subtitle ?? null,
        category: product.category ?? null,
        product_code: product.product_code ?? null,
        selectedQuantity: quantity,
        selectedRegion: selectedRegion,
        selectedPrice: selectedPrice,
        image_urls: product.image_urls || [],
        price_aed: product.price_aed || 0,
        price_gbp: product.price_gbp || 0,
        description: product.description || "",
        materials: product.materials || [],
        essences: product.essences || [],
        quantity_available: product.quantity_available || 0,
        total_quantity: product.total_quantity || null,
        pre_order_date: product.pre_order_date || null,
        status: product.status || "active",
        created_at: product.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      addToCart(itemToAdd)
      toast({
        title: "Added to Cart",
        description: `${quantity} x ${product.name} has been added to your cart.`,
      })
    },
    [addToCart, quantities, productStockMap, selectedRegion, toast],
  )

  const handleBuyNow = useCallback(
    (product: Product) => {
      const quantity = quantities[product.id] || 1
      const stockInfo = productStockMap[product.id]
      if (!stockInfo) {
        toast({
          title: "Error",
          description: `Stock information not found for ${product.name}.`,
          variant: "destructive",
        })
        return
      }
      let selectedPrice: { currency: string; amount: number } = { currency: "AED", amount: product.price_aed || 0 }
      if (selectedRegion === "UK") {
        selectedPrice = { currency: "GBP", amount: product.price_gbp || 0 }
      }

      const itemToAdd: CartItem = {
        ...product,
        subtitle: product.subtitle ?? null,
        category: product.category ?? null,
        product_code: product.product_code ?? null,
        selectedQuantity: quantity,
        selectedRegion: selectedRegion,
        selectedPrice: selectedPrice,
        image_urls: product.image_urls || [],
        price_aed: product.price_aed || 0,
        price_gbp: product.price_gbp || 0,
        description: product.description || "",
        materials: product.materials || [],
        essences: product.essences || [],
        quantity_available: product.quantity_available || 0,
        total_quantity: product.total_quantity || null,
        pre_order_date: product.pre_order_date || null,
        status: product.status || "active",
        created_at: product.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      addToCart(itemToAdd)
      window.location.href = "/checkout"
    },
    [addToCart, quantities, productStockMap, selectedRegion, toast],
  )

  const getPrimaryButtonText = useCallback(
    (product: Product) => {
      const stockInfo = productStockMap[product.id]
      if (!stockInfo) return "Buy Now"

      const currentQuantity = quantities[product.id] || 1

      if (stockInfo.status === "out-of-stock" && !stockInfo.isPreOrder) {
        return "Out of Stock"
      }

      if (stockInfo.isPreOrder) {
        if (stockInfo.stockLevel === 0) {
          return `Pre-Order Now`
        } else if (currentQuantity > stockInfo.stockLevel) {
          return `Buy Now + Pre-Order`
        } else {
          return `Buy Now`
        }
      }

      if (currentQuantity > stockInfo.stockLevel && stockInfo.stockLevel > 0) {
        return `Buy Now + Pre-Order`
      }

      return "Buy Now"
    },
    [productStockMap, quantities],
  )

  const isPurchaseDisabled = useCallback(
    (product: Product) => {
      const stockInfo = productStockMap[product.id]
      if (!stockInfo) return true

      if (stockInfo.status === "out-of-stock" && !stockInfo.isPreOrder) {
        return true
      }

      if (product.status === "active" && product.quantity_available === 0) {
        return true
      }

      const price = selectedRegion === "UAE" ? product.price_aed : product.price_gbp
      if (price === null || price === undefined || price <= 0) {
        return true
      }

      return false
    },
    [productStockMap, selectedRegion],
  )

  const handleRegionChange = useCallback((region: Region) => {
    setSelectedRegion(region)
  }, [])

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>()
    products.forEach((product) => {
      if (product.category) {
        categories.add(product.category)
      }
    })
    return ["all", ...Array.from(categories).sort((a, b) => a.localeCompare(b))]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (activeFilter === "all") {
        return true
      }
      return product.category?.toLowerCase() === activeFilter.toLowerCase()
    })
  }, [products, activeFilter])

  const getGridClasses = () => {
    if (activeFilter === "the-manifested-set") {
      return "flex justify-center w-full"
    }
    if (activeFilter === "ayomide") {
      return "grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-full mx-auto"
    }

    if (filteredProducts.length === 1) {
      return "flex justify-center w-full"
    }
    if (filteredProducts.length === 2) {
      return "grid grid-cols-1 md:grid-cols-2 gap-4 max-w-full mx-auto"
    }

    return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-full mx-auto"
  }

  const getProductContainerClasses = () => {
    return "flex flex-col w-full max-w-full mx-auto px-2 h-full"
  }

  const getImageAspectRatio = () => {
    if (activeFilter === "the-manifested-set") {
      return "aspect-[3/4] h-[70vh] lg:h-[75vh] xl:h-[80vh] max-w-[60%] mx-auto"
    }
    if (activeFilter === "ayomide") {
      return "aspect-[3/4] h-[80vh] lg:h-[90vh]"
    }
    return "aspect-[3/4] h-[75vh] lg:h-[85vh]"
  }


  const getDescriptionParts = (description: string | null) => {
    if (!description) return { firstPart: "", secondPart: "" }
    const parts = description.split(". ")
    if (parts.length >= 2) {
      return {
        firstPart: parts[0] + ".",
        secondPart: parts.slice(1).join(". "),
      }
    }
    return {
      firstPart: description,
      secondPart: "",
    }
  }

  const getStockDisplay = useCallback(
    (product: Product) => {
      const stockInfo = productStockMap[product.id]
      if (!stockInfo) return "Loading..."

      const available = stockInfo.stockLevel
      const total = product.total_quantity ?? 0
      const preOrderQuantity = total > available ? total - available : 0

      if (stockInfo.status === "out-of-stock" && !stockInfo.isPreOrder) {
        return "Out of Stock"
      } else if (
        stockInfo.status === "pre-order" ||
        (stockInfo.status === "out-of-stock" && stockInfo.pre_order_date)
      ) {
        if (available > 0 && preOrderQuantity > 0) {
          return `${available} in stock + ${preOrderQuantity} pre-order`
        } else if (available > 0) {
          return `${available} pieces in stock`
        } else {
          return "Pre-order"
        }
      } else if (available > 0) {
        if (available <= 3) {
          return `Only ${available} left`
        }
        return "In stock"
      } else {
        return "Out of Stock"
      }
    },
    [productStockMap],
  )

  const getDetailedStockMessage = useCallback(
    (product: Product) => {
      const stockInfo = productStockMap[product.id]
      if (!stockInfo) return ""

      const available = stockInfo.stockLevel
      const total = product.total_quantity ?? 0
      const currentQuantity = quantities[product.id] || 1

      if (stockInfo.status === "out-of-stock" && !stockInfo.isPreOrder) {
        return "Currently unavailable."
      }

      if (stockInfo.status === "pre-order" || (stockInfo.status === "out-of-stock" && stockInfo.pre_order_date)) {
        if (available > 0 && total > available) {
          const preOrderQty = total - available
          if (currentQuantity <= available) {
            return `${available} pieces in stock • Rest will be pre-ordered`
          } else {
            const neededPreOrder = currentQuantity - available
            return `${available} pieces in stock • ${neededPreOrder} will be pre-ordered`
          }
        } else if (available > 0) {
          return `${available} pieces in stock`
        } else {
          return product.pre_order_date
            ? `Pre-order (ETA: ${new Date(product.pre_order_date).toLocaleDateString()})`
            : "Pre-order available"
        }
      }

      if (available > 0) {
        if (currentQuantity <= available) {
          return `${available} pieces in stock`
        } else {
          const neededPreOrder = currentQuantity - available
          return `${available} pieces in stock • ${neededPreOrder} will be pre-ordered`
        }
      } else {
        return "Out of Stock"
      }
    },
    [productStockMap, quantities],
  )

  const productSchemas = filteredProducts.map((product) => generateProductSchema(product))

  return (
    <div className="min-h-screen">
      {/* Product Structured Data */}
      {productSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}

      {/* Custom Swiper Styles */}
      <style jsx global>{`
        .product-swiper .swiper-button-next,
        .product-swiper .swiper-button-prev {
          color: #2c2824;
          background: rgba(255, 255, 255, 0.9);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .product-swiper .swiper-button-next:after,
        .product-swiper .swiper-button-prev:after {
          font-size: 16px;
          font-weight: bold;
        }

        .product-swiper .swiper-pagination-bullet {
          background: #2c2824;
          opacity: 0.3;
          width: 8px;
          height: 8px;
        }

        .product-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: #2c2824;
        }

        .product-swiper .swiper-pagination {
          bottom: 10px;
        }

        /* Custom pagination with fraction */
        .product-swiper .swiper-pagination-fraction {
          color: #2c2824;
          background: rgba(255, 255, 255, 0.9);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          width: auto;
          left: 50%;
          transform: translateX(-50%);
          bottom: 10px;
        }
      `}</style>

      <Header bgColor="bg-white/90 backdrop-blur-sm" textColor="text-[#2c2824]" />
      <div className="container mx-auto pt-24 pb-8 px-1">
        <div className="max-w-4xl mx-auto mb-6 text-center">
          <h1 className="text-lg md:text-xl lg:text-2xl font-serif text-[#2c2824] italic mb-2">
            Fabrics that remember.
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl font-serif text-[#2c2824] italic">
            Garments that manifest lineage.
          </p>
        </div>

        {/* Region Selector */}
        <div className="mb-4">
          <div className="flex justify-center">
            <div className="text-center">
              <h2 className="text-sm mb-4 opacity-70 font-medium">Select Your Region</h2>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handleRegionChange("UAE")}
                  className={`px-6 py-3 rounded-full text-sm transition-colors ${
                    selectedRegion === "UAE"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                  aria-label="Select UAE region for AED pricing"
                >
                  🇦🇪 UAE (AED)
                </button>
                <button
                  onClick={() => handleRegionChange("UK")}
                  className={`px-6 py-3 rounded-full text-sm transition-colors ${
                    selectedRegion === "UK"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                  aria-label="Select UK region for GBP pricing"
                >
                  🇬🇧 UK (GBP)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Collection Filter */}
        <div className="mb-6">
          <div className="flex justify-center">
            <div className="text-center">
              <h2 className="text-sm mb-4 opacity-70 font-medium">Filter by Collection</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3 justify-items-center mx-auto max-w-fit">
                {uniqueCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveFilter(category)}
                    className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm transition-colors ${
                      activeFilter === category
                        ? "bg-[#2c2824] text-white"
                        : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                    }`}
                    aria-label={`Shop ${category === "all" ? "all" : category} collection`}
                  >
                    {category === "all" ? `All (${products.length})` : category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Display */}
        {loading ? (
          <div className={getGridClasses()}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                <Skeleton className={`relative ${getImageAspectRatio()} overflow-hidden mb-2 group`} />
                <CardContent className="flex flex-grow flex-col justify-between p-4">
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="mt-2 h-4 w-1/2 mx-auto" />
                  <Skeleton className="mt-4 h-10 w-full mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className={getGridClasses()}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const descriptionParts = getDescriptionParts(product.description)
                const displayPrice =
                  selectedRegion === "UAE"
                    ? formatPrice(product.price_aed || 0, "AED")
                    : formatPrice(product.price_gbp || 0, "GBP")
                const stockInfo = productStockMap[product.id] || {
                  stockLevel: product.quantity_available || 0,
                  isAvailable: product.quantity_available > 0 && product.status === "active",
                  isPreOrder:
                    product.status === "pre-order" ||
                    (product.status === "out-of-stock" && product.pre_order_date !== null),
                  status: product.status,
                  pre_order_date: product.pre_order_date || null,
                }
                const currentQuantity = quantities[product.id] || 1
                const primaryButtonText = getPrimaryButtonText(product)
                const purchaseDisabled = isPurchaseDisabled(product)

                return (
                  <article
                    key={product.id}
                    className={getProductContainerClasses()}
                    id={product.category?.toLowerCase().replace(/\s+/g, "-") || product.id}
                  >
                    {/* Image Swiper */}
                    <div className={`relative ${getImageAspectRatio()} overflow-hidden mb-2 group`}>
                      {product.image_urls && product.image_urls.length > 1 ? (
                        <Swiper
                          modules={[Navigation, Pagination, Autoplay]}
                          navigation
                          pagination={{
                            type: "fraction",
                          }}
                          autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                          }}
                          loop={true}
                          className="product-swiper h-full w-full"
                        >
                          {product.image_urls.map((imageUrl, index) => (
                            <SwiperSlide key={index}>
                              <div className="relative w-full h-full">
                                <Image
                                  src={imageUrl || "/placeholder.svg?height=400&width=300"}
                                  alt={`${product.name} - Image ${index + 1} of ${product.image_urls?.length}`}
                                  fill
                                  className="object-cover object-top"
                                  sizes={
                                    activeFilter === "the-manifested-set"
                                      ? "(max-width: 768px) 100vw, 50vw"
                                      : activeFilter === "ayomide"
                                        ? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                                        : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                  }
                                  priority={index === 0}
                                />
                              </div>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      ) : (
                        <Image
                          src={product.image_urls?.[0] || "/placeholder.svg?height=400&width=300"}
                          alt={`${product.name} - ${product.subtitle} - African fashion by AMA featuring ${product.materials?.join(", ") || ""} materials`}
                          fill
                          className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                          sizes={
                            activeFilter === "the-manifested-set"
                              ? "(max-width: 768px) 100vw, 50vw"
                              : activeFilter === "ayomide"
                                ? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                                : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          }
                          priority
                        />
                      )}

                      {/* Stock indicator overlay */}
                      <div className="absolute top-2 right-2 z-10">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            stockInfo.status === "out-of-stock" && !stockInfo.isPreOrder
                              ? "bg-red-100 text-red-800"
                              : stockInfo.isPreOrder
                                ? "bg-orange-100 text-orange-800"
                                : stockInfo.stockLevel <= 3 && stockInfo.stockLevel > 0
                                  ? "bg-yellow-100 text-yellow-800"
                                  : stockInfo.stockLevel > 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {getStockDisplay(product)}
                        </span>
                      </div>
                    </div>

                    <div className="flex-grow flex flex-col text-center">
                      <div className="flex-grow space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          <h3
                            className={`font-serif text-[#2c2824] ${
                              activeFilter === "the-manifested-set"
                                ? "text-2xl md:text-3xl"
                                : activeFilter === "ayomide"
                                  ? "text-xl md:text-2xl"
                                  : "text-xl md:text-2xl"
                            }`}
                          >
                            {product.name}
                          </h3>
                        </div>
                        <h4
                          className={`font-serif text-[#2c2824]/80 ${
                            activeFilter === "the-manifested-set"
                              ? "text-lg md:text-xl"
                              : activeFilter === "ayomide"
                                ? "text-base md:text-lg"
                                : "text-base md:text-lg"
                          }`}
                        >
                          {product.subtitle}
                        </h4>
                        {descriptionParts.secondPart && (
                          <p
                            className={`italic text-[#2c2824] leading-relaxed ${
                              activeFilter === "the-manifested-set" ? "text-base md:text-lg" : "text-sm md:text-base"
                            }`}
                          >
                            {descriptionParts.secondPart}
                          </p>
                        )}
                        <p
                          className={`italic text-[#2c2824] leading-relaxed ${
                            activeFilter === "the-manifested-set" ? "text-base md:text-lg" : "text-sm md:text-base"
                          }`}
                        >
                          {descriptionParts.firstPart}
                        </p>
                        <p
                          className={`font-medium text-[#2c2824] pt-2 ${
                            activeFilter === "the-manifested-set"
                              ? "text-xl md:text-2xl"
                              : activeFilter === "ayomide"
                                ? "text-lg md:text-xl"
                                : "text-base md:text-lg"
                          }`}
                        >
                          {displayPrice}
                        </p>
                      </div>

                      <div className="pt-2 flex flex-col gap-2 items-center">
                        <QuantitySelector
                          productId={product.id}
                          value={currentQuantity}
                          onQuantityChange={handleQuantityChange}
                          maxQuantity={product.total_quantity ?? 99}
                          isPreOrderable={stockInfo.isPreOrder}
                          stockLevel={stockInfo.stockLevel}
                          disabled={purchaseDisabled}
                        />
                        <p className="text-sm text-[#2c2824]/60 mt-1">{getDetailedStockMessage(product)}</p>
                        <div className="pt-4 flex flex-col gap-2 items-center">
                          <Button
                            onClick={() => handleBuyNow(product)}
                            disabled={purchaseDisabled}
                            className="w-48 bg-[#2c2824] hover:bg-[#2c2824]/90 text-white px-8 py-2 text-base mx-auto"
                            aria-label={`${primaryButtonText} ${product.name} for ${displayPrice}`}
                          >
                            {primaryButtonText}
                          </Button>
                          <Button
                            onClick={() => handleAddToCart(product)}
                            disabled={purchaseDisabled}
                            className="w-48 bg-[#2c2824] hover:bg-[#2c2824]/90 text-white px-8 py-2 text-base mx-auto"
                            aria-label={`Add ${currentQuantity} of ${product.name} to cart`}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })
            ) : (
              <p className="col-span-full text-center py-16 text-lg md:text-xl text-[#2c2824]/60 font-serif italic">
                No pieces currently available in this collection.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}



