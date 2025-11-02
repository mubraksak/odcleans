"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface AdditionalService {
  service_type: string
  price: number
}

interface Quote {
  id: number
  user_name: string
  user_email: string
  property_type: string
  cleaning_type: string
  bedrooms: number
  bathrooms: number
  square_footage?: number
  desired_date?: string
  desired_date1?: string
  desired_date2?: string
  desired_date3?: string
  special_instructions: string
  status: string
  proposed_price?: number
  base_price?: number
  total_price?: number
  admin_notes?: string
  created_at: string
  bookingId?: number
  scheduledDate?: string
  bookingStatus?: string
  cleaning_frequency?: string
  has_pets?: boolean
  additional_service_types?: string
  additional_services?: AdditionalService[] | string
  suggested_price?: string
}

export function QuotesTable() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [schedulingQuote, setSchedulingQuote] = useState<Quote | null>(null)
  const [quoteToSchedule, setQuoteToSchedule] = useState<Quote | null>(null) // New state for scheduling
  const [basePrice, setBasePrice] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [additionalServices, setAdditionalServices] = useState<{ [key: string]: boolean }>({})
  const [schedulingModalOpen, setSchedulingModalOpen] = useState(false);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState("");
  const [selectedScheduleTime, setSelectedScheduleTime] = useState("");
  const [isScheduling, setIsScheduling] = useState(false)

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

  useEffect(() => {
    if (selectedQuote) {
      setBasePrice(selectedQuote.base_price?.toString() || selectedQuote.proposed_price?.toString() || "")
      setAdminNotes(selectedQuote.admin_notes || "")

      const initialServices: { [key: string]: boolean } = {}
      if (selectedQuote.additional_services) {
        const services = Array.isArray(selectedQuote.additional_services)
          ? selectedQuote.additional_services
          : parseAdditionalServices(selectedQuote.additional_services)

        services.forEach(service => {
          initialServices[service.service_type] = true
        })
      }
      setAdditionalServices(initialServices)
    }
  }, [selectedQuote])

  const parseAdditionalServices = (services: any): AdditionalService[] => {
    if (Array.isArray(services)) return services
    if (typeof services === 'string') {
      try {
        return services.split(';').map(service => {
          const [service_type, price] = service.split(':')
          return { service_type, price: parseFloat(price) || 0 }
        })
      } catch (error) {
        console.error('Error parsing services:', error)
      }
    }
    return []
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "quoted": return "bg-blue-100 text-blue-800 border-blue-200"
      case "accepted": return "bg-green-100 text-green-800 border-green-200"
      case "declined": return "bg-red-100 text-red-800 border-red-200"
      case "completed": return "bg-gray-100 text-gray-800 border-gray-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleServiceToggle = (serviceType: string, checked: boolean) => {
    setAdditionalServices(prev => ({ ...prev, [serviceType]: checked }))
  }

  const calculateTotalPrice = () => {
    const base = parseFloat(basePrice) || 0
    const additional = Object.entries(additionalServices).reduce((total, [serviceType, isSelected]) => {
      if (isSelected) {
        const servicePrice = getServicePrice(serviceType)
        return total + servicePrice
      }
      return total
    }, 0)
    return base + additional
  }

  const getServicePrice = (serviceType: string): number => {
    const servicePrices: { [key: string]: number } = {
      laundry: 25,
      folding_clothes: 15,
      fridge_cleaning: 35,
      baseboard_cleaning: 20,
      cabinet_cleaning: 30,
      window_cleaning: 40
    }
    return servicePrices[serviceType] || 0
  }

  const getServiceName = (serviceType: string): string => {
    const serviceNames: { [key: string]: string } = {
      laundry: "Laundry",
      folding_clothes: "Folding Clothes",
      fridge_cleaning: "Fridge Cleaning",
      baseboard_cleaning: "Baseboard Cleaning",
      cabinet_cleaning: "Cabinet Cleaning",
      window_cleaning: "Window Cleaning"
    }
    return serviceNames[serviceType] || serviceType.replace('_', ' ')
  }

  const handleSubmitQuote = async () => {
    if (!selectedQuote) return

    const totalPrice = calculateTotalPrice()
    const selectedServices = Object.entries(additionalServices)
      .filter(([_, isSelected]) => isSelected)
      .map(([serviceType]) => serviceType)

    try {
      const response = await fetch(`/api/admin/quotes/${selectedQuote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_price: parseFloat(basePrice) || 0,
          total_price: totalPrice,
          admin_notes: adminNotes,
          status: "quoted",
          additional_services: selectedServices.join(',')
        }),
      })

      if (response.ok) {
        await fetchQuotes()
        setSelectedQuote(null)
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_notes: adminNotes,
          status: selectedQuote.status,
          base_price: selectedQuote.base_price,
        }),
      })

      if (response.ok) await fetchQuotes()
    } catch (error) {
      console.error("Error saving notes:", error)
    }
  }

  const handleAcceptQuote = async () => {
    if (!selectedQuote) return

    try {
      const response = await fetch(`/api/admin/quotes/${selectedQuote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "accepted",
          admin_notes: adminNotes,
        }),
      })

      if (response.ok) {
        // Open scheduling modal after successful acceptance
        setSchedulingQuote(selectedQuote)
        setSelectedQuote(null)
        await fetchQuotes()
      }
    } catch (error) {
      console.error("Error accepting quote:", error)
    }
  }

  const handleScheduleBooking = async () => {
    if (!quoteToSchedule || !selectedScheduleDate || !selectedScheduleTime) return;

    try {
      const response = await fetch(`/api/admin/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote_id: quoteToSchedule.id,
          scheduled_date: `${selectedScheduleDate}T${selectedScheduleTime}`,
          status: "scheduled"
        }),
      });

      if (response.ok) {
        // Refresh quotes and close modal
        await fetchQuotes();
        setQuoteToSchedule(null);
        setSelectedScheduleDate("");
        setSelectedScheduleTime("");
      }
    } catch (error) {
      console.error("Error scheduling booking:", error);
    }
  };

  // Get available date options from the quote
  const getDateOptions = (quote: Quote) => {
    const options = []
    if (quote.desired_date1) options.push(quote.desired_date1)
    if (quote.desired_date2) options.push(quote.desired_date2)
    if (quote.desired_date3) options.push(quote.desired_date3)
    if (quote.desired_date) options.push(quote.desired_date)
    return options.filter(Boolean)
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading...</div>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-primary">Quote Requests</CardTitle>
              <CardDescription>Manage customer quote requests</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Filter status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
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
                        <p className="font-medium">{quote.cleaning_type.replace("_", " ")} • {quote.property_type}</p>
                        <p className="text-sm text-muted-foreground">{quote.bedrooms} rooms, {quote.bathrooms} baths</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(quote.status)}>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{quote.total_price ? `$${quote.total_price}` : "Not set"}</TableCell>
                    <TableCell>{new Date(quote.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/quotes/${quote.id}`}>
                            View Details
                          </Link>
                        </Button>
                        {quote.status === "accepted" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQuoteToSchedule(quote)}
                            className="bg-green-100 text-green-800 hover:bg-green-200"
                          >
                            Schedule Date
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {quotes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No quotes found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Details Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote #{selectedQuote?.id.toString().padStart(6, "0")}</DialogTitle>
            <DialogDescription>Customer: {selectedQuote?.user_name} ({selectedQuote?.user_email})</DialogDescription>
          </DialogHeader>

          {selectedQuote && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Quote Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Property Type</Label><p className="font-medium capitalize">{selectedQuote.property_type}</p></div>
                  <div><Label>Cleaning Type</Label><p className="font-medium capitalize">{selectedQuote.cleaning_type.replace("_", " ")}</p></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Bedrooms</Label><p className="font-medium">{selectedQuote.bedrooms}</p></div>
                  <div><Label>Bathrooms</Label><p className="font-medium">{selectedQuote.bathrooms}</p></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Square Footage</Label><p className="font-medium">{selectedQuote.square_footage || "N/A"}</p></div>
                  <div><Label>Cleaning Frequency</Label><p className="font-medium">{selectedQuote.cleaning_frequency || "N/A"}</p></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Pets in Home</Label><p className="font-medium">{selectedQuote.has_pets ? "Yes" : "No"}</p></div>
                  <div><Label>Desired Date</Label><p className="font-medium">{selectedQuote.desired_date ? new Date(selectedQuote.desired_date).toLocaleDateString() : "N/A"}</p></div>
                </div>

                <div><Label>Special Instructions</Label><p className="font-medium">{selectedQuote.special_instructions || "None"}</p></div>
                <div><Label>Status</Label><Badge className={getStatusColor(selectedQuote.status)}>{selectedQuote.status}</Badge></div>
              </div>

              {/* Right Column - Pricing & Actions */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price ($)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="Enter base price"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Additional Services</Label>
                  <div className="space-y-2">
                    {Object.entries({
                      laundry: "Laundry (+$25)",
                      folding_clothes: "Folding Clothes (+$15)",
                      fridge_cleaning: "Fridge Cleaning (+$35)",
                      baseboard_cleaning: "Baseboard Cleaning (+$20)",
                      cabinet_cleaning: "Cabinet Cleaning (+$30)",
                      window_cleaning: "Window Cleaning (+$40)"
                    }).map(([serviceType, label]) => (
                      <div key={serviceType} className="flex items-center space-x-2">
                        <Checkbox
                          checked={additionalServices[serviceType] || false}
                          onCheckedChange={(checked) => handleServiceToggle(serviceType, checked as boolean)}
                        />
                        <Label className="text-sm">{label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg">Total Price</Label>
                    <span className="text-2xl font-bold text-accent">${calculateTotalPrice()}</span>
                  </div>
                </div>

                {selectedQuote.suggested_price && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-lg">Suggested Price</Label>
                      <span className="text-2xl font-bold text-accent">${selectedQuote.suggested_price}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="adminNotes">Admin Notes</Label>
                  <Textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    placeholder="Add internal notes..."
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveNotes} variant="outline" className="flex-1">
                    Save Notes
                  </Button>
                  {selectedQuote.status === "quoted" && (
                    <Button onClick={handleAcceptQuote} className="flex-1 bg-green-600 hover:bg-green-700">
                      Accept Quote
                    </Button>
                  )}
                  <Button onClick={handleSubmitQuote} className="flex-1 bg-accent">
                    Submit Quote
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Scheduling Modal */}
      <Dialog open={!!quoteToSchedule} onOpenChange={() => setQuoteToSchedule(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Booking for Quote #{quoteToSchedule?.id.toString().padStart(6, "0")}</DialogTitle>
            <DialogDescription>
              Customer: {quoteToSchedule?.user_name}
            </DialogDescription>
          </DialogHeader>

          {quoteToSchedule && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Available Dates</Label>
                <Select onValueChange={setSelectedScheduleDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a date" />
                  </SelectTrigger>
                  <SelectContent>
                    {quoteToSchedule.desired_date1 && (
                      <SelectItem value={quoteToSchedule.desired_date1}>
                        {new Date(quoteToSchedule.desired_date1).toLocaleDateString()}
                      </SelectItem>
                    )}
                    {quoteToSchedule.desired_date2 && (
                      <SelectItem value={quoteToSchedule.desired_date2}>
                        {new Date(quoteToSchedule.desired_date2).toLocaleDateString()}
                      </SelectItem>
                    )}
                    {quoteToSchedule.desired_date3 && (
                      <SelectItem value={quoteToSchedule.desired_date3}>
                        {new Date(quoteToSchedule.desired_date3).toLocaleDateString()}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Time</Label>
                <Select onValueChange={setSelectedScheduleTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="13:00">1:00 PM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                    <SelectItem value="16:00">4:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleScheduleBooking}
                disabled={!selectedScheduleDate || !selectedScheduleTime}
                className="w-full"
              >
                Confirm Schedule
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}