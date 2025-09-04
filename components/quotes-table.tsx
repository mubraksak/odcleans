"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" // Add this import

interface Quote {
  id: number
  user_name: string
  user_email: string
  property_type: string
  cleaning_type: string
  rooms: number
  bathrooms: number
  square_footage?: number
  desired_date?: string
  special_instructions : string
  status: string
  proposed_price?: number
  admin_notes?: string // Add this field
  created_at: string
}

export function QuotesTable() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [proposedPrice, setProposedPrice] = useState("")
  const [adminNotes, setAdminNotes] = useState("") // Add state for admin notes

  const fetchQuotes = async () => {
    try {
      const response = await fetch(`/api/admin/quotes?status=${statusFilter}`)
      if (response.ok) {
        const data = await response.json()
        setQuotes(data.quotes)
      }
    } catch (error) {
      console.error("Error fetching quotes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotes()
  }, [statusFilter])

  // Reset form fields when a new quote is selected
  useEffect(() => {
    if (selectedQuote) {
      setProposedPrice(selectedQuote.proposed_price?.toString() || "")
      setAdminNotes(selectedQuote.admin_notes || "")
    }
  }, [selectedQuote])

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

  const handleSubmitQuote = async () => {
    if (!selectedQuote) return

    try {
      const response = await fetch(`/api/admin/quotes/${selectedQuote.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposed_price: proposedPrice ? Number(proposedPrice) : undefined,
          admin_notes: adminNotes,
          status: proposedPrice ? "quoted" : selectedQuote.status,
        }),
      })

      if (response.ok) {
        await fetchQuotes() // Refresh the quotes list
        setSelectedQuote(null)
        setProposedPrice("")
        setAdminNotes("")
      }
    } catch (error) {
      console.error("Error updating quote:", error)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedQuote) return

    try {
      const response = await fetch(`/api/admin/quotes/${selectedQuote.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admin_notes: adminNotes,
          // Keep existing status and price
          status: selectedQuote.status,
          proposed_price: selectedQuote.proposed_price,
        }),
      })

      if (response.ok) {
        await fetchQuotes() // Refresh the quotes list
      }
    } catch (error) {
      console.error("Error saving notes:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading quotes...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-primary">Quote Requests</CardTitle>
              <CardDescription>Manage and respond to customer quote requests</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="quoted">Quoted</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-mono">#{quote.id.toString().padStart(6, "0")}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{quote.user_name}</p>
                        <p className="text-sm text-muted-foreground">{quote.user_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {quote.cleaning_type.replace("_", " ")} • {quote.property_type}
                        </p>
                        <p className="text-sm text-muted-foreground">{quote.rooms} rooms</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(quote.status)}>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{quote.proposed_price ? `$${quote.proposed_price}` : "Not set"}</TableCell>
                    <TableCell>{new Date(quote.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedQuote(quote)}
                        className="bg-transparent"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {quotes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No quotes found for the selected filter.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Details Modal */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote Details #{selectedQuote?.id.toString().padStart(6, "0")}</DialogTitle>
            <DialogDescription>
              Customer: {selectedQuote?.user_name} ({selectedQuote?.user_email})
            </DialogDescription>
          </DialogHeader>

          {selectedQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Property Type</Label>
                  <p className="font-medium capitalize">{selectedQuote.property_type}</p>
                </div>
                <div>
                  <Label>Cleaning Type</Label>
                  <p className="font-medium capitalize">{selectedQuote.cleaning_type.replace("_", " ")}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Rooms</Label>
                  <p className="font-medium">{selectedQuote.rooms}</p>
                </div>
                <div>
                  <Label>Bathrooms</Label>
                  <p className="font-medium">{selectedQuote.bathrooms}</p>
                </div>
                <div>
                  <Label>Square Footage</Label>
                  <p className="font-medium">{selectedQuote.square_footage || "Not specified"}</p>
                </div>
              </div>

              <div>
                <Label>Preferred Date</Label>
                <p className="font-medium">
                  {selectedQuote.desired_date ? new Date(selectedQuote.desired_date).toLocaleDateString() : "Not specified"}
                </p>
              </div>

              <div>
                <Label>special Instruction</Label>
                <p className="font-medium">
                  {selectedQuote.special_instructions || "Not Specified"}
                </p>
              </div>

              <div>
                <Label>Status</Label>
                <Badge className={getStatusColor(selectedQuote.status)}>
                  {selectedQuote.status.charAt(0).toUpperCase() + selectedQuote.status.slice(1)}
                </Badge>
              </div>

              {/* Admin Notes Section - Always visible */}
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Add internal notes about this quote..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                />
                <Button onClick={handleSaveNotes} variant="outline" size="sm" className="mt-2">
                  Save Notes
                </Button>
              </div>

              {/* Price Proposal Section - Only for pending quotes */}
              {selectedQuote.status === "pending" && (
                <div className="space-y-2 border-t pt-4">
                  <Label htmlFor="proposedPrice">Propose Price ($)</Label>
                  <Input
                    id="proposedPrice"
                    type="number"
                    placeholder="Enter price"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                  />
                  <Button onClick={handleSubmitQuote} className="mt-2">
                    Submit Quote to Customer
                  </Button>
                </div>
              )}

              {selectedQuote.proposed_price && (
                <div className="border-t pt-4">
                  <Label>Proposed Price</Label>
                  <p className="font-medium text-lg">${selectedQuote.proposed_price}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}