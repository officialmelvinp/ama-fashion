"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

interface RevenueData {
  date: string
  total_revenue: number
}

export default function AnalyticsPage() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        const response = await fetch("/api/admin/analytics")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: RevenueData[] = await response.json()
        setRevenueData(data)
      } catch (err: any) {
        setError(err.message)
        console.error("Failed to fetch analytics data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Analytics Dashboard</CardTitle>
            <CardDescription>Error loading data.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">Error: {error}</p>
            <p>Please check your database connection and API route.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Revenue Over Time</CardTitle>
          <CardDescription>Daily revenue from completed orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {revenueData.length > 0 ? (
            <ChartContainer
              config={{
                total_revenue: {
                  label: "Total Revenue",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} /> {/* Show MM-DD */}
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="total_revenue" stroke="var(--color-total_revenue)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No revenue data available.
            </div>
          )}
        </CardContent>
      </Card>
      {/* You can add more cards for other analytics here */}
    </div>
  )
}
