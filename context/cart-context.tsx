"use client"

import type React from "react"
import { createContext, useState, useContext, useCallback, useMemo, useEffect } from "react"
import type { ProductStatus } from "@/lib/types"

export type Region = "UAE" | "UK"

export interface CartItem {
  id: string
  name: string
  subtitle?: string | null
  image_urls: string[] | null // Corrected: Use image_urls as per Product type
  selectedPrice: {
    currency: string
    amount: number
  }
  selectedQuantity: number
  category: string | null
  selectedRegion: Region
  product_code: string | null
  price_aed: number | null
  price_gbp: number | null
  description: string | null
  materials: string[] | null
  essences: string[] | null
  quantity_available: number | null
  total_quantity: number | null
  pre_order_date: string | null
  status: ProductStatus
  created_at: string
  updated_at: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string, region: Region) => void
  updateQuantity: (productId: string, quantity: number, region: Region) => void
  clearCart: () => void
  calculateTotal: (region: Region) => { amount: number; currency: string }
  calculateTotalItems: (region?: Region) => number
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  calculateTotal: () => ({ amount: 0, currency: "AED" }),
  calculateTotalItems: () => 0,
})

export const useCart = () => useContext(CartContext)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("ama_cart")
      if (storedCart) {
        setCart(JSON.parse(storedCart))
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ama_cart", JSON.stringify(cart))
    }
  }, [cart])

  const addToCart = useCallback((item: CartItem) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (cartItem) => cartItem.id === item.id && cartItem.selectedRegion === item.selectedRegion,
      )

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart]
        const existingItem = updatedCart[existingItemIndex]
        let newQuantity = existingItem.selectedQuantity + item.selectedQuantity
        const maxAllowedQuantity = item.total_quantity !== null ? item.total_quantity : 99
        if (newQuantity > maxAllowedQuantity) {
          newQuantity = maxAllowedQuantity
        }
        updatedCart[existingItemIndex] = {
          ...existingItem,
          selectedQuantity: newQuantity,
        }
        return updatedCart
      } else {
        let newQuantity = item.selectedQuantity
        const maxAllowedQuantity = item.total_quantity !== null ? item.total_quantity : 99
        if (newQuantity > maxAllowedQuantity) {
          newQuantity = maxAllowedQuantity
        }
        return [...prevCart, { ...item, selectedQuantity: newQuantity }]
      }
    })
  }, [])

  const removeFromCart = useCallback((productId: string, region: Region) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === productId && item.selectedRegion === region)))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number, region: Region) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.id === productId && item.selectedRegion === region
          ? {
              ...item,
              selectedQuantity: quantity,
            }
          : item,
      )
      return updatedCart.filter((item) => item.selectedQuantity > 0)
    })
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const calculateTotal = useCallback(
    (region: Region) => {
      let totalAmount = 0
      const currency = region === "UAE" ? "AED" : "GBP"
      const regionalCart = cart.filter((item) => item.selectedRegion === region)
      if (regionalCart.length > 0) {
        totalAmount = regionalCart.reduce((sum, item) => {
          return sum + item.selectedPrice.amount * item.selectedQuantity
        }, 0)
      }
      return { amount: totalAmount, currency }
    },
    [cart],
  )

  const calculateTotalItems = useCallback(
    (region?: Region) => {
      if (region) {
        return cart
          .filter((item) => item.selectedRegion === region)
          .reduce((sum, item) => sum + item.selectedQuantity, 0)
      }
      return cart.reduce((sum, item) => sum + item.selectedQuantity, 0)
    },
    [cart],
  )

  const contextValue = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      calculateTotal,
      calculateTotalItems,
    }),
    [cart, addToCart, removeFromCart, updateQuantity, clearCart, calculateTotal, calculateTotalItems],
  )

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
}
