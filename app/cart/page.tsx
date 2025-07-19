"use client"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { QuantitySelector } from "@/components/quantity-selector"
import { XCircle } from "lucide-react"
import Header from "@/components/header"
import { useMemo, useState } from "react"
import type { Region } from "@/context/cart-context" // Import Region type

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, calculateTotal, calculateTotalItems, clearCart } = useCart() // Added clearCart
  const [selectedRegion, setSelectedRegion] = useState<Region>("UAE") // Default to UAE

  const regionalCartItems = useMemo(
    () => cart.filter((item) => item.selectedRegion === selectedRegion),
    [cart, selectedRegion],
  )
  const { amount: cartTotalAmount, currency: cartTotalCurrency } = useMemo(
    () => calculateTotal(selectedRegion),
    [calculateTotal, selectedRegion],
  )
  const totalItems = useMemo(() => calculateTotalItems(selectedRegion), [calculateTotalItems, selectedRegion])

  return (
    <div className="min-h-screen flex flex-col">
      <Header bgColor="bg-white/90 backdrop-blur-sm" textColor="text-[#2c2824]" />
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6 pt-24">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#2c2824]">Your Shopping Cart</h1>

        <div className="flex justify-center mb-6 gap-4">
          <Button
            variant={selectedRegion === "UAE" ? "default" : "outline"}
            onClick={() => setSelectedRegion("UAE")}
            className={selectedRegion === "UAE" ? "bg-[#2c2824] text-white" : "text-[#2c2824] border-[#2c2824]"}
          >
            🇦🇪 UAE Cart
          </Button>
          <Button
            variant={selectedRegion === "UK" ? "default" : "outline"}
            onClick={() => setSelectedRegion("UK")}
            className={selectedRegion === "UK" ? "bg-[#2c2824] text-white" : "text-[#2c2824] border-[#2c2824]"}
          >
            🇬🇧 UK Cart
          </Button>
        </div>

        {regionalCartItems.length === 0 ? (
          <div className="text-center py-16">
            <XCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 mb-6">Your cart for {selectedRegion} is empty.</p>
            <Link href="/shop">
              <Button className="bg-[#2c2824] hover:bg-[#2c2824]/90 text-white px-8 py-3 text-lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {regionalCartItems.map((item) => (
                <Card
                  key={`${item.id}-${item.selectedRegion}`}
                  className="flex flex-col sm:flex-row items-center p-4 shadow-sm"
                >
                  <div className="relative w-32 h-32 flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
                    <Image
                      src={item.image_urls?.[0] || "/placeholder.svg"} // Fixed: Use image_urls
                      alt={item.name}
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-md"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-lg font-semibold text-[#2c2824]">{item.name}</h2>
                    {item.subtitle && <p className="text-sm text-gray-600">{item.subtitle}</p>}
                    <p className="text-md font-medium text-[#2c2824]">
                      {formatPrice(item.selectedPrice.amount, item.selectedPrice.currency)}
                    </p>
                    {item.pre_order_date && (
                      <p className="text-xs text-orange-600 mt-1">
                        Pre-order: ETA {new Date(item.pre_order_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-center sm:justify-end mt-4 sm:mt-0 sm:ml-auto">
                    <QuantitySelector
                      productId={item.id}
                      value={item.selectedQuantity}
                      onQuantityChange={(productId, newQuantity) =>
                        updateQuantity(productId, newQuantity, item.selectedRegion)
                      } // Fixed: Pass region
                      maxQuantity={item.total_quantity || 99} // Use total_quantity as max if available, else a high number
                      isPreOrderable={
                        item.status === "pre-order" || (item.status === "out-of-stock" && item.pre_order_date !== null)
                      }
                      stockLevel={item.quantity_available ?? 0} // Fixed: Provide fallback for null
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id, item.selectedRegion)} // Fixed: Pass region
                      className="ml-2 text-red-500 hover:text-red-700"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <Card className="lg:col-span-1 h-fit sticky top-24">
              <CardHeader>
                <CardTitle className="text-[#2c2824]">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Total Items:</span>
                  <span>{totalItems}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-[#2c2824]">
                  <span>Subtotal:</span>
                  <span>{formatPrice(cartTotalAmount, cartTotalCurrency)}</span>
                </div>
                <p className="text-xs text-gray-500">Shipping calculated at checkout.</p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Link href={`/checkout?region=${selectedRegion}`} className="w-full">
                  <Button className="w-full bg-[#2c2824] hover:bg-[#2c2824]/90 text-white py-2">
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link href="/shop" className="w-full">
                  <Button variant="outline" className="w-full text-[#2c2824] border-[#2c2824] py-2 bg-transparent">
                    Continue Shopping
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
