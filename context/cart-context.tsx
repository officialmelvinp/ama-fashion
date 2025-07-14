"use client"

import type React from "react"
import { createContext, useState, useEffect, useCallback, useContext } from "react"
import type { CartItem, Product, Region } from "@/lib/types" // Correctly import CartItem, Product, Region
import { useToast } from "@/hooks/use-toast"

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity: number, region: Region, price: string) => void
  removeItem: (productId: string) => void
  updateItemQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "amariah_cart"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on initial mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (storedCart) {
        const parsedCart: CartItem[] = JSON.parse(storedCart)

        // Validate loaded items: ensure they have selectedPrice, selectedQuantity, selectedRegion
        const isValidCart = parsedCart.every(
          (item) =>
            item.id &&
            typeof item.selectedQuantity === "number" && // Use selectedQuantity
            item.selectedQuantity >= 0 &&
            typeof item.selectedRegion === "string" &&
            typeof item.selectedPrice === "string",
        )

        if (isValidCart) {
          setItems(parsedCart)
        } else {
          console.warn("Loaded cart from localStorage has an invalid structure. Clearing cart.")
          localStorage.removeItem(CART_STORAGE_KEY)
          setItems([]) // Clear items in state as well
        }
      }
    } catch (error) {
      console.error("Failed to load or parse cart from localStorage:", error)
      localStorage.removeItem(CART_STORAGE_KEY)
      setItems([]) // Clear items in state on parse error
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save cart to localStorage whenever items change (after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addItem = useCallback(
    (product: Product, quantity: number, region: Region, price: string) => {
      setItems((prevItems) => {
        const existingItemIndex = prevItems.findIndex(
          (item) => item.id === product.id && item.selectedRegion === region,
        )

        if (existingItemIndex > -1) {
          const updatedItems = [...prevItems]
          updatedItems[existingItemIndex].selectedQuantity += quantity // Use selectedQuantity
          toast({
            title: "Cart Updated",
            description: `${product.name} quantity updated in cart.`,
            variant: "default",
          })
          return updatedItems
        } else {
          const newItem: CartItem = {
            ...product,
            selectedQuantity: quantity, // Use selectedQuantity
            selectedRegion: region,
            selectedPrice: price,
          }
          toast({
            title: "Item Added to Cart",
            description: `${product.name} has been added to your cart.`,
            variant: "default",
          })
          return [...prevItems, newItem]
        }
      })
    },
    [toast],
  )

  const removeItem = useCallback(
    (productId: string) => {
      setItems((prevItems) => {
        const updatedItems = prevItems.filter((item) => item.id !== productId)
        toast({
          title: "Item Removed",
          description: "Product removed from your cart.",
          variant: "default",
        })
        return updatedItems
      })
    },
    [toast],
  )

  const updateItemQuantity = useCallback(
    (productId: string, quantity: number) => {
      setItems((prevItems) => {
        const updatedItems = prevItems.map(
          (item) => (item.id === productId ? { ...item, selectedQuantity: quantity } : item), // Use selectedQuantity
        )
        const filteredItems = updatedItems.filter((item) => item.selectedQuantity > 0) // Use selectedQuantity
        toast({
          title: "Cart Updated",
          description: "Item quantity adjusted.",
          variant: "default",
        })
        return filteredItems
      })
    },
    [toast],
  )

  const clearCart = useCallback(() => {
    setItems([])
    toast({
      title: "Cart Cleared",
      description: "Your shopping cart is now empty.",
      variant: "default",
    })
  }, [toast])

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.selectedQuantity, 0) // Use selectedQuantity
  }, [items])

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => {
      const priceMatch = item.selectedPrice.match(/[\d.]+/)
      const price = priceMatch ? Number.parseFloat(priceMatch[0]) : 0
      return total + price * item.selectedQuantity // Use selectedQuantity
    }, 0)
  }, [items])

  const value = {
    items,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// This is your new useCart hook, which simply consumes the context
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
