"use client"

import { useState } from "react"
import { Dialog } from "@headlessui/react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/config/site"
import { useCart } from "@/hooks/use-cart"
import { ShoppingCart } from "lucide-react"

interface MobileNavProps {
  textColor?: string
}

export function MobileNav({ textColor = "text-white" }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const { getTotalItems } = useCart()
  const totalCartItems = getTotalItems()

  return (
    <>
      <button
        type="button"
        className={`-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 ${textColor}`}
        onClick={() => setIsOpen(true)}
      >
        <span className="sr-only">Open main menu</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>
      <Dialog as="div" className="lg:hidden" open={isOpen} onClose={setIsOpen}>
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-black px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-bold text-white">
              {siteConfig.name}
            </Link>
            <button type="button" className="-m-2.5 rounded-md p-2.5 text-white" onClick={() => setIsOpen(false)}>
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-white/25">
              <div className="flex flex-col p-4 space-y-4">
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
                  href="/products"
                  className={cn(
                    `text-base tracking-widest hover:opacity-70 transition-opacity text-white`,
                    pathname === "/products" ? "opacity-100" : "opacity-80",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Products
                </Link>
                <Link
                  href="/cart"
                  className={cn(
                    `relative text-base tracking-widest hover:opacity-70 transition-opacity text-white`,
                    pathname === "/cart" ? "opacity-100" : "opacity-80",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <ShoppingCart className="h-6 w-6" />
                  {totalCartItems > 0 && (
                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                      {totalCartItems}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  )
}
