"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminIndex() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page
    router.push("/admin/login")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f3ea]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c2824] mx-auto mb-4"></div>
        <p className="text-[#2c2824]">Redirecting to admin login...</p>
      </div>
    </div>
  )
}
