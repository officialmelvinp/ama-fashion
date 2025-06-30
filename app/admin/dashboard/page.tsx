"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import AdminNav from "@/components/admin-nav"

type Subscriber = {
  email: string
  created_at: string
  status: string
}

export default function AdminDashboard() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      const response = await fetch("/api/admin/subscribers")
      if (response.status === 401) {
        router.push("/admin/login")
        return
      }
      const data = await response.json()
      setSubscribers(data.subscribers || [])
    } catch (error) {
      console.error("Failed to fetch subscribers:", error)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    }
    window.location.href = "/admin/login"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f3ea]">
        <div className="bg-white shadow-sm border-b mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-xl md:text-2xl font-serif text-[#2c2824]">Newsletter Subscribers</h1>
                <p className="text-sm text-[#2c2824]/60">Manage your business</p>
              </div>
              <AdminNav onLogout={logout} showBackButton={false} />
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c2824] mx-auto mb-4"></div>
            <p className="text-[#2c2824]">Loading subscribers...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f3ea]">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl md:text-2xl font-serif text-[#2c2824]">Newsletter Subscribers</h1>
              <p className="text-sm text-[#2c2824]/60">Manage your business</p>
            </div>
            <AdminNav onLogout={logout} showBackButton={false} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6 text-[#2c2824]">Newsletter Subscribers</h1>

          <div className="mb-4">
            <p className="text-[#2c2824]/70">Total active subscribers: {subscribers.length}</p>
          </div>

          {subscribers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📧</div>
              <h3 className="text-xl font-semibold text-[#2c2824] mb-2">No Subscribers Yet</h3>
              <p className="text-[#2c2824]/60 mb-6">
                When visitors sign up for your newsletter, they will appear here.
              </p>
              <div className="text-sm text-[#2c2824]/50">
                <p>You'll be able to:</p>
                <ul className="mt-2 space-y-1">
                  <li>• View all newsletter subscribers</li>
                  <li>• Export subscriber lists</li>
                  <li>• Track subscription dates</li>
                  <li>• Manage subscriber status</li>
                  <li>• Send targeted campaigns</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-[#2c2824]">Email</th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-[#2c2824]">
                      Subscribed Date
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-[#2c2824]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-[#2c2824]">{subscriber.email}</td>
                      <td className="border border-gray-300 px-4 py-2 text-[#2c2824]">
                        {new Date(subscriber.created_at).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            subscriber.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {subscriber.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex justify-between items-center">
            <Button
              onClick={fetchSubscribers}
              variant="outline"
              className="text-[#2c2824] border-[#2c2824] bg-transparent hover:bg-[#2c2824] hover:text-white"
            >
              Refresh
            </Button>

            {subscribers.length > 0 && (
              <div className="text-sm text-[#2c2824]/60">Last updated: {new Date().toLocaleTimeString()}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
