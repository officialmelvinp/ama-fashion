"use client"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface RevenueData {
  date: string
  total_revenue: number
}

interface TopProductData {
  product_display_name: string
  total_quantity_sold: number
  total_revenue_generated: number
}

interface SubscriberGrowthData {
  month: string
  subscribers: number
}

// Define colors for the Pie Chart (though not used in this specific page, kept for consistency if needed elsewhere)
const PIE_CHART_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function AdminAnalyticsPage() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [topProductsData, setTopProductsData] = useState<TopProductData[]>([])
  const [subscriberGrowthData, setSubscriberGrowthData] = useState<SubscriberGrowthData[]>([])
  const [loadingRevenue, setLoadingRevenue] = useState(true)
  const [loadingTopProducts, setLoadingTopProducts] = useState(true)
  const [loadingSubscriberGrowth, setLoadingSubscriberGrowth] = useState(true)
  const [errorRevenue, setErrorRevenue] = useState<string | null>(null)
  const [errorTopProducts, setErrorTopProducts] = useState<string | null>(null)
  const [errorSubscriberGrowth, setErrorSubscriberGrowth] = useState<string | null>(null)
  const [revenuePeriod, setRevenuePeriod] = useState<"daily" | "weekly" | "monthly">("daily")
  const { toast } = useToast()

  const fetchRevenueData = useCallback(async () => {
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
      toast({
        title: "Error",
        description: `Failed to fetch revenue data: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setLoadingRevenue(false)
    }
  }, [revenuePeriod, toast])

  const fetchTopProductsData = useCallback(async () => {
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
      toast({
        title: "Error",
        description: `Failed to fetch top products data: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setLoadingTopProducts(false)
    }
  }, [toast])

  const fetchSubscriberGrowthData = useCallback(async () => {
    setLoadingSubscriberGrowth(true)
    setErrorSubscriberGrowth(null)
    try {
      const response = await fetch("/api/admin/analytics?type=subscriber-growth")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: SubscriberGrowthData[] = await response.json()
      setSubscriberGrowthData(data)
    } catch (err: any) {
      setErrorSubscriberGrowth(err.message)
      console.error("Failed to fetch subscriber growth data:", err)
      toast({
        title: "Error",
        description: `Failed to fetch subscriber growth data: ${err.message}`,
        variant: "destructive",
      })
    } finally {
      setLoadingSubscriberGrowth(false)
    }
  }, [toast])

  useEffect(() => {
    fetchRevenueData()
  }, [fetchRevenueData])

  useEffect(() => {
    fetchTopProductsData()
  }, [fetchTopProductsData])

  useEffect(() => {
    fetchSubscriberGrowthData()
  }, [fetchSubscriberGrowthData])

  const renderLoadingState = () => (
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
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    </div>
  )

  const renderErrorState = (errorMessage: string) => (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>Error loading data.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {errorMessage}</p>
          <p>Please check your database connection and API route.</p>
        </CardContent>
      </Card>
    </div>
  )

  if (loadingRevenue || loadingTopProducts || loadingSubscriberGrowth) {
    return renderLoadingState()
  }

  if (errorRevenue || errorTopProducts || errorSubscriberGrowth) {
    return renderErrorState(errorRevenue || errorTopProducts || errorSubscriberGrowth || "An unknown error occurred.")
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="mb-6 text-3xl font-bold text-[#2c2824]">Analytics Overview</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Total Revenue Over Time Chart */}
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
        {/* Top Selling Products Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Top 5 products by quantity sold from completed orders.</CardDescription>
          </CardHeader>
          <CardContent>
            {topProductsData.length > 0 ? (
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
        {/* Subscriber Growth Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Subscriber Growth</CardTitle>
            <CardDescription>Monthly growth of newsletter subscribers.</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriberGrowthData.length > 0 ? (
              <ChartContainer
                config={{
                  subscribers: {
                    label: "Subscribers",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={subscriberGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="subscribers" stroke="var(--color-subscribers)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No subscriber growth data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
