"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CleanerAnalytics {
  totalCleaners: number
  activeCleaners: number
  pendingApprovals: number
  totalJobsCompleted: number
  averageRating: number
  topPerformers: Array<{
    id: number
    name: string
    business_name: string
    completed_jobs: number
    average_rating: number
    total_earnings: number
  }>
}

export function CleanerAnalytics() {
  const [analytics, setAnalytics] = useState<CleanerAnalytics | null>(null)
  const [timeRange, setTimeRange] = useState("month")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      // Simulated data - replace with actual API call
      const mockAnalytics: CleanerAnalytics = {
        totalCleaners: 15,
        activeCleaners: 12,
        pendingApprovals: 3,
        totalJobsCompleted: 156,
        averageRating: 4.6,
        topPerformers: [
          {
            id: 1,
            name: "John Cleaner",
            business_name: "Sparkle Clean",
            completed_jobs: 24,
            average_rating: 4.9,
            total_earnings: 3200
          },
          {
            id: 2,
            name: "Sarah Maids",
            business_name: "Maids R Us",
            completed_jobs: 22,
            average_rating: 4.8,
            total_earnings: 2850
          },
          {
            id: 3,
            name: "Mike Cleaning",
            business_name: "Mike's Cleaning Service",
            completed_jobs: 18,
            average_rating: 4.7,
            total_earnings: 2400
          }
        ]
      }
      
      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading analytics...</div>
  }

  if (!analytics) {
    return <div>Failed to load analytics</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Cleaners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{analytics.totalCleaners}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeCleaners} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{analytics.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{analytics.totalJobsCompleted}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-primary">{analytics.averageRating}</div>
              <div className="text-yellow-500">★</div>
            </div>
            <p className="text-xs text-muted-foreground">Cleaner performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Performing Cleaners</CardTitle>
              <CardDescription>Cleaners with highest ratings and completion rates</CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cleaner</TableHead>
                <TableHead>Completed Jobs</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Total Earnings</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.topPerformers.map((cleaner) => (
                <TableRow key={cleaner.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{cleaner.business_name}</p>
                      <p className="text-sm text-muted-foreground">{cleaner.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{cleaner.completed_jobs}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{cleaner.average_rating}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-green-600">${cleaner.total_earnings}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      cleaner.average_rating >= 4.8 
                        ? "bg-green-100 text-green-800" 
                        : cleaner.average_rating >= 4.5 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-blue-100 text-blue-800"
                    }>
                      {cleaner.average_rating >= 4.8 ? "Excellent" : 
                       cleaner.average_rating >= 4.5 ? "Good" : "Satisfactory"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}