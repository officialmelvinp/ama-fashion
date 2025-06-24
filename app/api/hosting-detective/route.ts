import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🕵️ Investigating your hosting setup...")

    const domain = "amariahco.com"
    const results = {
      domain,
      timestamp: new Date().toISOString(),
      investigations: [] as any[],
    }

    // Helper function for DNS lookups
    const checkDNS = async (name: string, type: string, testName: string) => {
      try {
        const response = await fetch(`https://dns.google/resolve?name=${name}&type=${type}`)
        const data = await response.json()

        return {
          test: testName,
          status: data.Answer ? "Found" : "Not Found",
          data: data.Answer || `No ${type} records found`,
        }
      } catch (error) {
        return {
          test: testName,
          status: "Error",
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    }

    // 1. Check MX Records (Email routing)
    const mxCheck = await checkDNS(domain, "MX", "MX Records (Email)")
    results.investigations.push(mxCheck)

    // 2. Check A Records (Main server)
    const aCheck = await checkDNS(domain, "A", "A Records (Main Server)")
    results.investigations.push(aCheck)

    // 3. Check mail subdomain
    const mailCheck = await checkDNS(`mail.${domain}`, "A", "Mail Subdomain")
    results.investigations.push(mailCheck)

    // 4. Check TXT records (SPF, DKIM, etc.)
    const txtCheck = await checkDNS(domain, "TXT", "TXT Records (SPF/DKIM)")
    results.investigations.push(txtCheck)

    // 5. Environment variables check
    results.investigations.push({
      test: "Environment Variables",
      status: "Checked",
      data: {
        EMAIL_USER: process.env.EMAIL_USER || "Not set",
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "Set (hidden)" : "Not set",
        BUSINESS_EMAIL: process.env.BUSINESS_EMAIL || "Not set",
      },
    })

    // Analyze results
    const hasEmailSetup = results.investigations.some((inv) => inv.test.includes("MX") && inv.status === "Found")

    return NextResponse.json({
      message: "Hosting investigation completed",
      results,
      summary: {
        hasEmailSetup,
        totalChecks: results.investigations.length,
        successfulChecks: results.investigations.filter((inv) => inv.status === "Found").length,
      },
      recommendations: hasEmailSetup
        ? [
            "✅ Email DNS records found!",
            "Your domain has email setup - now we need to find the right server settings",
            "Try the Email Detective next to find working SMTP settings",
          ]
        : [
            "❌ No email DNS records found",
            "1. Check your domain registrar (where you bought amariahco.com)",
            "2. Look for email hosting or MX record settings",
            "3. You may need to set up email hosting first",
            "4. Common providers: Namecheap, GoDaddy, Bluehost, SiteGround",
          ],
    })
  } catch (error) {
    console.error("Investigation error:", error)
    return NextResponse.json(
      {
        error: "Investigation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
