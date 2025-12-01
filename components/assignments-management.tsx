"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Assignment {
  id: number
  quote_id: number
  business_name: string
  cleaner_name: string
  cleaner_email: string
  cleaner_phone: string
  customer_name: string
  customer_email: string
  scheduled_date: string
  total_price: number
  payment_amount: number
  status: string
  assigned_date: string
  accepted_at: string | null
  completed_at: string | null
  cleaner_notes: string
  admin_notes: string
  payment_status: string
  payment_date: string | null
  cleaning_type: string
  property_type: string
}

interface Cleaner {
  id: number
  user_name: string
  business_name: string
  email: string
  phone: string
  rating: number
  completed_assignments: number
}

interface Quote {
  id: number
  user_name: string
  user_email: string
  property_type: string
  cleaning_type: string
  total_price: number
  scheduled_date: string | null
  status: string
}

export function AssignmentsManagement() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [cleaners, setCleaners] = useState<Cleaner[]>([])
  const [availableQuotes, setAvailableQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [selectedCleaner, setSelectedCleaner] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [cleanerNotes, setCleanerNotes] = useState("")

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
      const response = await fetch("/api/admin/cleaners?status=approved&limit=100")
      if (response.ok) {
        const data = await response.json()
        setCleaners(data.cleaners)
      }
    } catch (error) {
      console.error("Error fetching cleaners:", error)
    }
  }

  const fetchAvailableQuotes = async () => {
    try {
      const response = await fetch("/api/admin/quotes?status=paid")
      if (response.ok) {
        const data = await response.json()
        setAvailableQuotes(data.quotes.filter((quote: Quote) => 
          !assignments.some(assignment => assignment.quote_id === quote.id && 
            ["pending", "accepted", "in_progress"].includes(assignment.status))
        ))
      }
    } catch (error) {
      console.error("Error fetching quotes:", error)
    }
  }

  useEffect(() => {
    fetchAssignments()
  }, [statusFilter])

  useEffect(() => {
    fetchAvailableCleaners()
    fetchAvailableQuotes()
  }, [assignments])

  const handleAssignCleaner = async () => {
    if (!selectedQuote || !selectedCleaner || !paymentAmount) {
      alert("Please select a quote, cleaner, and enter payment amount")
      return
    }

    try {
      const response = await fetch("/api/admin/cleaner-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote_request_id: selectedQuote.id,
          cleaner_id: parseInt(selectedCleaner),
          payment_amount: parseFloat(paymentAmount),
          admin_notes: adminNotes
        })
      })

      if (response.ok) {
        await fetchAssignments()
        setAssignmentDialogOpen(false)
        resetForm()
        alert("Cleaner assigned successfully!")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to assign cleaner")
      }
    } catch (error) {
      console.error("Error assigning cleaner:", error)
      alert("Failed to assign cleaner")
    }
  }

  const handleUpdateAssignment = async () => {
    if (!selectedAssignment) return

    try {
      const response = await fetch(`/api/admin/cleaner-assignments/${selectedAssignment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedAssignment.status,
          admin_notes: adminNotes,
          cleaner_notes: cleanerNotes,
          payment_amount: selectedAssignment.payment_amount,
          payment_status: selectedAssignment.payment_status
        })
      })

      if (response.ok) {
        await fetchAssignments()
        setEditDialogOpen(false)
        resetForm()
        alert("Assignment updated successfully!")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to update assignment")
      }
    } catch (error) {
      console.error("Error updating assignment:", error)
      alert("Failed to update assignment")
    }
  }

  const handleMarkAsPaid = async (assignmentId: number) => {
    try {
      const response = await fetch(`/api/admin/cleaner-assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_status: "paid",
          payment_date: new Date().toISOString()
        })
      })

      if (response.ok) {
        await fetchAssignments()
        alert("Payment status updated to paid!")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to update payment status")
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
      alert("Failed to update payment status")
    }
  }

  const handleMarkAsCompleted = async (assignmentId: number) => {
    try {
      const response = await fetch(`/api/admin/cleaner-assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          completed_at: new Date().toISOString()
        })
      })

      if (response.ok) {
        await fetchAssignments()
        alert("Assignment marked as completed!")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to mark as completed")
      }
    } catch (error) {
      console.error("Error marking as completed:", error)
      alert("Failed to mark as completed")
    }
  }

  const resetForm = () => {
    setSelectedQuote(null)
    setSelectedCleaner("")
    setPaymentAmount("")
    setAdminNotes("")
    setCleanerNotes("")
    setSelectedAssignment(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "accepted": return "bg-green-100 text-green-800 border-green-200"
      case "rejected": return "bg-red-100 text-red-800 border-red-200"
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200"
      case "in_progress": return "bg-purple-100 text-purple-800 border-purple-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "processing": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const calculateCleanerEarnings = (totalPrice: number) => {
    // Typically cleaner gets 70-80% of the total price
    return totalPrice * 0.7
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading assignments...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{assignments.length}</div>
            <p className="text-xs text-muted-foreground">All assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {assignments.filter(a => a.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {assignments.filter(a => a.status === "accepted" || a.status === "in_progress").length}
            </div>
            <p className="text-xs text-muted-foreground">Active jobs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {assignments.filter(a => a.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground">Finished jobs</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setAssignmentDialogOpen(true)} className="bg-accent hover:bg-accent/90">
          <span className="mr-2">+</span> Assign New Job
        </Button>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cleaner Assignments</CardTitle>
          <CardDescription>Manage all cleaner assignments and monitor progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Details</TableHead>
                  <TableHead>Cleaner</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.length > 0 ? (
                  assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {assignment.cleaning_type} - {assignment.property_type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Quote #{assignment.quote_id.toString().padStart(6, "0")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{assignment.cleaner_name}</p>
                          <p className="text-sm text-muted-foreground">{assignment.business_name}</p>
                          <p className="text-xs text-muted-foreground">{assignment.cleaner_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{assignment.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{assignment.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignment.scheduled_date ? (
                          <div>
                            <p>{new Date(assignment.scheduled_date).toLocaleDateString()}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(assignment.scheduled_date).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        ) : (
                          "Not scheduled"
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">${assignment.payment_amount}</p>
                          <Badge className={`mt-1 ${getPaymentStatusColor(assignment.payment_status)}`}>
                            {assignment.payment_status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status.replace('_', ' ')}
                        </Badge>
                        {assignment.accepted_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Accepted: {new Date(assignment.accepted_at).toLocaleDateString()}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(assignment.assigned_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAssignment(assignment)
                              setAdminNotes(assignment.admin_notes || "")
                              setCleanerNotes(assignment.cleaner_notes || "")
                              setEditDialogOpen(true)
                            }}
                          >
                            Edit
                          </Button>
                          {assignment.status === "accepted" || assignment.status === "completed" && assignment.payment_status !== "paid" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                              onClick={() => handleMarkAsPaid(assignment.id)}
                            >
                              Mark Paid
                            </Button>
                          )}
                          {assignment.status === "accepted" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                              onClick={() => handleMarkAsCompleted(assignment.id)}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📋</span>
                      </div>
                      <p className="text-muted-foreground">No assignments found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Assign New Job Dialog */}
      <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign New Cleaning Job</DialogTitle>
            <DialogDescription>Assign a cleaner to a paid quote</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Quote</Label>
              <Select onValueChange={(value) => {
                const quote = availableQuotes.find(q => q.id === parseInt(value))
                setSelectedQuote(quote || null)
                if (quote) {
                  setPaymentAmount(calculateCleanerEarnings(quote.total_price).toFixed(2))
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a quote" />
                </SelectTrigger>
                <SelectContent>
                  {availableQuotes.map((quote) => (
                    <SelectItem key={quote.id} value={quote.id.toString()}>
                      #{quote.id.toString().padStart(6, "0")} - {quote.cleaning_type} ({quote.property_type}) - ${quote.total_price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Cleaner</Label>
              <Select onValueChange={setSelectedCleaner}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a cleaner" />
                </SelectTrigger>
                <SelectContent>
                  {cleaners.map((cleaner) => (
                    <SelectItem key={cleaner.id} value={cleaner.id.toString()}>
                      {cleaner.business_name} - {cleaner.user_name} ⭐{cleaner.rating || "N/A"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Amount ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter payment amount"
              />
              <p className="text-xs text-muted-foreground">
                Suggested: 70% of quote total
              </p>
            </div>

            <div className="space-y-2">
              <Label>Admin Notes (Optional)</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any special instructions or notes..."
                rows={3}
              />
            </div>

            <Button onClick={handleAssignCleaner} className="w-full">
              Assign Cleaner
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>
              Assignment #{selectedAssignment?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedAssignment && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={selectedAssignment.status} 
                  onValueChange={(value) => setSelectedAssignment({...selectedAssignment, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select 
                  value={selectedAssignment.payment_status} 
                  onValueChange={(value) => setSelectedAssignment({...selectedAssignment, payment_status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={selectedAssignment.payment_amount}
                  onChange={(e) => setSelectedAssignment({...selectedAssignment, payment_amount: parseFloat(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Cleaner Notes</Label>
                <Textarea
                  value={cleanerNotes}
                  onChange={(e) => setCleanerNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleUpdateAssignment} className="flex-1 bg-accent">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}