"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SimpleEmailTest() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [contactResult, setContactResult] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testEmail, setTestEmail] = useState("test@example.com")

  const runQuickTest = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/email-diagnostic")
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({ error: "Test failed" })
    } finally {
      setIsLoading(false)
    }
  }

  const testContactForm = async () => {
    setIsSubmitting(true)
    setContactResult(null)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: testEmail,
          phone: "+971501234567",
          subject: "Email Test",
          message: "This is a test message to verify email functionality after MX record fix.",
          region: "UAE",
        }),
      })

      const data = await response.json()
      setContactResult(data)
    } catch (error) {
      setContactResult({ success: false, error: "Network error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f3ea] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif text-[#2c2824] mb-8">AMA Email Test - Post MX Fix</h1>

        <div className="grid gap-6">
          {/* Quick Diagnostic */}
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Check Email Server Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={runQuickTest} disabled={isLoading} className="mb-4">
                {isLoading ? "Testing Connection..." : "Test Email Server"}
              </Button>

              {testResult && (
                <div className="space-y-2">
                  {testResult.tests?.map((test: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded border ${
                        test.status.includes("SUCCESS") ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{test.name}</span>
                        <span className={test.status.includes("SUCCESS") ? "text-green-600" : "text-red-600"}>
                          {test.status}
                        </span>
                      </div>
                      {test.error && <p className="text-sm text-red-600 mt-1">{test.error}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Form Test */}
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Test Contact Form Email</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="testEmail">Test Email Address</Label>
                  <Input
                    id="testEmail"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                </div>

                <Button onClick={testContactForm} disabled={isSubmitting}>
                  {isSubmitting ? "Sending Test Email..." : "Send Test Contact Form"}
                </Button>

                {contactResult && (
                  <div
                    className={`p-4 rounded ${
                      contactResult.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {contactResult.success ? (
                      <div>
                        <h3 className="font-semibold"> Email Sent Successfully!</h3>
                        <p className="text-sm mt-1">Check your support@amariahco.com inbox</p>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-semibold"> Email Failed</h3>
                        <p className="text-sm mt-1">{contactResult.error}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Webmail Test */}
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Test Webmail Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Try logging into your webmail to verify the email account is working:
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => window.open("https://webmail.amariahco.com", "_blank")}
                  variant="outline"
                  className="w-full"
                >
                  🌐 Open Webmail (webmail.amariahco.com)
                </Button>
                <Button
                  onClick={() => window.open("https://amariahco.com/webmail", "_blank")}
                  variant="outline"
                  className="w-full"
                >
                  🌐 Alternative Webmail (amariahco.com/webmail)
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Login with: support@amariahco.com and your email password</p>
            </CardContent>
          </Card>

          {/* Status Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600"></span>
                  <span>MX Record Added (amariahco.com → amariahco.com)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600"></span>
                  <span>SPF Record Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600"></span>
                  <span>DKIM Record Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600"></span>
                  <span>Email Infrastructure (webmail, mail server)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600"></span>
                  <span>DNS Propagation (may take 15-30 minutes)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
