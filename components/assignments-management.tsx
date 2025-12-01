"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface Assignment {
  id: number
  quote_id: number
  business_name: string
  cleaner_name: string
  cleaner_email: string
  customer_name: string
  customer_email: string
  scheduled_date: string
  total_price: number
  payment_amount: number
  status: string
  assigned_date: string
}

interface Cleaner {
  id: number
  user_name: string
  business_name: string
  email: string
}

export function AssignmentsManagement() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [cleaners, setCleaners] = useState<Cleaner[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<any>(null)
  const [selectedCleaner, setSelectedCleaner] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/admin/cleaner-assignments?status=${statusFilter}`)
      if (response.ok) {
        const data = await response.json()
        setAssignments(data.assignments)
      }
    } catch (error) {
      console.error("Error fetching assignments:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableCleaners = async () => {
    try {
      const response = await fetch("/api/admin/cleaners?status=approved")
      if (response.ok) {
        const data = await response.json()
        setCleaners(data.cleaners)
      }
    } catch (error) {
      console.error("Error fetching cleaners:", error)
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, [statusFilter])

  const handleAssignCleaner = async () => {
    if (!selectedQuote || !selectedCleaner || !paymentAmount) return

    try {
      const response = await fetch("/api/admin/cleaner-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote_request_id: selectedQuote.id,
          cleaner_id: parseInt(selectedCleaner),
          assigned_by: 1, // This should be the admin user ID from session
          payment_amount: parseFloat(paymentAmount)
        })
      })

      if (response.ok) {
        await fetchAssignments()
        setAssignmentDialogOpen(false)
        setSelectedQuote(null)
        setSelectedCleaner("")
        setPaymentAmount("")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to assign cleaner")
      }
    } catch (error) {
      console.error("Error assigning cleaner:", error)
      alert("Failed to assign cleaner")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "rejected": return "bg-red-100 text-red-800"
      case "completed": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading assignments...</div>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cleaner Assignments</CardTitle>
              <CardDescription>Manage job assignments to cleaners</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote ID</TableHead>
                <TableHead>Cleaner</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-mono">
                    #{assignment.quote_id.toString().padStart(6, "0")}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{assignment.cleaner_name}</p>
                      <p className="text-sm text-muted-foreground">{assignment.business_name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{assignment.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{assignment.customer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {assignment.scheduled_date 
                      ? new Date(assignment.scheduled_date).toLocaleDateString()
                      : "Not scheduled"
                    }
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">${assignment.payment_amount}</p>
                    <p className="text-sm text-muted-foreground">
                      Quote: ${assignment.total_price}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(assignment.assigned_date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {assignments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No assignments found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Cleaner to Job</DialogTitle>
            <DialogDescription>
              Assign a cleaner to quote #{selectedQuote?.id.toString().padStart(6, "0")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Cleaner</label>
              <Select onValueChange={setSelectedCleaner}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a cleaner" />
                </SelectTrigger>
                <SelectContent>
                  {cleaners.map((cleaner) => (
                    <SelectItem key={cleaner.id} value={cleaner.id.toString()}>
                      {cleaner.business_name} - {cleaner.user_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter payment amount"
              />
            </div>

            <Button onClick={handleAssignCleaner} className="w-full">
              Assign Cleaner
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}