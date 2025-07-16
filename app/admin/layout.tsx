import type React from "react"
import { AdminNav } from "@/components/admin-nav"

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminNav showBackButton={false}>{children}</AdminNav>
}
