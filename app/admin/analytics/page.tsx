"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface RevenueData {
  date: string
  total_revenue: number
}

interface TopProductData {
  product_display_name: string
  total_quantity_sold: number
  total_revenue_generated: number
}

export default function AdminAnalyticsPage() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [topProductsData, setTopProductsData] = useState<TopProductData[]>([])
  const [revenuePeriod, setRevenuePeriod] = useState<"daily" | "weekly" | "monthly">("daily")
  const [loadingRevenue, setLoadingRevenue] = useState(true)
  const [loadingTopProducts, setLoadingTopProducts] = useState(true)
  const [errorRevenue, setErrorRevenue] = useState<string | null>(null)
  const [errorTopProducts, setErrorTopProducts] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const fetchRevenueData = useCallback(
    async (period: "daily" | "weekly" | "monthly") => {
      setLoadingRevenue(true)
      setErrorRevenue(null)
      try {
        const response = await fetch(`/api/admin/analytics?type=revenue&period=${period}`)
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/admin/login")
            return
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: RevenueData[] = await response.json()
        setRevenueData(data)
        console.log("Fetched revenue data:", data)
      } catch (error: any) {
        console.error("Failed to fetch revenue data:", error)
        setErrorRevenue(`Failed to fetch revenue data: ${error.message}`)
        toast({
          title: "Error",
          description: `Failed to fetch revenue data: ${error.message}`,
          variant: "destructive",
        })
      } finally {
        setLoadingRevenue(false)
      }
    },
    [toast, router],
  )

  const fetchTopProductsData = useCallback(async () => {
    setLoadingTopProducts(true)
    setErrorTopProducts(null)
    try {
      const response = await fetch("/api/admin/analytics?type=top-products")
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/admin/login")
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: TopProductData[] = await response.json()
      setTopProductsData(data)
      console.log("Fetched top products data:", data)
    } catch (error: any) {
      console.error("Failed to fetch top products data:", error)
      setErrorTopProducts(`Failed to fetch top products data: ${error.message}`)
      toast({
        title: "Error",
        description: `Failed to fetch top products data: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoadingTopProducts(false)
    }
  }, [toast, router])

  useEffect(() => {
    fetchRevenueData(revenuePeriod)
  }, [fetchRevenueData, revenuePeriod])

  useEffect(() => {
    fetchTopProductsData()
  }, [fetchTopProductsData])

  console.log("Analytics Page Render - Revenue Data:", revenueData.length, "Top Products Data:", topProductsData.length)

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

  const renderErrorStateFullPage = (errorMessage: string) => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-red-500 text-lg">
      <XCircle className="h-16 w-16 mb-4" />
      <p>Error loading analytics data: {errorMessage}</p>
      <p className="text-base text-gray-600 mt-2">Please check your API routes and database connection.</p>
      <Button
        onClick={() => {
          fetchRevenueData(revenuePeriod)
          fetchTopProductsData()
        }}
        className="mt-4"
      >
        Retry All
      </Button>
    </div>
  )

  if (loadingRevenue || loadingTopProducts) {
    return renderLoadingState()
  }

  if (errorRevenue || errorTopProducts) {
    return renderErrorStateFullPage(errorRevenue || errorTopProducts || "An unknown error occurred.")
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

      {/* Revenue Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <ToggleGroup
            type="single"
            value={revenuePeriod}
            onValueChange={(value: "daily" | "weekly" | "monthly") => {
              if (value) setRevenuePeriod(value)
            }}
            className="flex"
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
          {revenueData.length === 0 ? (
            <div className="text-gray-500 text-center py-10">No revenue data available for this period.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Revenue (AED)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell>{data.date}</TableCell>
                      <TableCell className="text-right">{data.total_revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Products Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Products by Quantity Sold</CardTitle>
        </CardHeader>
        <CardContent>
          {topProductsData.length === 0 ? (
            <div className="text-gray-500 text-center py-10">No top products data available.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead className="text-right">Quantity Sold</TableHead>
                    <TableHead className="text-right">Revenue Generated (AED)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProductsData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{data.product_display_name}</TableCell>
                      <TableCell className="text-right">{data.total_quantity_sold}</TableCell>
                      <TableCell className="text-right">{data.total_revenue_generated.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
