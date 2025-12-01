"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PerformanceStats {
  totalJobs: number
  completedJobs: number
  completionRate: number
  averageRating: number
  totalEarnings: number
  monthlyEarnings: number
  responseTime: number
}

export function CleanerPerformance() {
  const [stats, setStats] = useState<PerformanceStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPerformanceStats()
  }, [])

  const fetchPerformanceStats = async () => {
    try {
      // This would typically come from an API
      // For now, we'll simulate data
      const mockStats: PerformanceStats = {
        totalJobs: 24,
        completedJobs: 22,
        completionRate: 91.7,
        averageRating: 4.8,
        totalEarnings: 2850,
        monthlyEarnings: 650,
        responseTime: 2.3 // hours
      }
      
      setStats(mockStats)
    } catch (error) {
      console.error("Error fetching performance stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-muted rounded"></div>
        <div className="h-32 bg-muted rounded"></div>
      </div>
    )
  }

  if (!stats) {
    return <div>Failed to load performance data</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.completionRate}%</div>
          <p className="text-xs text-muted-foreground">
            {stats.completedJobs}/{stats.totalJobs} jobs completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary">{stats.averageRating}</div>
            <div className="text-yellow-500">★</div>
          </div>
          <p className="text-xs text-muted-foreground">Based on customer reviews</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Response Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.responseTime}h</div>
          <p className="text-xs text-muted-foreground">Average response to new jobs</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">${stats.totalEarnings}</div>
          <p className="text-xs text-muted-foreground">Lifetime earnings</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">${stats.monthlyEarnings}</div>
          <p className="text-xs text-muted-foreground">Current month earnings</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Performance Level</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge className={
            stats.averageRating >= 4.5 
              ? "bg-green-100 text-green-800" 
              : stats.averageRating >= 4.0 
              ? "bg-yellow-100 text-yellow-800" 
              : "bg-red-100 text-red-800"
          }>
            {stats.averageRating >= 4.5 ? "Excellent" : stats.averageRating >= 4.0 ? "Good" : "Needs Improvement"}
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">Based on your ratings</p>
        </CardContent>
      </Card>
    </div>
  )
}