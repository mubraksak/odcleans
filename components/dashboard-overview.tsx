"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface DashboardData {
  metrics: {
    requestsThisWeek: number
    totalRevenue: number
    upcomingCleanings: number
  }
  recentQuotes: any[]
  statusStats: any[]
}

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/admin/dashboard")
        if (response.ok) {
          const dashboardData = await response.json()
          setData(dashboardData)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return <div>Failed to load dashboard data</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "quoted":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200"
      case "declined":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Requests This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{data.metrics.requestsThisWeek}</div>
            <p className="text-xs text-muted-foreground">New quote requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">${data.metrics.totalRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">From accepted quotes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Cleanings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{data.metrics.upcomingCleanings}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-primary">Quote Status Distribution</CardTitle>
          <CardDescription>Current status of all quote requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {data.statusStats.map((stat) => (
              <div key={stat.status} className="flex items-center gap-2">
                <Badge className={getStatusColor(stat.status)}>
                  {stat.status.charAt(0).toUpperCase() + stat.status.slice(1)}
                </Badge>
                <span className="text-sm font-medium">{stat.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-primary">Recent Quote Requests</CardTitle>
          <CardDescription>Latest activity from customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentQuotes.slice(0, 5).map((quote) => (
              <div key={quote.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-primary">{quote.user_name}</p>
                    <Badge className={getStatusColor(quote.status)} variant="secondary">
                      {quote.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {quote.cleaning_type.replace("_", " ")} • {quote.property_type} • {quote.rooms} rooms
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">#{quote.id.toString().padStart(6, "0")}</p>
                  <p className="text-xs text-muted-foreground">{new Date(quote.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
