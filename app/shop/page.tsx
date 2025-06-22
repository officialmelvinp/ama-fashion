import type { Metadata } from "next"
import ShopPageClient from "./shop-client"
import { generateMetaTags } from "@/lib/seo"

// SEO metadata for shop page
export const metadata: Metadata = generateMetaTags({
  title: "Shop African Fashion | Bubu Dresses & Contemporary African Wear - AMA",
  description:
    "Shop AMA's collection of luxury African fashion. Handcrafted bubu dresses, batik clothing, adire prints, and contemporary African wear for women. Available in Dubai, UAE, and the UK. Free shipping on orders over 500 AED.",
  keywords: [
    "shop African fashion online",
    "buy bubu dress",
    "African clothing store",
    "luxury African fashion Dubai",
    "contemporary African wear UK",
    "batik dresses online",
    "adire clothing shop",
    "ankara fashion store",
    "African fashion boutique",
    "handmade African dresses",
    "conscious fashion shopping",
    "heritage clothing online",
  ],
  url: "/shop",
})

export default function ShopPage() {
  return (
    <>
      <ShopPageClient />
    </>
  )
}
