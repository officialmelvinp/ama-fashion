"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react"

interface Subscriber {
  email: string
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchSubscribers = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/subscribers")
      if (!response.ok) {
        let errorMessage = `Failed to fetch subscribers: ${response.status} ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (jsonError) {
          // If not JSON, get raw text (might be HTML)
          const errorText = await response.text()
          console.error("Server responded with non-JSON error:", errorText)
          errorMessage = `Server error: ${response.status} ${response.statusText}. Check console for details.`
        }
        throw new Error(errorMessage)
      }
      const data: Subscriber[] = await response.json()
      setSubscribers(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred while fetching subscribers.",
        variant: "destructive",
      })
      console.error("Error fetching subscribers:", error)
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  const handleDeleteSubscriber = async (email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/subscribers/${encodeURIComponent(email)}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        let errorMessage = `Failed to delete subscriber: ${response.status} ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (jsonError) {
          // If not JSON, get raw text (might be HTML)
          const errorText = await response.text()
          console.error("Server responded with non-JSON error:", errorText)
          errorMessage = `Server error: ${response.status} ${response.statusText}. Check console for details.`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        fetchSubscribers() // Re-fetch subscribers to update the list
      } else {
        throw new Error(result.error || "Failed to delete subscriber.")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred during deletion.",
        variant: "destructive",
      })
      console.error("Error deleting subscriber:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading subscribers...</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Newsletter Subscribers</CardTitle>
      </CardHeader>
      <CardContent>
        {subscribers.length === 0 ? (
          <p>No subscribers found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((subscriber) => (
                <TableRow key={subscriber.email}>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteSubscriber(subscriber.email)}
                      aria-label={`Delete subscriber ${subscriber.email}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
