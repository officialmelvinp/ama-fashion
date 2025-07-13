import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"

// Re-add font imports
import { Playfair_Display, Inter } from "next/font/google"
// Re-add SEO imports
import { generateMetaTags, generateOrganizationSchema } from "@/lib/seo"

// Define font instances
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

// Re-add enhanced SEO metadata
export const metadata: Metadata = generateMetaTags({
  title: "Amariah Manifested Art | Conscious Luxury African Fashion – Dubai & UK",
  description:
    "AMA is a minimalist African fashion brand crafting spiritually-rooted bubu dresses and contemporary printwear in Dubai and the UK. Intentional. Elegant. Manifested.",
  keywords: ["conscious luxury womenswear", "heritage fashion", "spiritual fashion", "African diaspora fashion"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Inside RootLayout function, before the return statement
  const organizationSchema = generateOrganizationSchema()

  // Modify the <html> and <body> tags to include the <head> section and font classes
  // Replace the existing <html> and <body> with the following:
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Enhanced meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2c2824" />
        {/* Favicon - Next.js will automatically serve /public/favicon.ico */}
        {/* No need to explicitly link it - Next.js handles this automatically */}
        <link rel="manifest" href="/manifest.json" />
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        {/* Preconnect to external domains */}
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
