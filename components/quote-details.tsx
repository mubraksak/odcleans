"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ArrowLeft, Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface AdditionalService {
  service_type: string
  price: number
}

interface QuoteImage {
  id: number
  image_url: string
  image_name: string
  image_size: number
  uploaded_at: string
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
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [images, setImages] = useState<QuoteImage[]>([])
  const [loading, setLoading] = useState(true)
  const [basePrice, setBasePrice] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [additionalServices, setAdditionalServices] = useState<{ [key: string]: boolean }>({})
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [schedulingModalOpen, setSchedulingModalOpen] = useState(false)
  const [selectedScheduleDate, setSelectedScheduleDate] = useState("")
  const [selectedScheduleTime, setSelectedScheduleTime] = useState("")

  const fetchQuoteDetails = async () => {
    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}`)
      if (response.ok) {
        const data = await response.json()
        setQuote(data.quote)
        setBasePrice(data.quote.base_price?.toString() || data.quote.proposed_price?.toString() || "")
        setAdminNotes(data.quote.admin_notes || "")
        
        const initialServices: { [key: string]: boolean } = {}
        if (data.quote.additional_services) {
          const services = Array.isArray(data.quote.additional_services) 
            ? data.quote.additional_services 
            : parseAdditionalServices(data.quote.additional_services)
          
          services.forEach((service: AdditionalService) => {
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

  const fetchQuoteImages = async () => {
    try {
      const response = await fetch(`/api/admin/quotes/${quoteId}/images`)
      if (response.ok) {
        const data = await response.json()
        setImages(data.images || [])
      }
    } catch (error) {
      console.error("Error fetching quote images:", error)
    }
  }

  useEffect(() => {
    fetchQuoteDetails()
    fetchQuoteImages()
  }, [quoteId])

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
      case "scheduled": return "bg-purple-100 text-purple-800 border-purple-200"
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

  const isQuoteScheduled = quote?.status === "scheduled"

  const handleSubmitQuote = async () => {
    if (!quote || isQuoteScheduled) return

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
    }
  }

  const handleSaveNotes = async () => {
    if (!quote || isQuoteScheduled) return

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
    }
  }

  const handleAcceptQuote = async () => {
    if (!quote || isQuoteScheduled) return

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
    }
  }

  const handleScheduleBooking = async () => {
    if (!quote || !selectedScheduleDate || !selectedScheduleTime) return

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
        // Update quote status to scheduled
        await fetch(`/api/admin/quotes/${quote.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "scheduled",
          }),
        })
        
        await fetchQuoteDetails()
        setSchedulingModalOpen(false)
        setSelectedScheduleDate("")
        setSelectedScheduleTime("")
      }
    } catch (error) {
      console.error("Error scheduling booking:", error)
    }
  }

  const nextImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
    }
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading quote details...</div>
  }

  if (!quote) {
    return <div className="text-center py-8">Quote not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/admin/quotes")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="font-serif font-bold text-3xl text-primary">
            Quote #{quote.id.toString().padStart(6, "0")}
          </h1>
          <p className="text-muted-foreground">
            Customer: {quote.user_name} ({quote.user_email})
          </p>
        </div>
        <Badge className={`ml-auto ${getStatusColor(quote.status)}`}>
          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quote Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Property Type</Label><p className="font-medium capitalize">{quote.property_type}</p></div>
                <div><Label>Cleaning Type</Label><p className="font-medium capitalize">{quote.cleaning_type.replace("_", " ")}</p></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label>Bedrooms</Label><p className="font-medium">{quote.bedrooms}</p></div>
                <div><Label>Bathrooms</Label><p className="font-medium">{quote.bathrooms}</p></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label>Square Footage</Label><p className="font-medium">{quote.square_footage || "N/A"}</p></div>
                <div><Label>Cleaning Frequency</Label><p className="font-medium">{quote.cleaning_frequency || "N/A"}</p></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label>Pets in Home</Label><p className="font-medium">{quote.has_pets ? "Yes" : "No"}</p></div>
                <div><Label>Desired Date</Label><p className="font-medium">{quote.desired_date ? new Date(quote.desired_date).toLocaleDateString() : "N/A"}</p></div>
              </div>

              <div>
                <Label>Special Instructions</Label>
                <p className="font-medium mt-1 p-3 bg-muted rounded-md">{quote.special_instructions || "None"}</p>
              </div>

              {/* Preferred Dates */}
              {(quote.desired_date1 || quote.desired_date2 || quote.desired_date3) && (
                <div>
                  <Label>Preferred Dates</Label>
                  <div className="space-y-1 mt-1">
                    {quote.desired_date1 && (
                      <p className="font-medium">• {new Date(quote.desired_date1).toLocaleDateString()}</p>
                    )}
                    {quote.desired_date2 && (
                      <p className="font-medium">• {new Date(quote.desired_date2).toLocaleDateString()}</p>
                    )}
                    {quote.desired_date3 && (
                      <p className="font-medium">• {new Date(quote.desired_date3).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Images Card */}
          {images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Images</CardTitle>
                <CardDescription>Images uploaded by the customer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div 
                      key={image.id} 
                      className="cursor-pointer group relative"
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <div className="aspect-square relative rounded-md overflow-hidden bg-muted">
                        <img
                          src={image.image_url}
                          alt={image.image_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {image.image_name}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Pricing & Actions */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Actions</CardTitle>
              {isQuoteScheduled && (
                <CardDescription className="text-red-600 font-semibold">
                  This quote has been scheduled and cannot be modified.
                </CardDescription>
              )}
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
                  disabled={isQuoteScheduled}
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
                        disabled={isQuoteScheduled}
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
                    <Label className="text-lg">Suggested Price</Label>
                    <span className="text-2xl font-bold text-accent">${quote.suggested_price}</span>
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
                  disabled={isQuoteScheduled}
                />
              </div>

              {!isQuoteScheduled && (
                <div className="flex flex-col gap-2 pt-4">
                  <Button onClick={handleSaveNotes} variant="outline">
                    Save Notes
                  </Button>
                  {quote.status === "quoted" && (
                    <Button onClick={handleAcceptQuote} className="bg-green-600 hover:bg-green-700">
                      Accept Quote
                    </Button>
                  )}
                  <Button onClick={handleSubmitQuote} className="bg-accent">
                    Submit Quote
                  </Button>
                </div>
              )}

              {quote.status === "accepted" && !isQuoteScheduled && (
                <Button 
                  onClick={() => setSchedulingModalOpen(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Schedule Booking
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Viewer Dialog */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={() => setSelectedImageIndex(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <div className="relative h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10"
              onClick={() => setSelectedImageIndex(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            
            {selectedImageIndex !== null && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 z-10"
                  onClick={prevImage}
                  disabled={selectedImageIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="h-full flex items-center justify-center">
                  <img
                    src={images[selectedImageIndex].image_url}
                    alt={images[selectedImageIndex].image_name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 z-10"
                  onClick={nextImage}
                  disabled={selectedImageIndex === images.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Scheduling Modal */}
      <Dialog open={schedulingModalOpen} onOpenChange={setSchedulingModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Booking</DialogTitle>
            <DialogDescription>
              Select a date and time for the cleaning service
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Available Dates</Label>
              <Select onValueChange={setSelectedScheduleDate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a date" />
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
        </DialogContent>
      </Dialog>
    </div>
  )
}