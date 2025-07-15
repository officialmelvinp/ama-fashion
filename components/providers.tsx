"use client"

import type React from "react"

import { ThemeProvider } from "next-themes"
import { CartProvider } from "@/context/cart-context"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  )
}
