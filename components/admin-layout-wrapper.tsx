"use client"
import Link from "next/link"
import type React from "react"

import { usePathname } from "next/navigation"
import {
  Package2,
  Home,
  ShoppingCart,
  Package,
  Users,
  LineChart,
  Settings,
  LogOut,
  Users2,
  CircleUser,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface AdminLayoutWrapperProps {
  children: React.ReactNode
}

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const pathname = usePathname()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" })
      if (response.ok) {
        window.location.href = "/admin/login"
      } else {
        toast({
          title: "Logout Failed",
          description: "Could not log out. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Fixed Sidebar (Desktop) */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="#"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">AMA Fashion</span>
          </Link>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/dashboard"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8",
                    pathname === "/admin/dashboard" || pathname === "/admin"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Dashboard</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Dashboard</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/orders"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8",
                    pathname === "/admin/orders" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Orders</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Orders</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/inventory"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8",
                    pathname === "/admin/inventory" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <Package className="h-5 w-5" />
                  <span className="sr-only">Inventory</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Inventory</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/subscribers"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8",
                    pathname === "/admin/subscribers" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <Users className="h-5 w-5" />
                  <span className="sr-only">Subscribers</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Subscribers</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/customers"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8",
                    pathname === "/admin/customers" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <Users2 className="h-5 w-5" />
                  <span className="sr-only">Customers</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Customers</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/analytics"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8",
                    pathname === "/admin/analytics" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <LineChart className="h-5 w-5" />
                  <span className="sr-only">Analytics</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Analytics</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/settings"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8",
                    pathname === "/admin/settings" ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 sm:pl-14 bg-muted/40">
        {" "}
        {/* This div now handles the padding for the fixed sidebar */}
        {/* Top Header (Mobile & Desktop) */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden bg-transparent">
                <Package2 className="h-5 w-5" />
                <span className="sr-only">Toggle Navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                >
                  <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">AMA Fashion</span>
                </Link>
                <Link
                  href="/admin/dashboard"
                  className={cn(
                    "flex items-center gap-4 px-2.5",
                    pathname === "/admin/dashboard" || pathname === "/admin"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/admin/orders"
                  className={cn(
                    "flex items-center gap-4 px-2.5",
                    pathname === "/admin/orders" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Orders
                </Link>
                <Link
                  href="/admin/inventory"
                  className={cn(
                    "flex items-center gap-4 px-2.5",
                    pathname === "/admin/inventory" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Package className="h-5 w-5" />
                  Inventory
                </Link>
                <Link
                  href="/admin/subscribers"
                  className={cn(
                    "flex items-center gap-4 px-2.5",
                    pathname === "/admin/subscribers"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Users className="h-5 w-5" />
                  Subscribers
                </Link>
                <Link
                  href="/admin/customers"
                  className={cn(
                    "flex items-center gap-4 px-2.5",
                    pathname === "/admin/customers" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Users2 className="h-5 w-5" />
                  Customers
                </Link>
                <Link
                  href="/admin/analytics"
                  className={cn(
                    "flex items-center gap-4 px-2.5",
                    pathname === "/admin/analytics" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <LineChart className="h-5 w-5" />
                  Analytics
                </Link>
                <Link
                  href="/admin/settings"
                  className={cn(
                    "flex items-center gap-4 px-2.5",
                    pathname === "/admin/settings" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
                <Button
                  variant="ghost"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="relative ml-auto flex-1 md:grow-0">{/* Search functionality can go here if needed */}</div>
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
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="max-w-7xl mx-auto">
            {" "}
            {/* This div will center the content within the main area */}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
