"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Menu, X, ShoppingCart, Phone } from "lucide-react"
import { useCart } from "@/hooks/use-cart" // This import is fine as it re-exports from context/cart-context

interface MobileNavProps {
  textColor?: string
  className?: string
}

export default function MobileNav({ textColor = "text-white", className }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { calculateTotalItems } = useCart() // Changed from getTotalItems
  const totalCartItems = calculateTotalItems()
  const closeMenu = () => setIsOpen(false)
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className={className}>
        <Button variant="ghost" size="icon" className={textColor}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 pt-48 pb-6 sm:max-w-sm sm:ring-1 sm:ring-gray-200">
        {" "}
        {/* Increased pt-48 for even more top space */}
        <div className="flex items-center justify-end">
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4 text-gray-700 hover:bg-gray-100">
              <X className="h-6 w-6" aria-hidden="true" />
              <span className="sr-only">Close menu</span>
            </Button>
          </DialogClose>
        </div>
        <nav className="mt-6 flow-root">
          <div className="-my-6 divide-y divide-gray-200">
            <div className="flex flex-col p-4 space-y-4">
              <Link
                href="/"
                className={cn(
                  `text-base tracking-widest hover:opacity-70 transition-opacity text-[#2c2824]`,
                  pathname === "/" ? "opacity-100" : "opacity-80",
                )}
                onClick={closeMenu}
              >
                HOME
              </Link>
              <Link
                href="/shop"
                className={cn(
                  `text-base tracking-widest hover:opacity-70 transition-opacity text-[#2c2824]`,
                  pathname === "/shop" ? "opacity-100" : "opacity-80",
                )}
                onClick={closeMenu}
              >
                SHOP
              </Link>
              <Link
                href="/why-ama"
                className={cn(
                  `text-base tracking-widest hover:opacity-70 transition-opacity text-[#2c2824]`,
                  pathname === "/why-ama" ? "opacity-100" : "opacity-80",
                )}
                onClick={closeMenu}
              >
                WHY AMA
              </Link>
              <Link
                href="/contact" // New Contact Link
                className={cn(
                  `relative text-base tracking-widest hover:opacity-70 transition-opacity text-[#2c2824] flex items-center gap-2`,
                  pathname === "/contact" ? "opacity-100" : "opacity-80",
                )}
                onClick={closeMenu}
              >
                <Phone className="h-6 w-6" /> {/* Phone icon */}
                CONTACT
              </Link>
              <Link
                href="/cart"
                className={cn(
                  `relative text-base tracking-widest hover:opacity-70 transition-opacity text-[#2c2824] flex items-center gap-2`,
                  pathname === "/cart" ? "opacity-100" : "opacity-80",
                )}
                onClick={closeMenu}
              >
                <ShoppingCart className="h-6 w-6" />
                Cart
                {totalCartItems > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {totalCartItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </nav>
      </DialogContent>
    </Dialog>
  )
}
