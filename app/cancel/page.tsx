"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header" 

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-[#f8f3ea]">
      {/* Navigation Header */}
      <Header bgColor="bg-white/90 backdrop-blur-sm" textColor="text-[#2c2824]" />
      <div className="container mx-auto py-12 px-4 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="max-w-2xl mx-auto text-center">
          {/* Cancel Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#2c2824] mb-4">Payment Cancelled</h1>
          <p className="text-lg text-[#2c2824]/80 mb-8">
            Your payment was not completed. If you encountered an issue, please try again or contact support.
          </p>
          <div className="space-y-4">
            <Link href="/shop">
              <Button className="w-full bg-[#2c2824] text-white hover:bg-[#2c2824]/90 py-3 text-lg">
                Return to Shop
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="w-full py-3 text-lg bg-transparent">
                Contact Support
              </Button>
            </Link>
          </div>
          <div className="mt-12 text-center">
            <p className="text-sm text-[#2c2824]/60 italic">
              &ldquo;Every thread a prayer. Every silhouette, a sanctuary.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
