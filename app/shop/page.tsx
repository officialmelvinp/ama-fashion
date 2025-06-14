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
  colors?: string[]
  materialLine?: string
  productCode?: string
}

// ============= PRODUCT DATA =============
const allProducts: Product[] = [
  // Ayaba Bubu - 12 items (now with numbers in name)
  {
    id: "ayaba-bubu-1",
    name: "Àyaba 01",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    price: "850 AED ($230 USD)",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
  },
  {
    id: "ayaba-bubu-2",
    name: "Àyaba 02",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    price: "850 AED ($230 USD)",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
  },
  {
    id: "ayaba-bubu-3",
    name: "Àyaba 03",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    price: "850 AED ($230 USD)",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
  },
  {
    id: "ayaba-bubu-4",
    name: "Àyaba 04",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    price: "850 AED ($230 USD)",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
  },
  {
    id: "ayaba-bubu-5",
    name: "Àyaba 05",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    price: "850 AED ($230 USD)",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
  },
  {
    id: "ayaba-bubu-6",
    name: "Àyaba 06",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    price: "850 AED ($230 USD)",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
  },
  {
    id: "ayaba-bubu-7",
    name: "Àyaba 07",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    price: "850 AED ($230 USD)",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
  },
  {
    id: "ayaba-bubu-8",
    name: "Àyaba 08",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    price: "850 AED ($230 USD)",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
  },
  {
    id: "ayaba-bubu-9",
    name: "Àyaba 09",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    price: "850 AED ($230 USD)",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
  },
  {
    id: "ayaba-bubu-10",
    name: "Àyaba 10",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    price: "850 AED ($230 USD)",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
  },
  {
    id: "ayaba-bubu-11",
    name: "Àyaba 11",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    price: "850 AED ($230 USD)",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
  },
  {
    id: "ayaba-bubu-12",
    name: "Àyaba 12",
    subtitle: "Royalty, Rendered in Thread",
    materials: ["batik", "ankara"],
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    price: "850 AED ($230 USD)",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
  },
  // Candy Combat - 12 items (now with numbers in name)
  {
    id: "candy-combat-1",
    name: "Candy Combat 01",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    price: "650 AED ($175 USD)",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
  },
  {
    id: "candy-combat-2",
    name: "Candy Combat 02",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    price: "650 AED ($175 USD)",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
  },
  {
    id: "candy-combat-3",
    name: "Candy Combat 03",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    price: "650 AED ($175 USD)",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
  },
  {
    id: "candy-combat-4",
    name: "Candy Combat 04",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    price: "650 AED ($175 USD)",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
  },
  {
    id: "candy-combat-5",
    name: "Candy Combat 05",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    price: "650 AED ($175 USD)",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
  },
  {
    id: "candy-combat-6",
    name: "Candy Combat 06",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    price: "650 AED ($175 USD)",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
  },
  {
    id: "candy-combat-7",
    name: "Candy Combat 07",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    price: "650 AED ($175 USD)",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
  },
  {
    id: "candy-combat-8",
    name: "Candy Combat 08",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    price: "650 AED ($175 USD)",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
  },
  {
    id: "candy-combat-9",
    name: "Candy Combat 09",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    price: "650 AED ($175 USD)",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
  },
  {
    id: "candy-combat-10",
    name: "Candy Combat 10",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    price: "650 AED ($175 USD)",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
  },
  {
    id: "candy-combat-11",
    name: "Candy Combat 11",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    price: "650 AED ($175 USD)",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
  },
  {
    id: "candy-combat-12",
    name: "Candy Combat 12",
    subtitle: "Softness, Armed",
    materials: ["batik", "ankara", "aso-oke"],
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    price: "650 AED ($175 USD)",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
  },

  // The Manifested Set - 1 item (no product code)
  {
    id: "manifest-set-1",
    name: "The Manifest Set",
    subtitle: "What You Asked For, Woven",
    materials: ["batik"],
    description: "A pairing of ease and presence. One-size drape, bound by craft.",
    price: "950 AED ($255 USD)",
    images: ["/images/ama5.jpeg"],
    category: "the-manifested-set",
    essences: ["sacred", "gatherings"],
  },
  // Ayọ̀mídé - 2 items (unchanged as requested)
  {
    id: "ayomide-blue",
    name: "Ayọ̀mídé Blue",
    subtitle: "A Quiet Ode to Joy",
    materials: ["adire"],
    description: "Joy woven into form. A dress that carries the lightness of being.",
    price: "780 AED ($210 USD)",
    images: ["/images/ama6.jpeg"],
    category: "ayomide",
    essences: ["everyday", "sacred"],
  },
  {
    id: "ayomide-pink",
    name: "Ayọ̀mídé Pink",
    subtitle: "A Quiet Ode to Joy",
    materials: ["adire"],
    description: "Joy woven into form. A dress that carries the lightness of being.",
    price: "780 AED ($210 USD)",
    images: ["/images/ama6.jpeg"],
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

  // ============= DYNAMIC GRID LAYOUT LOGIC =============
  const getGridClasses = () => {
    // For "The Manifested Set" - center single item
    if (activeFilter === "the-manifested-set") {
      return "flex justify-center"
    }

    // For "Ayomide" - 2 items side by side
    if (activeFilter === "ayomide") {
      return "grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 max-w-4xl mx-auto"
    }

    // For "Ayaba Bubu", "Candy Combat" and "All" - responsive grid
    return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16 max-w-7xl mx-auto"
  }

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

  // ============= HELPER FUNCTION TO SPLIT DESCRIPTION =============
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

  // ============= RENDER UI =============
  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <Header bgColor="bg-white/90 backdrop-blur-sm" textColor="text-[#2c2824]" />

      <div className="container mx-auto py-24 px-4">
        {/* Top mood line */}
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <p className="text-lg md:text-xl lg:text-2xl font-serif text-[#2c2824] italic">
            Fabrics that remember. Garments that manifest lineage.
          </p>
        </div>

        {/* ============= COLLECTION FILTER BUTTONS ============= */}
        <div className="mb-16">
          <div className="flex justify-center">
            <div className="text-center">
              <h3 className="text-sm mb-4 opacity-70 font-medium">Filter by Collection</h3>
              <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
                {/* All Button */}
                <button
                  onClick={() => handleCollectionFilter("all")}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm transition-colors ${
                    activeFilter === "all"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                >
                  All
                </button>

                {/* Ayaba Bùbù Button */}
                <button
                  onClick={() => handleCollectionFilter("ayaba-bubu")}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm transition-colors ${
                    activeFilter === "ayaba-bubu"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                >
                  Ayaba Bùbù
                </button>

                {/* Candy Combat Button */}
                <button
                  onClick={() => handleCollectionFilter("candy-combat")}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm transition-colors ${
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
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm transition-colors ${
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
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm transition-colors ${
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

        {/* ============= PRODUCT DISPLAY ============= */}
        <div className={getGridClasses()}>
          {filteredProducts.map((product) => {
            const descriptionParts = getDescriptionParts(product.description)

            return (
              <div key={product.id} className="flex flex-col max-w-md mx-auto" id={product.category}>
                {/* Reduced margin bottom to close gap after removing product code */}
                <div className="relative aspect-[3/4] overflow-hidden mb-4 group">
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                {/* Product Information - All Centered (removed product code section) */}
                <div className="text-center space-y-1">
                  <h2 className="font-serif text-xl md:text-2xl text-[#2c2824]">{product.name}</h2>
                  <h3 className="font-serif text-base md:text-lg text-[#2c2824]/80">{product.subtitle}</h3>
                  {/* Second part of description (A kaftan stitched...) */}
                  {descriptionParts.secondPart && (
                    <p className="text-sm italic text-[#2c2824] leading-relaxed">{descriptionParts.secondPart}</p>
                  )}
                  {/* First part of description (Freedom in form.) */}
                  <p className="text-sm italic text-[#2c2824] leading-relaxed">{descriptionParts.firstPart}</p>
                  <p className="font-medium text-base md:text-lg text-[#2c2824] pt-1">{product.price}</p>

                  {/* Buy Now Button - Centered below price */}
                  <div className="pt-2">
                    <Button
                      onClick={() => handleBuyNow(product)}
                      className="bg-[#2c2824] text-white hover:bg-[#2c2824]/90 px-8 py-2 text-sm md:text-base"
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Show message when no products found */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg md:text-xl text-[#2c2824]/60 font-serif italic">
              No products found for this selection.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
