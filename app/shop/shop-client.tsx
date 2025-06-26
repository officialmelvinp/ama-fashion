"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import { generateProductSchema } from "@/lib/seo"
import { QuantitySelector } from "@/components/quantity-selector"

// ============= TYPE DEFINITIONS =============
type Product = {
  id: string
  name: string
  subtitle: string
  materials: string[]
  description: string
  priceAED: string
  priceGBP: string
  images: string[]
  category: string
  essences: string[]
  colors?: string[]
  materialLine?: string
  productCode?: string
  selectedColor?: string
  stockLevel?: number
  isAvailable?: boolean
  selectedQuantity?: number
}

type ProductStock = {
  stockLevel: number
  isAvailable: boolean
  priceAED?: number
  priceGBP?: number
}

// ============= PRODUCT DATA =============
const allProducts: Product[] = [
  // Ayọ̀mídé - 2 items with colors
  {
    id: "ayomide-blue",
    name: "Ayọ̀mídé",
    subtitle: "A Quiet Ode to Joy",
    materials: ["adire"],
    description: "Joy woven into form. A dress that carries the lightness of being.",
    priceAED: "780 AED",
    priceGBP: "£168 GBP",
    images: ["/images/ama6.jpeg"],
    category: "ayomide",
    essences: ["everyday", "sacred"],
    colors: ["#3B82F6"],
    selectedColor: "#3B82F6",
  },

  {
    id: "ayomide-purple",
    name: "Ayọ̀mídé",
    subtitle: "A Quiet Ode to Joy",
    materials: ["adire"],
    description: "Joy woven into form. A dress that carries the lightness of being.",
    priceAED: "780 AED",
    priceGBP: "£168 GBP",
    images: ["/images/ama6.jpeg"],
    category: "ayomide",
    essences: ["everyday", "sacred"],
    colors: ["#EC4899"],
    selectedColor: "#EC4899",
  },

  // The Manifested Set - 1 item
  {
    id: "manifest-set-1",
    name: "The Manifest Set",
    subtitle: "What You Asked For, Woven",
    materials: ["batik"],
    description: "A pairing of ease and presence. One-size drape, bound by craft.",
    priceAED: "950 AED",
    priceGBP: "£205 GBP",
    images: ["/images/ama5.jpeg"],
    category: "the-manifested-set",
    essences: ["sacred", "gatherings"],
  },

  // Ayaba Bubu - 12 items
  {
    id: "ayaba-bubu-1",
    name: "Àyaba 01",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    priceAED: "850 AED",
    priceGBP: "£183 GBP",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
    productCode: "01",
  },
  {
    id: "ayaba-bubu-2",
    name: "Àyaba 02",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    priceAED: "850 AED",
    priceGBP: "£183 GBP",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
    productCode: "02",
  },
  {
    id: "ayaba-bubu-3",
    name: "Àyaba 03",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    priceAED: "850 AED",
    priceGBP: "£183 GBP",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
    productCode: "03",
  },
  {
    id: "ayaba-bubu-4",
    name: "Àyaba 04",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    priceAED: "850 AED",
    priceGBP: "£183 GBP",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
    productCode: "04",
  },
  {
    id: "ayaba-bubu-5",
    name: "Àyaba 05",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    priceAED: "850 AED",
    priceGBP: "£183 GBP",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
    productCode: "05",
  },
  {
    id: "ayaba-bubu-6",
    name: "Àyaba 06",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    priceAED: "850 AED",
    priceGBP: "£183 GBP",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
    productCode: "06",
  },
  {
    id: "ayaba-bubu-7",
    name: "Àyaba 07",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    priceAED: "850 AED",
    priceGBP: "£183 GBP",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
    productCode: "07",
  },
  {
    id: "ayaba-bubu-8",
    name: "Àyaba 08",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    priceAED: "850 AED",
    priceGBP: "£183 GBP",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
    productCode: "08",
  },
  {
    id: "ayaba-bubu-9",
    name: "Àyaba 09",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    priceAED: "850 AED",
    priceGBP: "£183 GBP",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
    productCode: "09",
  },
  {
    id: "ayaba-bubu-10",
    name: "Àyaba 10",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    priceAED: "850 AED",
    priceGBP: "£183 GBP",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
    productCode: "10",
  },
  {
    id: "ayaba-bubu-11",
    name: "Àyaba 11",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    priceAED: "850 AED",
    priceGBP: "£183 GBP",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
    productCode: "11",
  },
  {
    id: "ayaba-bubu-12",
    name: "Àyaba 12",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    priceAED: "850 AED",
    priceGBP: "£183 GBP",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
    productCode: "12",
  },
  // Candy Combat - 12 items
  {
    id: "candy-combat-1",
    name: "Candy Combat 01",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    priceAED: "650 AED",
    priceGBP: "£140 GBP",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
    productCode: "01",
  },
  {
    id: "candy-combat-2",
    name: "Candy Combat 02",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    priceAED: "650 AED",
    priceGBP: "£140 GBP",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
    productCode: "02",
  },
  {
    id: "candy-combat-3",
    name: "Candy Combat 03",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    priceAED: "650 AED",
    priceGBP: "£140 GBP",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
    productCode: "03",
  },
  {
    id: "candy-combat-4",
    name: "Candy Combat 04",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    priceAED: "650 AED",
    priceGBP: "£140 GBP",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
    productCode: "04",
  },
  {
    id: "candy-combat-5",
    name: "Candy Combat 05",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    priceAED: "650 AED",
    priceGBP: "£140 GBP",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
    productCode: "05",
  },
  {
    id: "candy-combat-6",
    name: "Candy Combat 06",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    priceAED: "650 AED",
    priceGBP: "£140 GBP",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
    productCode: "06",
  },
  {
    id: "candy-combat-7",
    name: "Candy Combat 07",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    priceAED: "650 AED",
    priceGBP: "£140 GBP",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
    productCode: "07",
  },
  {
    id: "candy-combat-8",
    name: "Candy Combat 08",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    priceAED: "650 AED",
    priceGBP: "£140 GBP",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
    productCode: "08",
  },
  {
    id: "candy-combat-9",
    name: "Candy Combat 09",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    priceAED: "650 AED",
    priceGBP: "£140 GBP",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
    productCode: "09",
  },
  {
    id: "candy-combat-10",
    name: "Candy Combat 10",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    priceAED: "650 AED",
    priceGBP: "£140 GBP",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
    productCode: "10",
  },
  {
    id: "candy-combat-11",
    name: "Candy Combat 11",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    priceAED: "650 AED",
    priceGBP: "£140 GBP",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
    productCode: "11",
  },
  {
    id: "candy-combat-12",
    name: "Candy Combat 12",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    priceAED: "650 AED",
    priceGBP: "£140 GBP",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
    productCode: "12",
  },
]

export default function ShopPageClient() {
  // ============= STATE MANAGEMENT =============
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [selectedRegion, setSelectedRegion] = useState<"UAE" | "UK">("UAE")
  const [productsStock, setProductsStock] = useState<Record<string, ProductStock>>({})
  const [loading, setLoading] = useState(true)
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({})

  // ============= FETCH PRODUCTS WITH STOCK LEVELS =============
  useEffect(() => {
    const fetchProductsWithStock = async () => {
      try {
        const response = await fetch("/api/inventory/available")
        const data = await response.json()

        if (data.success) {
          setProductsStock(data.productsWithStock || {})
        }
      } catch (error) {
        console.error("Error fetching products with stock:", error)
        // Fallback: assume all products are available with stock level 1
        const fallbackStock = allProducts.reduce(
          (acc, product) => {
            acc[product.id] = { stockLevel: 1, isAvailable: true }
            return acc
          },
          {} as Record<string, ProductStock>,
        )
        setProductsStock(fallbackStock)
      } finally {
        setLoading(false)
      }
    }

    fetchProductsWithStock()
  }, [])

  // ============= HANDLE URL HASH FROM HOMEPAGE =============
  useEffect(() => {
    const hash = window.location.hash.replace("#", "")

    if (hash) {
      const hashToFilter: { [key: string]: string } = {
        "ayaba-bubu": "ayaba-bubu",
        "candy-combat": "candy-combat",
        "the-manifested-set": "the-manifested-set",
        ayomide: "ayomide",
        batik: "batik",
        adire: "adire",
        linen: "linen",
      }

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
  }, [])

  // ============= FILTER LOGIC - SHOW ALL PRODUCTS WITH STOCK INFO =============
  const getFilteredProducts = () => {
    // Show ALL products, but with stock information AND DYNAMIC PRICES
    const productsWithStock = allProducts.map((product) => {
      const stockInfo = productsStock[product.id]

      // Use database prices if available, otherwise fall back to hardcoded prices
      const dynamicPriceAED = stockInfo?.priceAED ? `${stockInfo.priceAED} AED` : product.priceAED
      const dynamicPriceGBP = stockInfo?.priceGBP ? `£${stockInfo.priceGBP} GBP` : product.priceGBP

      return {
        ...product,
        priceAED: dynamicPriceAED,
        priceGBP: dynamicPriceGBP,
        stockLevel: stockInfo?.stockLevel || 0,
        isAvailable: stockInfo?.isAvailable || false,
        selectedQuantity: productQuantities[product.id] || 1,
      }
    })

    if (activeFilter === "all") {
      return productsWithStock
    }

    if (["ayaba-bubu", "candy-combat", "the-manifested-set", "ayomide"].includes(activeFilter)) {
      return productsWithStock.filter((product) => product.category === activeFilter)
    }

    if (["batik", "adire", "linen"].includes(activeFilter)) {
      return productsWithStock.filter((product) =>
        product.materials.some((material) => material.toLowerCase().includes(activeFilter)),
      )
    }

    return productsWithStock
  }

  const filteredProducts = getFilteredProducts()

  // ============= DYNAMIC GRID LAYOUT LOGIC =============
  const getGridClasses = () => {
    if (activeFilter === "the-manifested-set") {
      return "flex justify-center w-full"
    }

    if (activeFilter === "ayomide") {
      return "grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-full mx-auto"
    }

    return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-full mx-auto"
  }

  const getProductContainerClasses = () => {
    return "flex flex-col w-full max-w-full mx-auto"
  }

  const getImageAspectRatio = () => {
    if (activeFilter === "the-manifested-set") {
      return "aspect-[3/4] h-[85vh] lg:h-[95vh]"
    }

    if (activeFilter === "ayomide") {
      return "aspect-[3/4] h-[80vh] lg:h-[90vh]"
    }

    return "aspect-[3/4] h-[75vh] lg:h-[85vh]"
  }

  // ============= EVENT HANDLERS =============
  const handleCollectionFilter = (collection: string) => {
    setActiveFilter(collection)
    if (collection === "all") {
      window.history.pushState(null, "", window.location.pathname)
    } else {
      window.history.pushState(null, "", `#${collection}`)
    }
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    setProductQuantities((prev) => ({
      ...prev,
      [productId]: quantity,
    }))
  }

  const handleBuyNow = (product: Product) => {
    const quantity = productQuantities[product.id] || 1
    const productWithDetails = {
      ...product,
      selectedRegion,
      selectedPrice: selectedRegion === "UAE" ? product.priceAED : product.priceGBP,
      selectedQuantity: quantity,
      stockLevel: product.stockLevel || 0,
    }

    localStorage.setItem("selectedProduct", JSON.stringify(productWithDetails))
    localStorage.setItem("selectedRegion", selectedRegion)
    window.location.href = "/checkout"
  }

  // ============= HELPER FUNCTIONS =============
  const getDescriptionParts = (description: string) => {
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

  const getButtonText = (product: Product) => {
    const quantity = productQuantities[product.id] || 1
    const stockLevel = product.stockLevel || 0

    if (stockLevel === 0) {
      return "Pre-Order Now"
    } else if (quantity <= stockLevel) {
      return "Buy Now"
    } else {
      return "Buy Now + Pre-Order"
    }
  }

  const getStockDisplay = (stockLevel: number) => {
    if (stockLevel === 0) {
      return "Pre-order available"
    } else if (stockLevel <= 3) {
      return `Only ${stockLevel} left`
    } else if (stockLevel <= 10) {
      return `${stockLevel} available`
    } else {
      return "In stock"
    }
  }

  // Generate structured data for all visible products
  const productSchemas = filteredProducts.map((product) => generateProductSchema(product))

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        <Header bgColor="bg-white/90 backdrop-blur-sm" textColor="text-[#2c2824]" />
        <div className="container mx-auto pt-24 pb-8 px-1">
          <div className="text-center py-16">
            <p className="text-lg md:text-xl text-[#2c2824]/60 font-serif italic">Loading available pieces...</p>
          </div>
        </div>
      </div>
    )
  }

  // ============= RENDER UI =============
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

      {/* Navigation Header */}
      <Header bgColor="bg-white/90 backdrop-blur-sm" textColor="text-[#2c2824]" />
      <div className="container mx-auto pt-24 pb-8 px-1">
        {/* Top mood line */}
        <div className="max-w-4xl mx-auto mb-6 text-center">
          <h1 className="text-lg md:text-xl lg:text-2xl font-serif text-[#2c2824] italic mb-2">
            Fabrics that remember.
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl font-serif text-[#2c2824] italic">
            Garments that manifest lineage.
          </p>
        </div>

        {/* ============= REGION SELECTOR ============= */}
        <div className="mb-4">
          <div className="flex justify-center">
            <div className="text-center">
              <h2 className="text-sm mb-4 opacity-70 font-medium">Select Your Region</h2>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setSelectedRegion("UAE")}
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
                  onClick={() => setSelectedRegion("UK")}
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

        {/* ============= COLLECTION FILTER BUTTONS ============= */}
        <div className="mb-6">
          <div className="flex justify-center">
            <div className="text-center">
              <h2 className="text-sm mb-4 opacity-70 font-medium">Filter by Collection</h2>
              <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
                <button
                  onClick={() => handleCollectionFilter("all")}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm transition-colors ${
                    activeFilter === "all"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                  aria-label="Show all African fashion collections"
                >
                  All ({allProducts.length})
                </button>
                <button
                  onClick={() => handleCollectionFilter("the-manifested-set")}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm transition-colors ${
                    activeFilter === "the-manifested-set"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                  aria-label="Shop The Manifested Set collection"
                >
                  The Manifested Set
                </button>

                <button
                  onClick={() => handleCollectionFilter("ayomide")}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm transition-colors ${
                    activeFilter === "ayomide"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                  aria-label="Shop Ayọ̀mídé adire dress collection"
                >
                  Ayọ̀mídé
                </button>

                <button
                  onClick={() => handleCollectionFilter("ayaba-bubu")}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm transition-colors ${
                    activeFilter === "ayaba-bubu"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                  aria-label="Shop Àyaba bubu dress collection"
                >
                  Àyaba
                </button>

                <button
                  onClick={() => handleCollectionFilter("candy-combat")}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm transition-colors ${
                    activeFilter === "candy-combat"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                  aria-label="Shop Candy Combat trouser collection"
                >
                  Candy Combat
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============= PRODUCT DISPLAY ============= */}
        <div className={getGridClasses()}>
          {filteredProducts.map((product) => {
            const descriptionParts = getDescriptionParts(product.description)
            const displayPrice = selectedRegion === "UAE" ? product.priceAED : product.priceGBP
            const stockLevel = product.stockLevel || 0

            return (
              <article key={product.id} className={getProductContainerClasses()} id={product.category}>
                <div className={`relative ${getImageAspectRatio()} overflow-hidden mb-2 group`}>
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={`${product.name} - ${product.subtitle} - African fashion by AMA featuring ${product.materials.join(", ")} materials`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes={
                      activeFilter === "the-manifested-set"
                        ? "(max-width: 768px) 100vw, 50vw"
                        : activeFilter === "ayomide"
                          ? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                          : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    }
                  />

                  {/* Stock indicator overlay */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        stockLevel === 0
                          ? "bg-orange-100 text-orange-800"
                          : stockLevel <= 3
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {getStockDisplay(stockLevel)}
                    </span>
                  </div>
                </div>

                <div className="text-center space-y-3">
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
                    {product.colors && product.category === "ayomide" && (
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: product.colors[0] }}
                        title={product.colors[0] === "#3B82F6" ? "Blue" : "Pink"}
                        aria-label={`${product.colors[0] === "#3B82F6" ? "blue" : "pink"}`}
                      />
                    )}
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

                  {/* Quantity Selector */}
                  <div className="pt-2">
                    <QuantitySelector
                      stockLevel={stockLevel}
                      onQuantityChange={(quantity) => handleQuantityChange(product.id, quantity)}
                      initialQuantity={1}
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={() => handleBuyNow(product)}
                      className={`${
                        stockLevel === 0 ? "bg-orange-600 hover:bg-orange-700" : "bg-[#2c2824] hover:bg-[#2c2824]/90"
                      } text-white ${
                        activeFilter === "the-manifested-set"
                          ? "px-12 py-4 text-lg md:text-xl"
                          : activeFilter === "ayomide"
                            ? "px-10 py-3 text-base md:text-lg"
                            : "px-8 py-2 text-sm md:text-base"
                      }`}
                      aria-label={`${getButtonText(product)} ${product.name} for ${displayPrice}`}
                    >
                      {getButtonText(product)}
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg md:text-xl text-[#2c2824]/60 font-serif italic">
              {loading ? "Loading available pieces..." : "No pieces currently available in this collection."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
