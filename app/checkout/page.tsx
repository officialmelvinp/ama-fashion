"use client"
import { Suspense } from "react"
import CheckoutLoading from "./loading" // Assuming you have this loading component
import CheckoutClientContent from "@/components/checkout-client-content"

interface CheckoutForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  postalCode: string
  notes: string
}

export default function CheckoutPageWrapper() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutClientContent />
    </Suspense>
  )
}
