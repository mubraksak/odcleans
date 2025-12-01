"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CleanerReceipts } from "@/components/cleaner-receipts"

interface Assignment {
  id: number
  quote_request_id: number
  status: string
  assignment_status: string
  assigned_date: string
  scheduled_date: string
  customer_name: string
  customer_email: string
  total_price: number
  property_type: string
  cleaning_type: string
  address?: string
  special_instructions?: string
}

interface AvailableJob {
  id: number
  customer_name: string
  customer_email: string
  scheduled_date: string
  total_price: number
  property_type: string
  cleaning_type: string
  address?: string
  special_instructions?: string
}

interface DashboardData {
  metrics: {
    assignedJobs: number
    completedJobs: number
    totalEarnings: number
  }
  availableJobs: AvailableJob[]
  currentAssignments: Assignment[]
  cleaner: {
    business_name: string
    status: string
    rating: number
  }
}

export function CleanerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/cleaner/dashboard")
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      } else {
        console.error("Failed to fetch dashboard data")
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleJobAction = async (quoteId: number, action: "request" | "accept" | "reject" | "complete") => {
    try {
      const response = await fetch("/api/cleaner/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote_request_id: quoteId,
          action: action
        })
      })

      if (response.ok) {
        await fetchDashboardData() // Refresh data
        alert(`Job ${action === 'request' ? 'requested' : action + 'ed'} successfully!`)
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to process request")
      }
    } catch (error) {
      console.error("Error processing job action:", error)
      alert("Failed to process request")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "accepted": return "bg-green-100 text-green-800 border-green-200"
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200"
      case "rejected": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-accent-foreground font-bold text-lg">O</span>
          </div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
        <Button onClick={fetchDashboardData} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="font-serif font-bold text-3xl text-primary mb-2">
          Welcome, {data.cleaner.business_name}!
        </h1>
        <p className="text-muted-foreground">Manage your cleaning assignments and earnings</p>
        <Badge className={`mt-2 ${
          data.cleaner.status === 'approved' ? 'bg-green-100 text-green-800' : 
          data.cleaner.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {data.cleaner.status.charAt(0).toUpperCase() + data.cleaner.status.slice(1)}
        </Badge>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", name: "Overview" },
            { id: "receipts", name: "Receipts" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Assigned Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{data.metrics.assignedJobs}</div>
                <p className="text-xs text-muted-foreground">Currently assigned</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{data.metrics.completedJobs}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">${data.metrics.totalEarnings}</div>
                <p className="text-xs text-muted-foreground">Lifetime earnings</p>
              </CardContent>
            </Card>
          </div>

          {/* Available Jobs */}
          {data.availableJobs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Jobs</CardTitle>
                <CardDescription>Request to work on these available cleaning jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Scheduled Date</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.availableJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{job.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{job.customer_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{job.cleaning_type}</p>
                            <p className="text-sm text-muted-foreground">{job.property_type}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(job.scheduled_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${job.total_price}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleJobAction(job.id, "request")}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Request Job
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Current Assignments */}
          {data.currentAssignments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>My Assignments</CardTitle>
                <CardDescription>Jobs you're currently working on</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Scheduled Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.currentAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{assignment.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{assignment.customer_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{assignment.cleaning_type}</p>
                            <p className="text-sm text-muted-foreground">{assignment.property_type}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(assignment.scheduled_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(assignment.assignment_status)}>
                           
                            {assignment.assignment_status.charAt(0).toUpperCase() + assignment.assignment_status.slice(1) }
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {assignment.assignment_status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleJobAction(assignment.quote_request_id, "accept")}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Accept
                              </Button>
                              <Button
                                onClick={() => handleJobAction(assignment.quote_request_id, "reject")}
                                size="sm"
                                variant="outline"
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {assignment.assignment_status === 'accepted' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleJobAction(assignment.quote_request_id, "complete")}
                                size="sm"
                                className="bg-green-600 hover:bg-blue-700"
                              >
                                Mark Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // View job details
                                  alert(`Job Details:\nCustomer: ${assignment.customer_name}\nService: ${assignment.cleaning_type}\nDate: ${new Date(assignment.scheduled_date).toLocaleDateString()}`)
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {data.availableJobs.length === 0 && data.currentAssignments.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧹</span>
                </div>
                <CardTitle className="text-xl text-primary mb-2">No jobs available</CardTitle>
                <CardDescription className="mb-6">
                  Check back later for new cleaning job opportunities
                </CardDescription>
                <Button onClick={fetchDashboardData} variant="outline">
                  Refresh Jobs
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {activeTab === "receipts" && (
        <CleanerReceipts />
      )}
    </div>
  )
}