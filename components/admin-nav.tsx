"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, Package, ShoppingCart, BarChart3, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminNavProps {
  onLogout: () => void
}

export default function AdminNav({ onLogout }: AdminNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: BarChart3,
    },
    {
      name: "Inventory Management",
      href: "/admin/inventory",
      icon: Package,
    },
    {
      name: "Orders & Payments",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-4">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant="outline"
                className={cn(
                  "text-[#2c2824] border-[#2c2824] bg-transparent hover:bg-[#2c2824] hover:text-white",
                  pathname === item.href && "bg-[#2c2824] text-white",
                )}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.name}
              </Button>
            </Link>
          )
        })}
        <Button
          onClick={onLogout}
          variant="outline"
          className="text-red-600 border-red-600 bg-transparent hover:bg-red-600 hover:text-white"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile menu button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-[#2c2824] border-[#2c2824] bg-transparent"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          <span className="ml-2">Menu</span>
        </Button>

        {/* Mobile menu overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsOpen(false)} />
            <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="text-lg font-serif text-[#2c2824]">Admin Menu</div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-[#2c2824]">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="px-4 py-6 space-y-3">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors",
                        pathname === item.href ? "bg-[#2c2824] text-white" : "text-[#2c2824] hover:bg-[#2c2824]/10",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  )
                })}
                <button
                  onClick={() => {
                    setIsOpen(false)
                    onLogout()
                  }}
                  className="flex items-center w-full px-4 py-3 text-base font-medium rounded-lg transition-colors text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
