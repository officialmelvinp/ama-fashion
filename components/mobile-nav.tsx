"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Dialog, DialogContent } from "@/components/ui/dialog" // Changed to shadcn/ui Dialog
import { usePathname } from "next/navigation"
import { useCart } from "@/hooks/use-cart" // Ensure this path is correct
import { Menu, X, ShoppingCart } from "lucide-react" // Changed to lucide-react icons

import { siteConfig } from "@/config/site" // Ensure this path is correct

interface MobileNavProps {
  textColor?: string
  className?: string
}

export default function MobileNav({ textColor = "text-white", className }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { getTotalItems } = useCart()
  const totalCartItems = getTotalItems()

  return (
    <div className={className}>
      <button
        type="button"
        className={`-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 ${textColor}`}
        onClick={() => setIsOpen(true)}
      >
        <span className="sr-only">Open main menu</span>
        <Menu className="h-6 w-6" aria-hidden="true" /> {/* Changed icon */}
      </button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {" "}
        {/* Use shadcn Dialog's open/onOpenChange */}
        <DialogContent className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-black px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-bold text-white">
              {siteConfig.name}
            </Link>
            <button type="button" className="-m-2.5 rounded-md p-2.5 text-white" onClick={() => setIsOpen(false)}>
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" aria-hidden="true" /> {/* Changed icon */}
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-white/25">
              <div className="flex flex-col p-4 space-y-4 pt-16">
                <Link
                  href="/"
                  className={cn(
                    `text-base tracking-widest hover:opacity-70 transition-opacity text-white`,
                    pathname === "/" ? "opacity-100" : "opacity-80",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/shop"
                  className={cn(
                    `text-base tracking-widest hover:opacity-70 transition-opacity text-white`,
                    pathname === "/shop" ? "opacity-100" : "opacity-80",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Shop
                </Link>
                <Link
                  href="/why-ama"
                  className={cn(
                    `text-base tracking-widest hover:opacity-70 transition-opacity text-white`,
                    pathname === "/why-ama" ? "opacity-100" : "opacity-80",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Why AMA
                </Link>
                <Link
                  href="/contact"
                  className={cn(
                    `text-base tracking-widest hover:opacity-70 transition-opacity text-white`,
                    pathname === "/contact" ? "opacity-100" : "opacity-80",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Contact Us
                </Link>
                <Link
                  href="/cart"
                  className={cn(
                    `relative text-base tracking-widest hover:opacity-70 transition-opacity text-white flex items-center gap-2`,
                    pathname === "/cart" ? "opacity-100" : "opacity-80",
                  )}
                  onClick={() => setIsOpen(false)}
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
