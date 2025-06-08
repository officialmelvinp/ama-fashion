"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="absolute top-0 left-0 right-0 z-50 w-full py-6 px-4 md:px-8">
      <div className="container mx-auto flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <Link href="/" className="text-2xl md:text-3xl font-serif tracking-wider text-white">
          AMA
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-6 md:space-x-8">
          <Link
            href="/"
            className={cn(
              "text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity text-white",
              pathname === "/" ? "opacity-100" : "opacity-80",
            )}
          >
            HOME
          </Link>
          <Link
            href="/about"
            className={cn(
              "text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity text-white",
              pathname === "/about" ? "opacity-100" : "opacity-80",
            )}
          >
            ABOUT
          </Link>
          <Link
            href="/shop"
            className={cn(
              "text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity text-white",
              pathname === "/shop" ? "opacity-100" : "opacity-80",
            )}
          >
            SHOP
          </Link>
          <Link
            href="/why-ama"
            className={cn(
              "text-sm md:text-base tracking-widest hover:opacity-70 transition-opacity text-white",
              pathname === "/why-ama" ? "opacity-100" : "opacity-80",
            )}
          >
            WHY AMA
          </Link>
        </nav>
      </div>
    </header>
  )
}