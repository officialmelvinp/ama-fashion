import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Playfair_Display, Inter } from "next/font/google"
import { generateMetaTags, generateOrganizationSchema } from "@/lib/seo"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"
import FooterAdvert from "@/components/footer-advert"
import { CartProvider } from "@/context/cart-context"

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
  ...generateMetaTags({
    title: "Amariah Manifested Art | Conscious Luxury African Fashion – Dubai & UK",
    description:
      "AMA is a minimalist African fashion brand crafting spiritually-rooted bubu dresses and contemporary printwear in Dubai and the UK. Intentional. Elegant. Manifested.",
    keywords: [
      "conscious luxury womenswear",
      "heritage fashion",
      "spiritual fashion",
      "African diaspora fashion",
    ],
  }),
  openGraph: {
    title: "Amariah Manifested Art",
    description:
      "AMA is a minimalist African fashion brand crafting spiritually-rooted bubu dresses and contemporary printwear in Dubai and the UK. Intentional. Elegant. Manifested.",
    url: "https://www.amariahco.com",
    siteName: "Amariah Manifested Art",
    images: [
      {
        url: "/images/ama3.jpeg",
        width: 1200,
        height: 630,
        alt: "Amariah Manifested Art Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amariah Manifested Art",
    description:
      "Explore conscious luxury African fashion in Dubai & UK. Intentional. Elegant. Manifested.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        {/* ✅ Wrap everything inside CartProvider */}
        <CartProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
          <Analytics />
          <FooterAdvert />
        </CartProvider>
      </body>
    </html>
  )
}
