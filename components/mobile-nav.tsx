"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  textColor?: string
}

export default function MobileNav({ textColor = "text-white" }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="md:hidden">
      <button onClick={toggleMenu} className={`${textColor} p-2 focus:outline-none`} aria-label="Toggle menu">
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-[#2c2824] z-50 shadow-lg">
          <div className="flex flex-col p-4 space-y-4">
            <Link
              href="/"
              className={cn(
                "text-base tracking-widest hover:opacity-70 transition-opacity text-white",
                pathname === "/" ? "opacity-100" : "opacity-80",
              )}
              onClick={() => setIsOpen(false)}
            >
              HOME
            </Link>
            <Link
              href="/shop"
              className={cn(
                "text-base tracking-widest hover:opacity-70 transition-opacity text-white",
                pathname === "/shop" ? "opacity-100" : "opacity-80",
              )}
              onClick={() => setIsOpen(false)}
            >
              SHOP
            </Link>
            <Link
              href="/why-ama"
              className={cn(
                "text-base tracking-widest hover:opacity-70 transition-opacity text-white",
                pathname === "/why-ama" ? "opacity-100" : "opacity-80",
              )}
              onClick={() => setIsOpen(false)}
            >
              WHY AMA
            </Link>
            <Link
              href="/contact"
              className={cn(
                "text-base tracking-widest hover:opacity-70 transition-opacity text-white",
                pathname === "/contact" ? "opacity-100" : "opacity-80",
              )}
              onClick={() => setIsOpen(false)}
            >
              CONTACT
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
