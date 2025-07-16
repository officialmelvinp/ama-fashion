"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SheetClose } from "@/components/ui/sheet"

interface AdminNavProps {
  onLogout: () => void
  isCollapsed?: boolean // Made optional as it's not always passed
  navItems: { href: string; icon: React.ElementType; label: string; active: boolean; badge?: number }[]
}

export function AdminNav({ onLogout, isCollapsed, navItems }: AdminNavProps) {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-gray-100/40 md:block dark:bg-gray-800/40">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold" prefetch={false}>
            <span className="text-[#2c2824] font-serif text-xl">Admin Panel</span>
          </Link>
        </div>
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-[#2c2824] ${
                pathname === item.href
                  ? "bg-gray-200 text-[#2c2824] dark:bg-gray-800 dark:text-gray-50"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              prefetch={false}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4">
          <Button onClick={onLogout} variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600">
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}

export function MobileAdminNav({ onLogout, onLinkClick, navItems }: AdminNavProps & { onLinkClick?: () => void }) {
  const pathname = usePathname()

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick()
    }
  }

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navItems.map((item) => (
        <SheetClose asChild key={item.href}>
          <Link
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-[#2c2824] ${
              pathname === item.href
                ? "bg-gray-200 text-[#2c2824] dark:bg-gray-800 dark:text-gray-50"
                : "text-gray-500 dark:text-gray-400"
            }`}
            prefetch={false}
            onClick={handleLinkClick}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        </SheetClose>
      ))}
      <SheetClose asChild>
        <Button onClick={onLogout} variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600">
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </SheetClose>
    </nav>
  )
}
