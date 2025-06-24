"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HostingDetective() {
  const [hostingResults, setHostingResults] = useState<any>(null)
  const [emailResults, setEmailResults] = useState<any>(null)
  const [isLoadingHosting, setIsLoadingHosting] = useState(false)
  const [isLoadingEmail, setIsLoadingEmail] = useState(false)

  const investigateHosting = async () => {
    setIsLoadingHosting(true)
    try {
      const response = await fetch("/api/hosting-detective")
      const data = await response.json()
      setHostingResults(data)
    } catch (error) {
      console.error("Hosting investigation failed:", error)
    } finally {
      setIsLoadingHosting(false)
    }
  }

  const detectEmail = async () => {
    setIsLoadingEmail(true)
    try {
      const response = await fetch("/api/email-detective")
      const data = await response.json()
      setEmailResults(data)
    } catch (error) {
      console.error("Email detection failed:", error)
    } finally {
      setIsLoadingEmail(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f3ea] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif text-[#2c2824] mb-8">🕵️ Hosting & Email Detective</h1>
        <p className="text-lg text-[#2c2824] mb-8">
          Let's figure out where your domain is hosted and what email system you're actually using!
        </p>

        <div className="grid gap-6">
          {/* Hosting Investigation */}
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Investigate Your Hosting Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={investigateHosting} disabled={isLoadingHosting} className="mb-4">
                {isLoadingHosting ? "Investigating..." : "🔍 Investigate Hosting"}
              </Button>

              {hostingResults && (
                <div className="space-y-4">
                  <div className="bg-gray-100 p-4 rounded">
                    <h3 className="font-semibold mb-2">Domain: {hostingResults.results.domain}</h3>
                  </div>

                  {hostingResults.results.investigations.map((investigation: any, index: number) => (
                    <div key={index} className="border p-3 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{investigation.test}</span>
                        <span className={investigation.status === "Found" ? "text-green-600" : "text-red-600"}>
                          {investigation.status}
                        </span>
                      </div>
                      {investigation.data && (
                        <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(investigation.data, null, 2)}
                        </pre>
                      )}
                      {investigation.error && <p className="text-sm text-red-600">{investigation.error}</p>}
                    </div>
                  ))}

                  <div className="bg-blue-50 p-4 rounded">
                    <h3 className="font-semibold mb-2">Recommendations:</h3>
                    <ul className="text-sm space-y-1">
                      {hostingResults.results.recommendations.map((rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Detection */}
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Detect Your Email Server</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={detectEmail} disabled={isLoadingEmail} className="mb-4">
                {isLoadingEmail ? "Detecting..." : "🔍 Detect Email Server"}
              </Button>

              {emailResults && (
                <div className="space-y-4">
                  <div className="bg-gray-100 p-4 rounded">
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <p>Tested: {emailResults.summary.total} configurations</p>
                    <p>Successful: {emailResults.summary.successful}</p>
                    <p>Failed: {emailResults.summary.failed}</p>
                  </div>

                  {emailResults.workingConfigs.length > 0 && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded">
                      <h3 className="font-semibold text-green-800 mb-2">✅ Working Email Servers Found!</h3>
                      {emailResults.workingConfigs.map((config: any, index: number) => (
                        <div key={index} className="bg-white p-3 rounded mb-2">
                          <p className="font-medium">{config.name}</p>
                          <p className="text-sm text-gray-600">
                            {config.host}:{config.port} ({config.duration})
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="font-semibold">All Test Results:</h3>
                    {emailResults.results.map((result: any, index: number) => (
                      <div key={index} className="border p-3 rounded">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{result.name}</span>
                          <span className={result.status.includes("SUCCESS") ? "text-green-600" : "text-red-600"}>
                            {result.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {result.host}:{result.port} ({result.duration})
                        </p>
                        {result.error && <p className="text-sm text-red-600 mt-1">{result.error}</p>}
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 p-4 rounded">
                    <h3 className="font-semibold mb-2">Next Steps:</h3>
                    <ul className="text-sm space-y-1">
                      {emailResults.nextSteps.map((step: string, index: number) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Investigation Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Manual Investigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">🤔 Where did you buy amariahco.com?</h3>
                  <p className="text-sm text-gray-600 mb-2">Common domain registrars:</p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Namecheap</li>
                    <li>• GoDaddy</li>
                    <li>• Google Domains</li>
                    <li>• Cloudflare</li>
                    <li>• Domain.com</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">🌐 Where is your website hosted?</h3>
                  <p className="text-sm text-gray-600 mb-2">Common hosting providers:</p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Vercel (your current site)</li>
                    <li>• Bluehost</li>
                    <li>• SiteGround</li>
                    <li>• Hostinger</li>
                    <li>• Same as domain registrar</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">📧 Do you have email hosting?</h3>
                  <p className="text-sm text-gray-600">
                    Check if you've set up email hosting separately or if it comes with your domain/hosting package.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
