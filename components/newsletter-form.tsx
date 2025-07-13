"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError("")

    // Basic email validation
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.")
      return
    }

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)
        setEmail("")     // Clear the input
        setError("")     // Clear any previous errors
      } else {
        setError(result.error || "Something went wrong. Please try again.")
        setMessage("")   // Clear any previous success messages
      }
    } catch (err: any) {
      setError("Something went wrong. Please try again.")
      setMessage("")     // Clear any previous success messages
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="font-serif text-3xl mb-4">Join Our Manifestation</h2>
      <p className="mb-6 opacity-80">
        Be the first to know about new collections, exclusive offers, and spiritually-rooted content.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-white/10 border-white/20 text-white placeholder-white/60"
          />
        </div>
        <Button className="w-full" type="submit">
          Subscribe
        </Button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {message && <p className="text-green-400 text-sm">{message}</p>}
      </form>
    </div>
  )
}
