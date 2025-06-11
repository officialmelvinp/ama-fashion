"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

// ============= TYPE DEFINITIONS =============
type Product = {
  id: string
  name: string
  subtitle: string
  materials: string[]
  description: string
  price: string
  images: string[]
  category: string
  essences: string[]
  materialLine: string
  colors?: string[]
}

// ============= PRODUCT DATA =============
const allProducts: Product[] = [
  {
    id: "ayaba-bubu",
    name: "Ayaba Bubu",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    materialLine: "Available in Batik, Ankara (100% hand-dyed cotton)",
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    price: "850 AED ($230 USD)",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
  },
  {
    id: "candy-combat",
    name: "Candy Combat",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    materialLine: "Available in Batik, Ankara with Aso Oke pockets (100% cotton)",
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    price: "650 AED ($175 USD)",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
  },
  {
    id: "manifest-set",
    name: "The Manifest Set",
    subtitle: "What You Asked For, Woven",
    materials: ["batik"],
    materialLine: "Available in Batik (100% cotton)",
    description: "A pairing of ease and presence. One-size drape, bound by craft.",
    price: "950 AED ($255 USD)",
    images: ["/images/ama5.jpeg"],
    category: "the-manifested-set",
    essences: ["sacred", "gatherings"],
  },
  {
    id: "Ayọ̀mídé",
    name: "Ayọ̀mídé",
    subtitle: "A Quiet Ode to Joy",
    materials: ["linen"],
    materialLine: "Available in Linen (100% cotton)",
    description: "Harvested grace. Linen softness, hued in memory.",
    price: "750 AED ($200 USD)",
    colors: ["Baby Blue", "Baby Pink"],
    images: ["/images/ama6.jpeg", "/images/ama7.jpeg"],
    category: "milkmaid-dress",
    essences: ["everyday", "gatherings"],
  },
  // {
  //   id: "oba-wrapper",
  //   name: "Oba Wrapper",
  //   subtitle: "Sacred Ceremonial Wrap",
  //   materials: ["aso-oke", "batik"],
  //   materialLine: "Available in Aso Oke, Batik (100% hand-woven cotton)",
  //   description: "Ancestral elegance. A ceremonial wrap woven with reverence, worn with honor.",
  //   price: "1,200 AED ($325 USD)",
  //   colors: ["Royal Blue", "Deep Gold"],
  //   images: ["/images/ama8.jpeg"],
  //   category: "oba-wrapper",
  //   essences: ["sacred", "gatherings"],
  // },

  // Add Ayọ̀mídé product (you can update this with actual product details)
  {
    id: "ayomide-dress",
    name: "Ayọ̀mídé Dress",
    subtitle: "A Quiet Ode to Joy",
    materials: ["adire"],
    materialLine: "Available in Adire (100% hand-dyed cotton)",
    description: "Joy woven into form. A dress that carries the lightness of being.",
    price: "780 AED ($210 USD)",
    images: ["/images/ama4.jpeg"], // Update with actual image
    category: "ayomide",
    essences: ["everyday", "sacred"],
  },
]

export default function ShopPage() {
  // ============= STATE MANAGEMENT =============
  const [activeFilter, setActiveFilter] = useState<string>("all")

  // ============= HANDLE URL HASH FROM HOMEPAGE =============
  useEffect(() => {
    // Check for hash in URL when component mounts
    const hash = window.location.hash.replace("#", "")

    if (hash) {
      // Map homepage hash links to filter categories
      const hashToFilter: { [key: string]: string } = {
        // Collections from homepage
        "ayaba-bubu": "ayaba-bubu",
        "candy-combat": "candy-combat",
        "the-manifested-set": "the-manifested-set",
        ayomide: "ayomide",
        // Fabrics from homepage - filter by material
        batik: "batik",
        adire: "adire",
        linen: "linen",
      }

      const filterValue = hashToFilter[hash]
      if (filterValue) {
        setActiveFilter(filterValue)
        // Scroll to the section if it exists
        setTimeout(() => {
          const element = document.getElementById(hash)
          if (element) {
            element.scrollIntoView({ behavior: "smooth" })
          }
        }, 100)
      }
    }
  }, [])

  // ============= FILTER LOGIC =============
  const getFilteredProducts = () => {
    if (activeFilter === "all") {
      return allProducts
    }

    // Filter by collection category
    if (["ayaba-bubu", "candy-combat", "the-manifested-set", "ayomide"].includes(activeFilter)) {
      return allProducts.filter((product) => product.category === activeFilter)
    }

    // Filter by fabric/material
    if (["batik", "adire", "linen"].includes(activeFilter)) {
      return allProducts.filter((product) =>
        product.materials.some((material) => material.toLowerCase().includes(activeFilter)),
      )
    }

    return allProducts
  }

  const filteredProducts = getFilteredProducts()

  // ============= EVENT HANDLERS =============
  const handleCollectionFilter = (collection: string) => {
    setActiveFilter(collection)
    // Update URL hash without page reload
    if (collection === "all") {
      window.history.pushState(null, "", window.location.pathname)
    } else {
      window.history.pushState(null, "", `#${collection}`)
    }
  }

  const handleBuyNow = (product: Product) => {
    // Store product in localStorage for checkout
    localStorage.setItem("selectedProduct", JSON.stringify(product))
    window.location.href = "/checkout"
  }

  // ============= RENDER UI =============
  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <Header bgColor="bg-white/90 backdrop-blur-sm" textColor="text-[#2c2824]" />

      <div className="container mx-auto py-24 px-4">
        {/* Top mood line */}
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <p className="text-xl md:text-2xl font-serif text-[#2c2824] italic">
            Fabrics that remember. Garments that manifest lineage.
          </p>
        </div>

        {/* ============= COLLECTION FILTER BUTTONS (UPDATED) ============= */}
        <div className="mb-16">
          <div className="flex justify-center">
            <div className="text-center">
              <h3 className="text-sm mb-4 opacity-70 font-medium">Filter by Collection</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {/* All Button */}
                <button
                  onClick={() => handleCollectionFilter("all")}
                  className={`px-6 py-3 rounded-full text-sm transition-colors ${
                    activeFilter === "all"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                >
                  All
                </button>

                {/* Ayaba Bùbá Button */}
                <button
                  onClick={() => handleCollectionFilter("ayaba-bubu")}
                  className={`px-6 py-3 rounded-full text-sm transition-colors ${
                    activeFilter === "ayaba-bubu"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                >
                  Ayaba Bùbá
                </button>

                {/* Candy Combat Button */}
                <button
                  onClick={() => handleCollectionFilter("candy-combat")}
                  className={`px-6 py-3 rounded-full text-sm transition-colors ${
                    activeFilter === "candy-combat"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                >
                  Candy Combat
                </button>

                {/* The Manifested Set Button */}
                <button
                  onClick={() => handleCollectionFilter("the-manifested-set")}
                  className={`px-6 py-3 rounded-full text-sm transition-colors ${
                    activeFilter === "the-manifested-set"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                >
                  The Manifested Set
                </button>

                {/* Ayọ̀mídé Button */}
                <button
                  onClick={() => handleCollectionFilter("ayomide")}
                  className={`px-6 py-3 rounded-full text-sm transition-colors ${
                    activeFilter === "ayomide"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                >
                  Ayọ̀mídé
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============= FABRIC FILTER SECTION (COMMENTED OUT) ============= */}
        {/* 
        <div className="mb-16">
          <div className="flex justify-center">
            <div className="text-center">
              <h3 className="text-sm mb-4 opacity-70 font-medium">Filter by Fabric</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => handleCollectionFilter("batik")}
                  className={`px-6 py-3 rounded-full text-sm transition-colors ${
                    activeFilter === "batik"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                >
                  Batik
                </button>

                <button
                  onClick={() => handleCollectionFilter("adire")}
                  className={`px-6 py-3 rounded-full text-sm transition-colors ${
                    activeFilter === "adire"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                >
                  Adire
                </button>

                <button
                  onClick={() => handleCollectionFilter("linen")}
                  className={`px-6 py-3 rounded-full text-sm transition-colors ${
                    activeFilter === "linen"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                >
                  Linen
                </button>
              </div>
            </div>
          </div>
        </div>
        */}

        {/* ============= PRODUCT DISPLAY ============= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {filteredProducts.map((product) => (
            <div key={product.id} className="flex flex-col" id={product.category}>
              <div className="relative aspect-[3/4] overflow-hidden mb-6 group">
                <Image
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Hover effect overlay for specific products */}
                {product.id === "candy-combat" && (
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <p className="text-white text-sm font-medium">Zoom on Aso Oke pocket detail</p>
                  </div>
                )}
                {product.id === "manifest-set" && (
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <p className="text-white text-sm font-medium">Texture focus on batik drape</p>
                  </div>
                )}
                {product.id === "milkmaid-dress" && (
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <p className="text-white text-sm font-medium">Slow zoom on linen weave</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h2 className="font-serif text-2xl md:text-3xl text-[#2c2824]">{product.name}</h2>
                <h3 className="font-serif text-lg md:text-base text-[#2c2824]/80 -mt-1">{product.subtitle}</h3>

                <p className="text-sm text-[#2c2824]/80">{product.materialLine}</p>

                {product.colors && <p className="text-sm text-[#2c2824]/80">Colors: {product.colors.join(" | ")}</p>}

                <p className="text-sm italic text-[#2c2824] leading-relaxed">{product.description}</p>

                <div className="flex items-center justify-between pt-4">
                  <span className="font-medium text-lg text-[#2c2824]">{product.price}</span>
                  <Button
                    onClick={() => handleBuyNow(product)}
                    className="bg-[#2c2824] text-white hover:bg-[#2c2824]/90 px-8 py-2"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show message when no products found */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-[#2c2824]/60 font-serif italic">No products found for this selection.</p>
          </div>
        )}
      </div>
    </div>
  )
}
