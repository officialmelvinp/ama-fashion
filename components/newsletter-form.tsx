"use client"

import type React from "react"

import { useState } from "react"

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setStatus("Please enter an email address!")
      return
    }

    setIsLoading(true)
    setStatus("Subscribing...")

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("Success! Check your email for a welcome message.")
        setEmail("")
      } else {
        setStatus(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("Newsletter error:", error)
      setStatus("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-2xl font-serif mb-2 text-center text-white">Stay Rooted. Sign Up.</h3>
      <p className="text-sm mb-6 text-center opacity-80 text-white">Receive stories stitched in spirit, not spam.</p>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3">
          <input
            id="newsletter-email"
            name="email"
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-md border border-white/30 bg-white/10 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-white text-[#2c2824] rounded-md hover:bg-white/90 font-medium disabled:opacity-50"
          >
            {isLoading ? "Subscribing..." : "Subscribe"}
          </button>
        </div>
      </form>

      {status && <div className="mt-4 p-3 rounded-md bg-white/10 text-white text-sm text-center">{status}</div>}
    </div>
  )
}
