"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Cleaner {
  id: number
  user_name: string
  email: string
  business_name: string
  phone: string
  status: string
  experience_years: number
  hourly_rate: number
  total_assignments: number
  completed_assignments: number
  avg_rating: number
  created_at: string
}

export function CleanersManagement() {
  const [cleaners, setCleaners] = useState<Cleaner[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedCleaner, setSelectedCleaner] = useState<Cleaner | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [newStatus, setNewStatus] = useState("")

  const fetchCleaners = async () => {
    try {
      const response = await fetch(`/api/admin/cleaners?status=${statusFilter}`)
      if (response.ok) {
        const data = await response.json()
        setCleaners(data.cleaners)
      }
    } catch (error) {
      console.error("Error fetching cleaners:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCleaners()
  }, [statusFilter])

  const handleStatusUpdate = async () => {
    if (!selectedCleaner) return

    try {
      const response = await fetch("/api/admin/cleaners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cleanerId: selectedCleaner.id,
          status: newStatus,
          adminNotes: adminNotes
        })
      })

      if (response.ok) {
        await fetchCleaners()
        setSelectedCleaner(null)
        setAdminNotes("")
        setNewStatus("")
      }
    } catch (error) {
      console.error("Error updating cleaner status:", error)
      alert("Failed to update cleaner status")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "rejected": return "bg-red-100 text-red-800"
      case "suspended": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading cleaners...</div>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cleaners Management</CardTitle>
              <CardDescription>Manage cleaner applications and profiles</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cleaner</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cleaners.map((cleaner) => (
                <TableRow key={cleaner.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{cleaner.user_name}</p>
                      <p className="text-sm text-muted-foreground">{cleaner.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{cleaner.business_name || "N/A"}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{cleaner.phone}</p>
                  </TableCell>
                  <TableCell>
                    <p>{cleaner.experience_years || 0} years</p>
                    <p className="text-sm text-muted-foreground">${cleaner.hourly_rate}/hr</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="font-medium">{cleaner.avg_rating || 0}</span>
                      <span className="text-yellow-500 ml-1">★</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p>{cleaner.completed_assignments}/{cleaner.total_assignments}</p>
                    <p className="text-sm text-muted-foreground">Completed/Total</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(cleaner.status)}>
                      {cleaner.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCleaner(cleaner)
                        setNewStatus(cleaner.status)
                      }}
                    >
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {cleaners.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No cleaners found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cleaner Management Dialog */}
      <Dialog open={!!selectedCleaner} onOpenChange={() => setSelectedCleaner(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Cleaner</DialogTitle>
            <DialogDescription>
              {selectedCleaner?.user_name} - {selectedCleaner?.business_name}
            </DialogDescription>
          </DialogHeader>

          {selectedCleaner && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this cleaner..."
                  rows={3}
                />
              </div>

              <Button onClick={handleStatusUpdate} className="w-full">
                Update Status
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}