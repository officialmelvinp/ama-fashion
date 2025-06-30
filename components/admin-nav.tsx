"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Package, ShoppingCart, Users, LogOut, Home } from "lucide-react"

interface AdminNavProps {
  onLogout: () => void
  showBackButton?: boolean
}

export default function AdminNav({ onLogout, showBackButton = false }: AdminNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-4">
        {showBackButton && (
          <Link href="/admin" className="text-[#2c2824] hover:text-[#2c2824]/80 font-medium">
            ← Back to Dashboard
          </Link>
        )}
        <Link href="/admin/inventory">
          <Button variant="outline" className="text-[#2c2824] border-[#2c2824] bg-transparent">
            Manage Inventory
          </Button>
        </Link>
        <Link href="/admin/orders">
          <Button variant="outline" className="text-[#2c2824] border-[#2c2824] bg-transparent">
            View Orders
          </Button>
        </Link>
        <Button onClick={onLogout} variant="outline" className="text-[#2c2824] border-[#2c2824] bg-transparent">
          Logout
        </Button>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Button onClick={toggleMenu} variant="ghost" size="sm" className="text-[#2c2824] hover:bg-[#2c2824]/10">
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black/20 z-40" onClick={closeMenu} />
            <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300">
              <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-serif text-[#2c2824]">Admin Menu</h2>
                  <Button onClick={closeMenu} variant="ghost" size="sm" className="text-[#2c2824]">
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <nav className="space-y-4">
                  <Link
                    href="/admin"
                    onClick={closeMenu}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#f8f3ea] transition-colors"
                  >
                    <Home className="h-5 w-5 text-[#2c2824]" />
                    <span className="text-[#2c2824] font-medium">Dashboard</span>
                  </Link>

                  <Link
                    href="/admin/inventory"
                    onClick={closeMenu}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#f8f3ea] transition-colors"
                  >
                    <Package className="h-5 w-5 text-[#2c2824]" />
                    <span className="text-[#2c2824] font-medium">Manage Inventory</span>
                  </Link>

                  <Link
                    href="/admin/orders"
                    onClick={closeMenu}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#f8f3ea] transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5 text-[#2c2824]" />
                    <span className="text-[#2c2824] font-medium">View Orders</span>
                  </Link>

                  <Link
                    href="/admin/dashboard"
                    onClick={closeMenu}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#f8f3ea] transition-colors"
                  >
                    <Users className="h-5 w-5 text-[#2c2824]" />
                    <span className="text-[#2c2824] font-medium">Subscribers</span>
                  </Link>

                  <button
                    onClick={() => {
                      closeMenu()
                      onLogout()
                    }}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="h-5 w-5 text-red-600" />
                    <span className="text-red-600 font-medium">Logout</span>
                  </button>
                </nav>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
