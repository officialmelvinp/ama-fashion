"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    region: "UAE",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage("")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitMessage(
          result.message || "Thank you! Your message has been sent successfully. We'll get back to you soon.",
        )
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          region: "UAE",
        })
      } else {
        setSubmitMessage(result.error || "Something went wrong. Please try again or contact us directly.")
      }
    } catch (error) {
      console.error("Form submission error:", error)
      setSubmitMessage("Something went wrong. Please try again or contact us directly via email or WhatsApp.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1"
            placeholder="Your full name"
          />
        </div>
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="mt-1"
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            className="mt-1"
            placeholder="+971 50 123 4567"
          />
        </div>
        <div>
          <Label htmlFor="region">Your Region *</Label>
          <select
            id="region"
            name="region"
            value={formData.region}
            onChange={handleInputChange}
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2c2824] focus:border-[#2c2824]"
          >
            <option value="UAE">🇦🇪 UAE</option>
            <option value="UK">🇬🇧 UK</option>
            <option value="Other">🌍 Other</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="subject">Subject *</Label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          required
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2c2824] focus:border-[#2c2824]"
        >
          <option value="">Select a subject</option>
          <option value="Custom Order">Custom Order Inquiry</option>
          <option value="Styling Consultation">Styling Consultation</option>
          <option value="Product Question">Product Question</option>
          <option value="Shipping & Delivery">Shipping & Delivery</option>
          <option value="Wholesale Inquiry">Wholesale Inquiry</option>
          <option value="Press & Media">Press & Media</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          required
          className="mt-1"
          rows={5}
          placeholder="Tell us about your inquiry, preferred styles, sizing needs, or any questions you have about our African fashion collections..."
        />
      </div>

      {submitMessage && (
        <div
          className={`p-4 rounded-lg ${submitMessage.includes("Thank you") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
        >
          {submitMessage}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#2c2824] text-white hover:bg-[#2c2824]/90 py-3"
      >
        {isSubmitting ? "Sending Message..." : "Send Message"}
      </Button>

      <p className="text-sm text-[#2c2824] opacity-60 text-center">
        Your message will be sent directly to our email. We typically respond within 24 hours.
      </p>
    </form>
  )
}
