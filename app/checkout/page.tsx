"use client"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import CheckoutLoading from "./loading"
import CheckoutClientContent from "@/components/checkout-client-content"

export default function CheckoutPageWrapper() {
  const searchParams = useSearchParams()
  const region = (searchParams.get("region") || "UAE") as "UAE" | "UK"

  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutClientContent initialRegion={region} />
    </Suspense>
  )
}
