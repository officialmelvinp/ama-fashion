"use client"

import type * as React from "react"
import { useState, Suspense } from "react" // Import useState
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  Home,
  LineChart,
  Package,
  Package2,
  ShoppingCart,
  Search,
  CircleUser,
  Users,
  LogOut,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AdminNav } from "@/components/admin-nav"
import { useToast } from "@/hooks/use-toast"
import { TooltipProvider } from "@/components/ui/tooltip" // Moved TooltipProvider here

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [openMobileSheet, setOpenMobileSheet] = useState(false) // State to control mobile sheet

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" })
      if (response.ok) {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        })
        router.push("/admin/login") // Redirect to login page
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Logout failed")
      }
    } catch (error: any) {
      console.error("Logout error:", error)
      toast({
        title: "Logout Failed",
        description: error.message || "An unexpected error occurred during logout.",
        variant: "destructive",
      })
    }
  }

  const navItems = [
    {
      href: "/admin",
      icon: Home,
      label: "Dashboard",
      active: pathname === "/admin" || pathname === "/admin/dashboard",
    },
    {
      href: "/admin/orders",
      icon: ShoppingCart,
      label: "Orders",
      active: pathname.startsWith("/admin/orders"),
      badge: 6,
    },
    { href: "/admin/inventory", icon: Package, label: "Inventory", active: pathname.startsWith("/admin/inventory") },
    {
      href: "/admin/subscribers",
      icon: Users,
      label: "Subscribers",
      active: pathname.startsWith("/admin/subscribers"),
    },
    { href: "/admin/analytics", icon: LineChart, label: "Analytics", active: pathname.startsWith("/admin/analytics") },
  ]

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TooltipProvider>
        {" "}
        {/* TooltipProvider wraps the entire layout */}
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          {/* Desktop Sidebar */}
          <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <Package2 className="h-6 w-6" />
                  <span className="">AMA Fashion</span>
                </Link>
                <Button variant="outline" size="icon" className="ml-auto h-8 w-8 bg-transparent">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Toggle notifications</span>
                </Button>
              </div>
              <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                  <AdminNav navItems={navItems} isCollapsed={false} />
                </nav>
              </div>
              <div className="mt-auto p-4">
                <Card>
                  <CardHeader className="p-2 pt-0 md:p-4">
                    <CardTitle>Upgrade to Pro</CardTitle>
                    <CardDescription>Unlock all features and get unlimited access to our support team.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2 pt-0 md:p-4">
                    <Button size="sm" className="w-full">
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col">
            {/* Top Header for Mobile and Desktop */}
            <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
              {/* Mobile Sheet Trigger */}
              <Sheet open={openMobileSheet} onOpenChange={setOpenMobileSheet}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex flex-col">
                  {" "}
                  {/* Changed to right */}
                  <nav className="grid gap-2 text-lg font-medium">
                    <Link href="#" className="flex items-center gap-2 text-lg font-semibold">
                      <Package2 className="h-6 w-6" />
                      <span className="sr-only">AMA Fashion</span>
                    </Link>
                    <AdminNav
                      navItems={navItems}
                      isCollapsed={false}
                      onLinkClick={() => setOpenMobileSheet(false)} // Close sheet on link click
                    />
                  </nav>
                  <div className="mt-auto">
                    <Button variant="secondary" className="w-full" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Search Input */}
              <div className="w-full flex-1">
                <form>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search products..."
                      className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                    />
                  </div>
                </form>
              </div>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                    <CircleUser className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>

            {/* Page Content */}
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
          </div>
        </div>
      </TooltipProvider>
    </Suspense>
  )
}
