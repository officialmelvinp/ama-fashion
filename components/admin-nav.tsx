"use client"

import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  active: boolean
  badge?: number
}

interface AdminNavProps {
  navItems: NavItem[]
  isCollapsed: boolean // True for desktop sidebar (icon-only), false for mobile sheet or expanded desktop
  onLinkClick?: () => void // Optional callback for mobile sheet to close on link click
}

export function AdminNav({ navItems, isCollapsed, onLinkClick }: AdminNavProps) {
  return (
    <TooltipProvider>
      {navItems.map((item) => (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                item.active && "bg-muted text-primary",
                isCollapsed && "h-9 w-9 items-center justify-center", // Styles for collapsed sidebar icons
              )}
              onClick={onLinkClick}
            >
              <item.icon className={cn("h-4 w-4", isCollapsed && "h-5 w-5")} />
              {!isCollapsed && (
                <>
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              <span className="sr-only">{item.label}</span>
            </Link>
          </TooltipTrigger>
          {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
        </Tooltip>
      ))}
    </TooltipProvider>
  )
}
