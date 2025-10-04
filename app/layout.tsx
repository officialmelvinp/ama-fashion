import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"
import { Playfair_Display, Inter } from "next/font/google"
import { generateMetaTags, generateOrganizationSchema } from "@/lib/seo"

// Fonts
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})


export const metadata: Metadata = {
  metadataBase: new URL("https://www.amariahco.com"), 
  title: "Amariah Manifested Art | Conscious Luxury African Fashion – Dubai & UK",
  description:
    "AMA is a minimalist African fashion brand crafting spiritually-rooted bubu dresses and contemporary printwear in Dubai and the UK. Intentional. Elegant. Manifested.",
  keywords: [
    "conscious luxury womenswear",
    "heritage fashion",
    "spiritual fashion",
    "African diaspora fashion",
    "bubu dresses",
    "Dubai fashion",
    "UK fashion brand",
    
  ],
  openGraph: {
    title: "Amariah Manifested Art | Conscious Luxury African Fashion – Dubai & UK",
    description: "AMA is a minimalist African fashion brand crafting spiritually-rooted bubu dresses and contemporary printwear in Dubai and the UK. Intentional. Elegant. Manifested.",
    url: "https://www.amariahco.com",
    siteName: "Amariah Manifested Art",
    images: [
      {
        url: "/images/ama3.jpeg", 
        width: 1200,
        height: 630,
        alt: "Amariah Manifested Art - Conscious African Fashion",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amariah Manifested Art | Conscious African Fashion",
    description: "Conscious luxury fashion crafted with purpose in Dubai & UK.",
    images: ["/images/ama3.jpeg"], 
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const organizationSchema = generateOrganizationSchema()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2c2824" />
        <link rel="manifest" href="/manifest.json" />

        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />

        {/* Performance optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>

      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}









// import type React from "react"
// import type { Metadata } from "next"
// import "./globals.css"
// import { Providers } from "@/components/providers"
// import { Toaster } from "@/components/ui/toaster"
// import { Playfair_Display, Inter } from "next/font/google"
// import { generateMetaTags, generateOrganizationSchema } from "@/lib/seo"

// // Define font instances
// const playfair = Playfair_Display({
//   subsets: ["latin"],
//   variable: "--font-playfair",
// })
// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
// })

// export const metadata: Metadata = generateMetaTags({
//   title: "Amariah Manifested Art | Conscious Luxury African Fashion – Dubai & UK",
//   description:
//     "AMA is a minimalist African fashion brand crafting spiritually-rooted bubu dresses and contemporary printwear in Dubai and the UK. Intentional. Elegant. Manifested.",
//   keywords: ["conscious luxury womenswear", "heritage fashion", "spiritual fashion", "African diaspora fashion"],
// })

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   // Inside RootLayout function, before the return statement
//   const organizationSchema = generateOrganizationSchema()

//   return (
//     <html lang="en" suppressHydrationWarning>
//       <head>
//         {/* Enhanced meta tags */}
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <meta name="theme-color" content="#2c2824" />
//         {/* Favicon - Next.js will automatically serve /public/favicon.ico */}
//         {/* No need to explicitly link it - Next.js handles this automatically */}
//         <link rel="manifest" href="/manifest.json" />
//         {/* Structured Data */}
//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{
//             __html: JSON.stringify(organizationSchema),
//           }}
//         />
//         {/* Preconnect to external domains */}
//         <link rel="preconnect" href="https://fonts.googleapis.com" />
//         <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
//       </head>
//       <body className={`${playfair.variable} ${inter.variable} antialiased`}>
//         <Providers>{children}</Providers>
//         <Toaster />
//       </body>
//     </html>
//   )
// }
