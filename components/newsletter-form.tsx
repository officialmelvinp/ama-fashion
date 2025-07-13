"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast" // Import the useToast hook

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false) // Use isSubmitting for loading state
  const { toast } = useToast() // Initialize useToast hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true) // Set loading state

    // Basic email validation
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/subscribe", {
        // Changed API endpoint to /api/subscribe
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Subscribed!",
          description: data.message,
          variant: "success",
        })
        setEmail("") // Clear the input
      } else {
        toast({
          title: "Subscription Failed",
          description: data.error || "Something went wrong.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error)
      toast({
        title: "Error",
        description: "Could not connect to the server. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false) // Reset loading state
    }
  }

  return (
    <div className="max-w-md mx-auto text-center">
      {" "}
      {/* Added text-center for consistent alignment */}
      <h2 className="text-2xl md:text-3xl font-serif text-[#2c2824] mb-4">Join Our Newsletter</h2>{" "}
      {/* Updated text and styling */}
      <p className="text-[#2c2824]/80 mb-6">Stay updated with our latest collections, exclusive offers, and stories.</p>{" "}
      {/* Updated text and styling */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div suppressHydrationWarning>
          {" "}
          {/* ADDED suppressHydrationWarning HERE */}
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c2824] focus:border-transparent" // Updated styling
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting} // Disable button while submitting
          className="w-full bg-[#2c2824] text-white hover:bg-[#2c2824]/90 py-2 text-base" // Updated styling
        >
          {isSubmitting ? "Subscribing..." : "Subscribe"} {/* Dynamic button text */}
        </Button>
        {/* Removed error and message paragraphs, as useToast handles notifications */}
      </form>
    </div>
  )
}
