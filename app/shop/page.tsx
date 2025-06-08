"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
// BATIK PRODUCTS
const batikProducts: Product[] = [
  {
    id: "ayaba-bubu",
    name: "Ayaba Bubu",
    subtitle: "The Sovereign Kaftan",
    materials: ["batik", "ankara"],
    materialLine: "Available in Batik, Ankara (100% hand-dyed cotton)",
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    price: "850 AED ($230 USD)",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
  },
  {
    id: "manifest-set",
    name: "The Manifest Set",
    subtitle: "Shirt Dress + Skirt",
    materials: ["batik"],
    materialLine: "Available in Batik (100% cotton)",
    description: "A pairing of ease and presence. One-size drape, bound by craft.",
    price: "950 AED ($255 USD)",
    images: ["/images/ama5.jpeg"],
    category: "the-manifested-set",
    essences: ["sacred", "gatherings"],
  },
  {
    id: "oba-wrapper",
    name: "Oba Wrapper",
    subtitle: "Sacred Ceremonial Wrap",
    materials: ["aso-oke", "batik"],
    materialLine: "Available in Aso Oke, Batik (100% hand-woven cotton)",
    description: "Ancestral elegance. A ceremonial wrap woven with reverence, worn with honor.",
    price: "1,200 AED ($325 USD)",
    colors: ["Royal Blue", "Deep Gold"],
    images: ["/images/ama8.jpeg"],
    category: "oba-wrapper",
    essences: ["sacred", "gatherings"],
  },
]

// ANKARA PRODUCTS
const ankaraProducts: Product[] = [
  {
    id: "ayaba-bubu",
    name: "Ayaba Bubu",
    subtitle: "The Sovereign Kaftan",
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
    subtitle: "Ease Trousers",
    materials: ["batik", "ankara", "aso-oke"],
    materialLine: "Available in Batik, Ankara with Aso Oke pockets (100% cotton)",
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    price: "650 AED ($175 USD)",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
  },
]

// ASO OKE PRODUCTS
const asoOkeProducts: Product[] = [
  {
    id: "candy-combat",
    name: "Candy Combat",
    subtitle: "Ease Trousers",
    materials: ["batik", "ankara", "aso-oke"],
    materialLine: "Available in Batik, Ankara with Aso Oke pockets (100% cotton)",
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    price: "650 AED ($175 USD)",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
  },
  {
    id: "oba-wrapper",
    name: "Oba Wrapper",
    subtitle: "Sacred Ceremonial Wrap",
    materials: ["aso-oke", "batik"],
    materialLine: "Available in Aso Oke, Batik (100% hand-woven cotton)",
    description: "Ancestral elegance. A ceremonial wrap woven with reverence, worn with honor.",
    price: "1,200 AED ($325 USD)",
    colors: ["Royal Blue", "Deep Gold"],
    images: ["/images/ama8.jpeg"],
    category: "oba-wrapper",
    essences: ["sacred", "gatherings"],
  },
]

// LINEN PRODUCTS
const linenProducts: Product[] = [
  {
    id: "milkmaid-dress",
    name: "Milkmaid Dress",
    subtitle: "Soft Presence",
    materials: ["linen"],
    materialLine: "Available in Linen (100% cotton)",
    description: "Harvested grace. Linen softness, hued in memory.",
    price: "750 AED ($200 USD)",
    colors: ["Baby Blue", "Baby Pink"],
    images: ["/images/ama6.jpeg", "/images/ama7.jpeg"],
    category: "milkmaid-dress",
    essences: ["everyday", "gatherings"],
  },
]

// EVERYDAY PRODUCTS
const everydayProducts: Product[] = [
  {
    id: "ayaba-bubu",
    name: "Ayaba Bubu",
    subtitle: "The Sovereign Kaftan",
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
    subtitle: "Ease Trousers",
    materials: ["batik", "ankara", "aso-oke"],
    materialLine: "Available in Batik, Ankara with Aso Oke pockets (100% cotton)",
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    price: "650 AED ($175 USD)",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
  },
  {
    id: "milkmaid-dress",
    name: "Milkmaid Dress",
    subtitle: "Soft Presence",
    materials: ["linen"],
    materialLine: "Available in Linen (100% cotton)",
    description: "Harvested grace. Linen softness, hued in memory.",
    price: "750 AED ($200 USD)",
    colors: ["Baby Blue", "Baby Pink"],
    images: ["/images/ama6.jpeg", "/images/ama7.jpeg"],
    category: "milkmaid-dress",
    essences: ["everyday", "gatherings"],
  },
]

// SACRED PRODUCTS
const sacredProducts: Product[] = [
  {
    id: "ayaba-bubu",
    name: "Ayaba Bubu",
    subtitle: "The Sovereign Kaftan",
    materials: ["batik", "ankara"],
    materialLine: "Available in Batik, Ankara (100% hand-dyed cotton)",
    description: "Freedom in form. A kaftan stitched with lineage, worn in ease.",
    price: "850 AED ($230 USD)",
    images: ["/images/ama3.jpeg"],
    category: "ayaba-bubu",
    essences: ["everyday", "sacred"],
  },
  {
    id: "manifest-set",
    name: "The Manifest Set",
    subtitle: "Shirt Dress + Skirt",
    materials: ["batik"],
    materialLine: "Available in Batik (100% cotton)",
    description: "A pairing of ease and presence. One-size drape, bound by craft.",
    price: "950 AED ($255 USD)",
    images: ["/images/ama5.jpeg"],
    category: "the-manifested-set",
    essences: ["sacred", "gatherings"],
  },
  {
    id: "oba-wrapper",
    name: "Oba Wrapper",
    subtitle: "Sacred Ceremonial Wrap",
    materials: ["aso-oke", "batik"],
    materialLine: "Available in Aso Oke, Batik (100% hand-woven cotton)",
    description: "Ancestral elegance. A ceremonial wrap woven with reverence, worn with honor.",
    price: "1,200 AED ($325 USD)",
    colors: ["Royal Blue", "Deep Gold"],
    images: ["/images/ama8.jpeg"],
    category: "oba-wrapper",
    essences: ["sacred", "gatherings"],
  },
]

// GATHERINGS PRODUCTS
const gatheringsProducts: Product[] = [
  {
    id: "candy-combat",
    name: "Candy Combat",
    subtitle: "Ease Trousers",
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
    subtitle: "Shirt Dress + Skirt",
    materials: ["batik"],
    materialLine: "Available in Batik (100% cotton)",
    description: "A pairing of ease and presence. One-size drape, bound by craft.",
    price: "950 AED ($255 USD)",
    images: ["/images/ama5.jpeg"],
    category: "the-manifested-set",
    essences: ["sacred", "gatherings"],
  },
  {
    id: "milkmaid-dress",
    name: "Milkmaid Dress",
    subtitle: "Soft Presence",
    materials: ["linen"],
    materialLine: "Available in Linen (100% cotton)",
    description: "Harvested grace. Linen softness, hued in memory.",
    price: "750 AED ($200 USD)",
    colors: ["Baby Blue", "Baby Pink"],
    images: ["/images/ama6.jpeg", "/images/ama7.jpeg"],
    category: "milkmaid-dress",
    essences: ["everyday", "gatherings"],
  },
  {
    id: "oba-wrapper",
    name: "Oba Wrapper",
    subtitle: "Sacred Ceremonial Wrap",
    materials: ["aso-oke", "batik"],
    materialLine: "Available in Aso Oke, Batik (100% hand-woven cotton)",
    description: "Ancestral elegance. A ceremonial wrap woven with reverence, worn with honor.",
    price: "1,200 AED ($325 USD)",
    colors: ["Royal Blue", "Deep Gold"],
    images: ["/images/ama8.jpeg"],
    category: "oba-wrapper",
    essences: ["sacred", "gatherings"],
  },
]

// ALL PRODUCTS (combined)
const allProducts: Product[] = [
  ...batikProducts,
  ...linenProducts,
  {
    id: "candy-combat",
    name: "Candy Combat",
    subtitle: "Ease Trousers",
    materials: ["batik", "ankara", "aso-oke"],
    materialLine: "Available in Batik, Ankara with Aso Oke pockets (100% cotton)",
    description: "Strength stitched in softness. Combat trousers, heritage-pocketed, spirit armored.",
    price: "650 AED ($175 USD)",
    images: ["/images/ama4.jpeg"],
    category: "candy-combat",
    essences: ["everyday", "gatherings"],
  },
  {
    id: "oba-wrapper",
    name: "Oba Wrapper",
    subtitle: "Sacred Ceremonial Wrap",
    materials: ["aso-oke", "batik"],
    materialLine: "Available in Aso Oke, Batik (100% hand-woven cotton)",
    description: "Ancestral elegance. A ceremonial wrap woven with reverence, worn with honor.",
    price: "1,200 AED ($325 USD)",
    colors: ["Royal Blue", "Deep Gold"],
    images: ["/images/ama8.jpeg"],
    category: "oba-wrapper",
    essences: ["sacred", "gatherings"],
  },
].filter(
  (product, index, self) =>
    // Remove duplicates by ID
    index === self.findIndex((p) => p.id === product.id),
)

export default function ShopPage() {
  // ============= STATE MANAGEMENT =============
  const [activeFilter, setActiveFilter] = useState<{ type: "material" | "essence" | null; value: string }>({
    type: null,
    value: "all",
  })

  // ============= FILTER LOGIC =============
  // Get products based on active filter
  const getFilteredProducts = () => {
    let products = []

    if (activeFilter.type === null || activeFilter.value === "all") {
      products = allProducts
    } else if (activeFilter.type === "material") {
      switch (activeFilter.value) {
        case "batik":
          products = batikProducts
          break
        case "ankara":
          products = ankaraProducts
          break
        case "aso-oke":
          products = asoOkeProducts
          break
        case "linen":
          products = linenProducts
          break
        default:
          products = allProducts
      }
    } else if (activeFilter.type === "essence") {
      switch (activeFilter.value) {
        case "everyday":
          products = everydayProducts
          break
        case "sacred":
          products = sacredProducts
          break
        case "gatherings":
          products = gatheringsProducts
          break
        default:
          products = allProducts
      }
    } else {
      products = allProducts
    }

    // Remove duplicates by ID
    return products.filter((product, index, self) => index === self.findIndex((p) => p.id === product.id))
  }

  const filteredProducts = getFilteredProducts()

  // ============= EVENT HANDLERS =============
  // Handle material filter click
  const handleMaterialFilter = (material: string) => {
    if (activeFilter.type === "material" && activeFilter.value === material) {
      // If clicking the same material filter, turn it off
      setActiveFilter({ type: null, value: "all" })
    } else {
      // Otherwise, activate this material filter
      setActiveFilter({ type: "material", value: material })
    }
  }

  // Handle essence filter click
  const handleEssenceFilter = (essence: string) => {
    if (activeFilter.type === "essence" && activeFilter.value === essence) {
      // If clicking the same essence filter, turn it off
      setActiveFilter({ type: null, value: "all" })
    } else {
      // Otherwise, activate this essence filter
      setActiveFilter({ type: "essence", value: essence })
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
      <header className="absolute top-0 left-0 right-0 z-50 w-full py-6 px-4 md:px-8 bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between max-w-7xl">
          {/* Logo */}
          <Link href="/" className="text-2xl md:text-3xl font-serif tracking-wider text-[#2c2824]">
            AMA
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6 md:space-x-8">
            <Link
              href="/"
              className="text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity text-[#2c2824] opacity-80"
            >
              HOME
            </Link>
            <Link
              href="/about"
              className="text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity text-[#2c2824] opacity-80"
            >
              ABOUT
            </Link>
            <Link
              href="/shop"
              className="text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity text-[#2c2824] opacity-100"
            >
              SHOP
            </Link>
            <Link
              href="/why-ama"
              className="text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity text-[#2c2824] opacity-80"
            >
              WHY AMA
            </Link>
            <Link
              href="/contact"
              className="text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity text-[#2c2824] opacity-80"
            >
              CONTACT
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto py-24 px-4">
        {/* Top mood line */}
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <p className="text-xl md:text-2xl font-serif text-[#2c2824] italic">
            Fabrics that remember. Garments that manifest lineage.
          </p>
        </div>

        {/* ============= FILTER BUTTONS ============= */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row justify-center gap-8 mb-8">
            {/* Material Filters */}
            <div className={activeFilter.type === "essence" ? "opacity-50" : ""}>
              <h3 className="text-sm mb-3 opacity-70 text-center md:text-left font-medium">By Material</h3>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {/* All Materials Button */}
                <button
                  onClick={() => handleMaterialFilter("all")}
                  disabled={activeFilter.type === "essence"}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    activeFilter.type === "material" && activeFilter.value === "all"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                >
                  All
                </button>

                {/* Batik Button */}
                <button
                  onClick={() => handleMaterialFilter("batik")}
                  disabled={activeFilter.type === "essence"}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    activeFilter.type === "material" && activeFilter.value === "batik"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                >
                  Batik
                </button>

                {/* Ankara Button */}
                <button
                  onClick={() => handleMaterialFilter("ankara")}
                  disabled={activeFilter.type === "essence"}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    activeFilter.type === "material" && activeFilter.value === "ankara"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                >
                  Ankara
                </button>

                {/* Aso Oke Button */}
                <button
                  onClick={() => handleMaterialFilter("aso-oke")}
                  disabled={activeFilter.type === "essence"}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    activeFilter.type === "material" && activeFilter.value === "aso-oke"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                >
                  Aso Oke
                </button>

                {/* Linen Button */}
                <button
                  onClick={() => handleMaterialFilter("linen")}
                  disabled={activeFilter.type === "essence"}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    activeFilter.type === "material" && activeFilter.value === "linen"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                >
                  Linen
                </button>
              </div>
            </div>

            {/* Essence Filters */}
            <div className={activeFilter.type === "material" ? "opacity-50" : ""}>
              <h3 className="text-sm mb-3 opacity-70 text-center md:text-left font-medium">By Essence</h3>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {/* All Essences Button */}
                <button
                  onClick={() => handleEssenceFilter("all")}
                  disabled={activeFilter.type === "material"}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    activeFilter.type === "essence" && activeFilter.value === "all"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                >
                  All
                </button>

                {/* Everyday Button */}
                <button
                  onClick={() => handleEssenceFilter("everyday")}
                  disabled={activeFilter.type === "material"}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    activeFilter.type === "essence" && activeFilter.value === "everyday"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                >
                  Everyday
                </button>

                {/* Sacred wear Button */}
                <button
                  onClick={() => handleEssenceFilter("sacred")}
                  disabled={activeFilter.type === "material"}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    activeFilter.type === "essence" && activeFilter.value === "sacred"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                >
                  Sacred wear
                </button>

                {/* Gatherings Button */}
                <button
                  onClick={() => handleEssenceFilter("gatherings")}
                  disabled={activeFilter.type === "material"}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    activeFilter.type === "essence" && activeFilter.value === "gatherings"
                      ? "bg-[#2c2824] text-white"
                      : "bg-[#f4f0e8] text-[#2c2824] hover:bg-[#2c2824]/10"
                  }`}
                >
                  Gatherings
                </button>
              </div>
            </div>
          </div>
        </div>

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
                <h2 className="font-serif text-2xl md:text-3xl text-[#2c2824]">
                  {product.name} — {product.subtitle}
                </h2>

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
      </div>
    </div>
  )
}
