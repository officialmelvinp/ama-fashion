"use client"

import { Home, LineChart, LogOut, Package, Package2, ShoppingCart, Users, Users2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { CircleUser } from "lucide-react"

interface AdminNavProps {
  onLogout: () => void
  showBackButton: boolean
}
export function AdminNav({ onLogout, showBackButton }: AdminNavProps) {
  const { toast } = useToast()
  const pathname = usePathname()
  const router = useRouter()

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
    <TooltipProvider>
      <>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Package2 className="h-5 w-5 md:hidden" />
              <span className="sr-only">Toggle Navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-[280px]">
            <SheetHeader>
              <SheetTitle>Admin Navigation</SheetTitle>
              <SheetDescription>Navigate through the admin panel to manage your store.</SheetDescription>
            </SheetHeader>
            <nav className="grid gap-6 text-lg font-medium">
              <SheetClose asChild>
                {" "}
                {/* Wrap the logo link with SheetClose */}
                <Link
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                >
                  <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">AMA Fashion</span>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                {" "}
                {/* Wrap each navigation link with SheetClose */}
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
              </SheetClose>
              <SheetClose asChild>
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
              </SheetClose>
              <SheetClose asChild>
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
              </SheetClose>
              <SheetClose asChild>
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
              </SheetClose>
              <SheetClose asChild>
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
              </SheetClose>
              <SheetClose asChild>
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
              </SheetClose>
              {/* The logout button will trigger a full page reload, so SheetClose is not strictly necessary here,
                but it's good practice to include it if the logout action itself doesn't cause a full navigation.
                However, since handleLogout does window.location.href, it's fine as is. */}
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

        <aside className="fixed left-0 top-0 hidden w-20 flex-col items-center space-y-3 border-r bg-secondary px-2 py-4 md:flex">
          <Link
            href="#"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">AMA Fashion</span>
          </Link>
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
        </aside>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href="/profile" className="w-full">
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    </TooltipProvider>
  )
}
