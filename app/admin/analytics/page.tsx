"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group" // Import ToggleGroup

interface RevenueData {
  date: string
  total_revenue: number
}

interface TopProductData {
  product_display_name: string
  total_quantity_sold: number
  total_revenue_generated: number
}

export default function AnalyticsPage() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [topProductsData, setTopProductsData] = useState<TopProductData[]>([])
  const [loadingRevenue, setLoadingRevenue] = useState(true)
  const [loadingTopProducts, setLoadingTopProducts] = useState(true)
  const [errorRevenue, setErrorRevenue] = useState<string | null>(null)
  const [errorTopProducts, setErrorTopProducts] = useState<string | null>(null)
  const [revenuePeriod, setRevenuePeriod] = useState<"daily" | "weekly" | "monthly">("daily")

  useEffect(() => {
    async function fetchRevenueData() {
      setLoadingRevenue(true)
      setErrorRevenue(null)
      try {
        const response = await fetch(`/api/admin/analytics?type=revenue&period=${revenuePeriod}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: RevenueData[] = await response.json()
        setRevenueData(data)
      } catch (err: any) {
        setErrorRevenue(err.message)
        console.error("Failed to fetch revenue data:", err)
      } finally {
        setLoadingRevenue(false)
      }
    }
    fetchRevenueData()
  }, [revenuePeriod])

  useEffect(() => {
    async function fetchTopProductsData() {
      setLoadingTopProducts(true)
      setErrorTopProducts(null)
      try {
        const response = await fetch("/api/admin/analytics?type=top-products")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: TopProductData[] = await response.json()
        setTopProductsData(data)
      } catch (err: any) {
        setErrorTopProducts(err.message)
        console.error("Failed to fetch top products data:", err)
      } finally {
        setLoadingTopProducts(false)
      }
    }
    fetchTopProductsData()
  }, [])

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Total Revenue Over Time</CardTitle>
            <CardDescription>Revenue from completed orders.</CardDescription>
          </div>
          <ToggleGroup
            type="single"
            value={revenuePeriod}
            onValueChange={(value: "daily" | "weekly" | "monthly") => {
              if (value) setRevenuePeriod(value)
            }}
            className="gap-1"
          >
            <ToggleGroupItem value="daily" aria-label="Toggle daily">
              Daily
            </ToggleGroupItem>
            <ToggleGroupItem value="weekly" aria-label="Toggle weekly">
              Weekly
            </ToggleGroupItem>
            <ToggleGroupItem value="monthly" aria-label="Toggle monthly">
              Monthly
            </ToggleGroupItem>
          </ToggleGroup>
        </CardHeader>
        <CardContent>
          {loadingRevenue ? (
            <Skeleton className="h-[300px] w-full" />
          ) : errorRevenue ? (
            <div className="flex h-[300px] flex-col items-center justify-center text-red-500">
              <p>Error: {errorRevenue}</p>
              <p>Please check your database connection and API route.</p>
            </div>
          ) : revenueData.length > 0 ? (
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
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      if (revenuePeriod === "monthly") {
                        return value // YYYY-MM
                      }
                      return value.slice(5) // MM-DD for daily/weekly
                    }}
                  />
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

      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Top 5 products by quantity sold.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTopProducts ? (
            <Skeleton className="h-[300px] w-full" />
          ) : errorTopProducts ? (
            <div className="flex h-[300px] flex-col items-center justify-center text-red-500">
              <p>Error: {errorTopProducts}</p>
              <p>Please check your database connection and API route.</p>
            </div>
          ) : topProductsData.length > 0 ? (
            <ChartContainer
              config={{
                total_quantity_sold: {
                  label: "Quantity Sold",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `${value}`} />
                  <YAxis type="category" dataKey="product_display_name" width={120} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total_quantity_sold" fill="var(--color-total_quantity_sold)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No top selling products data available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
