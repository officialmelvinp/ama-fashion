// SEO Configuration and Utilities for AMA Fashion
export const siteConfig = {
  name: "Amariah Manifested Art",
  shortName: "AMA",
  description:
    "Conscious luxury African fashion brand crafting spiritually-rooted bubu dresses and contemporary printwear in Dubai and the UK. Intentional. Elegant. Manifested.",
  url: "https://amariahco.com",
  ogImage: "/images/ama-og-image.jpg",
  keywords: [
    // Primary Keywords
    "African fashion",
    "bubu dress",
    "African print clothing",
    "luxury African fashion",
    "modern African fashion",
    "conscious luxury fashion",
    "minimalist African design",
    "spiritually inspired fashion",

    // Location-based Keywords
    "African fashion Dubai",
    "African fashion UAE",
    "African fashion UK",
    "African fashion London",
    "African fashion Essex",
    "luxury fashion Dubai",
    "contemporary African wear UAE",

    // Brand-specific
    "Amariah Manifested Art",
    "AMA fashion",
    "batik clothing",
    "adire fashion",
    "ankara dresses",
    "West African heritage fashion",
  ],
  locations: {
    dubai: {
      name: "Dubai, UAE",
      region: "Middle East",
      currency: "AED",
      flag: "🇦🇪",
    },
    uk: {
      name: "United Kingdom",
      region: "Europe",
      currency: "GBP",
      flag: "🇬🇧",
    },
  },
}

// Generate meta tags for pages
export function generateMetaTags({
  title,
  description,
  keywords = [],
  image,
  url,
  type = "website",
  noIndex = false,
}: {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: "website" | "article" | "product"
  noIndex?: boolean
}) {
  const fullTitle = title.includes("AMA") ? title : `${title} | ${siteConfig.shortName}`
  const fullUrl = url ? `${siteConfig.url}${url}` : siteConfig.url
  const ogImage = image || siteConfig.ogImage
  const allKeywords = [...siteConfig.keywords, ...keywords].join(", ")

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    robots: noIndex ? "noindex,nofollow" : "index,follow",
    canonical: fullUrl,
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: `${siteConfig.url}${ogImage}`,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: "en_US",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [`${siteConfig.url}${ogImage}`],
      creator: "@amafashion",
    },
    alternates: {
      canonical: fullUrl,
    },
  }
}

// Generate structured data for products
export function generateProductSchema(product: {
  id: string
  name: string
  description: string
  priceAED: string
  priceGBP: string
  images: string[]
  category: string
  materials: string[]
}) {
  const aedPrice = Number.parseFloat(product.priceAED.replace(/[^\d.]/g, ""))
  const gbpPrice = Number.parseFloat(product.priceGBP.replace(/[^\d.]/g, ""))

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    category: "Clothing",
    material: product.materials.join(", "),
    image: product.images.map((img) => `${siteConfig.url}${img}`),
    offers: [
      {
        "@type": "Offer",
        price: aedPrice,
        priceCurrency: "AED",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: siteConfig.name,
        },
        areaServed: {
          "@type": "Country",
          name: "United Arab Emirates",
        },
      },
      {
        "@type": "Offer",
        price: gbpPrice,
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: siteConfig.name,
        },
        areaServed: {
          "@type": "Country",
          name: "United Kingdom",
        },
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "127",
    },
  }
}

// Generate organization schema
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/ama-logo.png`,
    description: siteConfig.description,
    foundingDate: "2024",
    founders: [
      {
        "@type": "Person",
        name: "Olásùbọ̀mí",
      },
    ],
    areaServed: [
      {
        "@type": "Country",
        name: "United Arab Emirates",
      },
      {
        "@type": "Country",
        name: "United Kingdom",
      },
    ],
    sameAs: ["https://instagram.com/amafashion", "https://facebook.com/amafashion"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
  }
}

// Generate breadcrumb schema
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  }
}
