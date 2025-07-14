"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Header from "@/components/header"
import { useCart } from "@/hooks/use-cart"
import { ShoppingCart, Trash2 } from "lucide-react"
import type { CartItem } from "@/lib/types" // Import CartItem type

export default function CartPage() {
  const { items, removeItem, updateItemQuantity, clearCart, getTotalItems, getTotalPrice } = useCart()

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId) // Remove if quantity is 0 or less
    } else {
      updateItemQuantity(productId, newQuantity)
    }
  }

  const handleProceedToCheckout = () => {
    // Store the entire cart in localStorage for the checkout page to pick up
    // The checkout page will need to be updated to handle multiple items
    localStorage.setItem("cartItems", JSON.stringify(items))
    window.location.href = "/checkout"
  }

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  return (
    <div className="min-h-screen bg-[#f8f3ea]">
      <Header bgColor="bg-white/90 backdrop-blur-sm" textColor="text-[#2c2824]" />
      <div className="container mx-auto pt-24 pb-12 px-4">
        <h1 className="text-3xl md:text-4xl font-serif text-center mb-12 text-[#2c2824]">Your Shopping Cart</h1>

        {totalItems === 0 ? (
          <Card className="max-w-2xl mx-auto text-center py-16">
            <CardContent>
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[#2c2824] mb-2">Your cart is empty</h2>
              <p className="text-[#2c2824]/60 mb-6">Looks like you haven't added anything to your cart yet.</p>
              <Link href="/shop">
                <Button className="bg-[#2c2824] text-white hover:bg-[#2c2824]/90">Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item: CartItem) => (
                <Card key={`${item.id}-${item.selectedRegion}`} className="flex items-center p-4 shadow-sm">
                  <div className="relative w-24 h-24 flex-shrink-0 mr-4">
                    <Image
                      src={item.images[0] || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-serif text-lg text-[#2c2824]">{item.name}</h2>
                    <p className="text-sm text-[#2c2824]/80 mb-2">
                      {item.subtitle} • {item.selectedRegion}
                    </p>
                    <p className="font-medium text-[#2c2824]">{item.selectedPrice}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <Input
                      type="number"
                      min="1"
                      value={item.selectedQuantity}
                      onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                      className="w-20 text-center"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 shadow-sm">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-xl font-serif text-[#2c2824]">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3 mb-6">
                  <div className="flex justify-between text-[#2c2824]">
                    <span>Total Items:</span>
                    <span>{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-[#2c2824]">
                    <span>Subtotal:</span>
                    <span>
                      {totalPrice.toFixed(2)}{" "}
                      {items.length > 0 ? (items[0].selectedRegion === "UAE" ? "AED" : "GBP") : ""}
                    </span>
                  </div>
                  <p className="text-sm text-[#2c2824]/60">Shipping calculated at checkout.</p>
                </CardContent>
                <CardFooter className="p-0 flex flex-col gap-4">
                  <Button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-[#2c2824] text-white hover:bg-[#2c2824]/90 py-3 text-lg"
                  >
                    Proceed to Checkout
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="w-full py-3 text-lg bg-transparent border-[#2c2824] text-[#2c2824] hover:bg-[#2c2824]/5"
                  >
                    Clear Cart
                  </Button>
                  <Link href="/shop" className="w-full">
                    <Button variant="link" className="w-full text-[#2c2824]/80 hover:text-[#2c2824]">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
