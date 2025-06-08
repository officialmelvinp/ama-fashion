import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from 'next/font/google'
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "AMA | Woven From Spirit. Rooted in Heritage.",
  description: "Luxury fashion rooted in West African heritage",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>{children}</body>
    </html>
  )
}