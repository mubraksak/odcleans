"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface QuoteDetailsProps {
  quoteId: number
}

export function QuoteDetails({ quoteId }: QuoteDetailsProps) {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [basePrice, setBasePrice] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [additionalServices, setAdditionalServices] = useState<{ [key: string]: boolean }>({})
  const [schedulingModalOpen, setSchedulingModalOpen] = useState(false)
  const [selectedScheduleDate, setSelectedScheduleDate] = useState("")
  const [selectedScheduleTime, setSelectedScheduleTime] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // clenaer variable to hold available cleaners
  const [availableCleaners, setAvailableCleaners] = useState<any[]>([])
  const [selectedCleaner, setSelectedCleaner] = useState("")
  const [assignmentAmount, setAssignmentAmount] = useState("")






  const fetchAvailableCleaners = async () => {
    try {
      const response = await fetch("/api/admin/cleaners?status=approved")
      if (response.ok) {
        const data = await response.json()
        setAvailableCleaners(data.cleaners)
      }
    } catch (error) {
      console.error("Error fetching cleaners:", error)
    }
  }

  const handleAssignCleaner = async () => {
    if (!quote || !selectedCleaner || !assignmentAmount) return

    try {
      const response = await fetch("/api/admin/cleaner-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote_request_id: quote.id,
          cleaner_id: parseInt(selectedCleaner),
          assigned_by: 1, // This should come from admin session
          payment_amount: parseFloat(assignmentAmount)
        })
      })

      if (response.ok) {
        alert("Cleaner assigned successfully!")
        setSelectedCleaner("")
        setAssignmentAmount("")
        await fetchQuoteDetails() // Refresh quote data
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to assign cleaner")
      }
    } catch (error) {
      console.error("Error assigning cleaner:", error)
      alert("Failed to assign cleaner")
    }
  }



  // Fetch quote details
  const fetchQuoteDetails = async () => {
    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}`)
      if (response.ok) {
        const data = await response.json()
        setQuote(data.quote)
        setBasePrice(data.quote.base_price?.toString() || data.quote.proposed_price?.toString() || "")
        setAdminNotes(data.quote.admin_notes || "")

        // Initialize additional services
        const initialServices: { [key: string]: boolean } = {}
        if (data.quote.additional_services) {
          const services = parseAdditionalServices(data.quote.additional_services)
          services.forEach(service => {
            initialServices[service.service_type] = true
          })
        }
        setAdditionalServices(initialServices)
      }
    } catch (error) {
      console.error("Error fetching quote details:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuoteDetails()
  }, [quoteId])

   useEffect(() => {
    if (quote?.status === 'paid' || quote?.status === 'scheduled') {
      fetchAvailableCleaners()
    }
  }, [quote])


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
      case "paid": return "bg-purple-100 text-purple-800 border-purple-200"
      case "declined": return "bg-red-100 text-red-800 border-red-200"
      case "completed": return "bg-gray-100 text-gray-800 border-gray-200"
      case "scheduled": return "bg-indigo-100 text-indigo-800 border-indigo-200"
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
      laundry: 0,
      folding_clothes: 0,
      fridge_cleaning: 0,
      baseboard_cleaning: 0,
      cabinet_cleaning: 0,
      window_cleaning: 0
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

  // ADD THIS FUNCTION: Handle marking quote as paid
  const handleMarkAsPaid = async () => {
    if (!quote) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/quotes/${quote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "paid",
        }),
      })

      if (response.ok) {
        await fetchQuoteDetails() // Refresh the quote data
        router.refresh() // Refresh the page
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to mark as paid")
      }
    } catch (error) {
      console.error("Error marking quote as paid:", error)
      alert("Failed to mark quote as paid")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitQuote = async () => {
    if (!quote) return

    setIsSubmitting(true)
    const totalPrice = calculateTotalPrice()
    const selectedServices = Object.entries(additionalServices)
      .filter(([_, isSelected]) => isSelected)
      .map(([serviceType]) => serviceType)

    try {
      const response = await fetch(`/api/admin/quotes/${quote.id}`, {
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
        await fetchQuoteDetails()
      }
    } catch (error) {
      console.error("Error updating quote:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!quote) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/quotes/${quote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_notes: adminNotes,
          status: quote.status,
          base_price: quote.base_price,
        }),
      })

      if (response.ok) await fetchQuoteDetails()
    } catch (error) {
      console.error("Error saving notes:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAcceptQuote = async () => {
    if (!quote) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/quotes/${quote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "accepted",
          admin_notes: adminNotes,
        }),
      })

      if (response.ok) {
        await fetchQuoteDetails()
      }
    } catch (error) {
      console.error("Error accepting quote:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleScheduleBooking = async () => {
    if (!quote || !selectedScheduleDate || !selectedScheduleTime) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote_id: quote.id,
          scheduled_date: `${selectedScheduleDate}T${selectedScheduleTime}`,
          status: "scheduled"
        }),
      })

      if (response.ok) {
        await fetchQuoteDetails()
        setSchedulingModalOpen(false)
        setSelectedScheduleDate("")
        setSelectedScheduleTime("")
      }
    } catch (error) {
      console.error("Error scheduling booking:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-accent-foreground font-bold text-lg">O</span>
          </div>
          <p className="text-muted-foreground">Loading quote details...</p>
        </div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Quote not found</p>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif font-bold text-3xl text-primary">
            Quote #{quote.id.toString().padStart(6, "0")}
          </h1>
          <p className="text-muted-foreground">
            Customer: {quote.user_name} ({quote.user_email})
          </p>
        </div>
        <Badge className={getStatusColor(quote.status)}>
          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quote Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Property Type</Label><p className="font-medium capitalize">{quote.property_type}</p></div>
                <div><Label>Cleaning Type</Label><p className="font-medium capitalize">{quote.cleaning_type.replace("_", " ")}</p></div>
                <div><Label>Bedrooms</Label><p className="font-medium">{quote.bedrooms}</p></div>
                <div><Label>Bathrooms</Label><p className="font-medium">{quote.bathrooms}</p></div>
                <div><Label>Square Footage</Label><p className="font-medium">{quote.square_footage || "N/A"}</p></div>
                <div><Label>Cleaning Frequency</Label><p className="font-medium">{quote.cleaning_frequency || "N/A"}</p></div>
                <div><Label>Pets in Home</Label><p className="font-medium">{quote.has_pets ? "Yes" : "No"}</p></div>
                <div><Label>Requested Date</Label><p className="font-medium">{quote.desired_date ? new Date(quote.desired_date).toLocaleDateString() : "N/A"}</p></div>
              </div>

              <div>
                <Label>Special Instructions</Label>
                <p className="font-medium mt-1 p-3 bg-muted rounded-md">
                  {quote.special_instructions || "None"}
                </p>
              </div>

              <div>
                <Label>Available Dates</Label>
                <div className="mt-2 space-y-1">
                  {quote.desired_date1 && (
                    <p className="text-sm">• {new Date(quote.desired_date1).toLocaleDateString()}</p>
                  )}
                  {quote.desired_date2 && (
                    <p className="text-sm">• {new Date(quote.desired_date2).toLocaleDateString()}</p>
                  )}
                  {quote.desired_date3 && (
                    <p className="text-sm">• {new Date(quote.desired_date3).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                placeholder="Add internal notes about this quote..."
              />
              <Button onClick={handleSaveNotes} className="mt-4" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Notes"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Pricing & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    laundry: "Laundry",
                    folding_clothes: "Folding Clothes",
                    fridge_cleaning: "Fridge Cleaning",
                    baseboard_cleaning: "Baseboard Cleaning",
                    cabinet_cleaning: "Cabinet Cleaning",
                    window_cleaning: "Window Cleaning"
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

              {quote.suggested_price && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-lg">Customer Suggested Price</Label>
                    <span className="text-xl font-bold text-blue-600">${quote.suggested_price}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">

              {(quote?.status === 'paid' || quote?.status === 'scheduled') && (
                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-semibold">Assign to Cleaner</h4>

                  <div className="space-y-2">
                    <Label>Select Cleaner</Label>
                    <Select value={selectedCleaner} onValueChange={setSelectedCleaner}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a cleaner" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCleaners.map((cleaner) => (
                          <SelectItem key={cleaner.id} value={cleaner.id.toString()}>
                            {cleaner.business_name} - {cleaner.user_name}
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
                      value={assignmentAmount}
                      onChange={(e) => setAssignmentAmount(e.target.value)}
                      placeholder="Enter payment amount"
                    />
                  </div>

                  <Button
                    onClick={handleAssignCleaner}
                    disabled={!selectedCleaner || !assignmentAmount}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    Assign Cleaner
                  </Button>
                </div>
              )}

              {quote.status === "quoted" || quote.status === "pending" && (
                <Button
                  onClick={handleSubmitQuote}
                  className="w-full bg-accent"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Quote"}
                </Button>
              )}


              {quote.status === "quoted" && (
                <Button
                  onClick={handleSubmitQuote}
                  className="w-full bg-accent"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Quote"}
                </Button>
              )}



              {quote.status === "quoted" && (
                <Button
                  onClick={handleAcceptQuote}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Accepting..." : "Accept Quote"}
                </Button>
              )}

              {/* ADD THIS BUTTON: Mark as Paid */}
              {quote.status === "accepted" && (
                <Button
                  onClick={handleMarkAsPaid}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Mark as Paid"}
                </Button>
              )}

              {(quote.status === "accepted" || quote.status === "paid") && (
                <Button
                  onClick={() => setSchedulingModalOpen(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  Schedule Cleaning
                </Button>
              )}

              <Button variant="outline" className="w-full" asChild>
                <a href={`mailto:${quote.user_email}?subject=Quote #${quote.id.toString().padStart(6, "0")}`}>
                  Email Customer
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scheduling Modal */}
      <Dialog open={schedulingModalOpen} onOpenChange={setSchedulingModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Cleaning</DialogTitle>
            <DialogDescription>
              Schedule a cleaning date for {quote.user_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Select onValueChange={setSelectedScheduleDate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a date" />
                </SelectTrigger>
                <SelectContent>
                  {quote.desired_date1 && (
                    <SelectItem value={quote.desired_date1}>
                      {new Date(quote.desired_date1).toLocaleDateString()}
                    </SelectItem>
                  )}
                  {quote.desired_date2 && (
                    <SelectItem value={quote.desired_date2}>
                      {new Date(quote.desired_date2).toLocaleDateString()}
                    </SelectItem>
                  )}
                  {quote.desired_date3 && (
                    <SelectItem value={quote.desired_date3}>
                      {new Date(quote.desired_date3).toLocaleDateString()}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Time</Label>
              <Select onValueChange={setSelectedScheduleTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time" />
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
              disabled={!selectedScheduleDate || !selectedScheduleTime || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Scheduling..." : "Confirm Schedule"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}