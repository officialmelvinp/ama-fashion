"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import MobileNav from "./mobile-nav" // Changed to default import
import { useCart } from "@/hooks/use-cart"
import { ShoppingCart } from "lucide-react"

interface HeaderProps {
  bgColor?: string
  textColor?: string
}

export default function Header({ bgColor = "bg-transparent", textColor = "text-white" }: HeaderProps) {
  const pathname = usePathname()
  const { getTotalItems } = useCart()
  const totalCartItems = getTotalItems()

  return (
    <header className={`absolute top-0 left-0 right-0 z-50 w-full py-6 px-4 md:px-8 ${bgColor}`}>
      <div className="container mx-auto flex items-center justify-between max-w-7xl">
        <Link href="/" className={`text-2xl md:text-3xl font-serif tracking-wider ${textColor}`}>
          AMA
        </Link>

        {/* Added md:hidden to hide MobileNav on medium and larger screens */}
        <MobileNav textColor={textColor} className="md:hidden" />

        <nav className="hidden md:flex items-center space-x-6 md:space-x-8">
          <Link
            href="/"
            className={cn(
              `text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity ${textColor}`,
              pathname === "/" ? "opacity-100" : "opacity-80",
            )}
          >
            HOME
          </Link>
          <Link
            href="/shop"
            className={cn(
              `text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity ${textColor}`,
              pathname === "/shop" ? "opacity-100" : "opacity-80",
            )}
          >
            SHOP
          </Link>
          <Link
            href="/why-ama"
            className={cn(
              `text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity ${textColor}`,
              pathname === "/why-ama" ? "opacity-100" : "opacity-80",
            )}
          >
            WHY AMA
          </Link>
          <Link
            href="/contact"
            className={cn(
              `text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity ${textColor}`,
              pathname === "/contact" ? "opacity-100" : "opacity-80",
            )}
          >
            CONTACT
          </Link>
          <Link href="/cart" className={`relative ${textColor} hover:opacity-70 transition-opacity`}>
            <ShoppingCart className="h-6 w-6" />
            {totalCartItems > 0 && (
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                {totalCartItems}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  )
}
