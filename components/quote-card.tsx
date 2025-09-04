"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AdditionalService {
  service_type: string
  price: number
}

interface Quote {
  id: number
  propertyType: string
  bedrooms: number
  bathrooms: number
  cleaningType: string
  status: string
  total_price?: number
  desired_date: string
  special_instructions?: string
  created_at: string
  bookingId?: number
  scheduledDate?: string
  bookingStatus?: string
  admin_notes?: string
  additional_service_types?: string
  additional_services?: AdditionalService[] | string // Can be array or string (for parsing)
}

interface QuoteCardProps {
  quote: Quote
  onUpdate: () => void
}

export function QuoteCard({ quote, onUpdate }: QuoteCardProps) {
  const [isAccepting, setIsAccepting] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  const [showScheduling, setShowScheduling] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Parse additional services if they're in string format
  const parseAdditionalServices = (services: any): AdditionalService[] => {
    if (Array.isArray(services)) {
      return services // Already parsed
    }
    
    if (typeof services === 'string') {
      try {
        return services.split(';').map(service => {
          const [service_type, price] = service.split(':')
          return { 
            service_type: service_type || 'Unknown', 
            price: parseFloat(price) || 0 
          }
        }).filter(service => service.service_type !== 'Unknown')
      } catch (error) {
        console.error('Error parsing additional services:', error)
        return []
      }
    }
    
    return []
  }

  const additionalServices = parseAdditionalServices(quote.additional_services || quote.additional_service_types)

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
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCleaningTypeDisplay = (type: string) => {
    switch (type) {
      case "standard":
        return "Standard Cleaning"
      case "deep":
        return "Deep Cleaning"
      case "post_construction":
        return "Post-Construction"
      default:
        return type
    }
  }

  const getServiceTypeDisplay = (serviceType: string) => {
    const serviceNames: { [key: string]: string } = {
      laundry: "Laundry",
      folding_clothes: "Folding Clothes",
      fridge_cleaning: "Fridge Cleaning",
      baseboard_cleaning: "Baseboard Cleaning",
      cabinet_cleaning: "Cabinet Cleaning",
      window_cleaning: "Window Cleaning"
    }
    return serviceNames[serviceType] || serviceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const handleAccept = async () => {
    if (!scheduledDate) {
      setShowScheduling(true)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/user/quotes/${quote.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "accept",
          scheduledDate,
        }),
      })

      if (response.ok) {
        onUpdate()
      } else {
        alert("Failed to accept quote")
      }
    } catch (error) {
      alert("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecline = async () => {
    if (!confirm("Are you sure you want to decline this quote?")) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/user/quotes/${quote.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "decline",
        }),
      })

      if (response.ok) {
        onUpdate()
      } else {
        alert("Failed to decline quote")
      }
    } catch (error) {
      alert("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg text-primary">Quote #{quote.id.toString().padStart(6, "0")}</CardTitle>
            <CardDescription>
              <h1>{getCleaningTypeDisplay(quote.cleaningType)} • {quote.propertyType === "home" ? "🏠 Home" : "🏢 Office"}</h1>
            </CardDescription>
          </div>
          <Badge className={getStatusColor(quote.status)}>
            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quote Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Bedrooms</p>
            <p className="font-semibold">{quote.bedrooms}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Bathrooms</p>
            <p className="font-semibold">{quote.bathrooms}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Desired Date</p>
            <p className="font-semibold">{new Date(quote.desired_date).toLocaleDateString()}</p>
          </div>
          {quote.desired_date && (
            <div>
              <p className="text-muted-foreground">Desired Time</p>
              <p className="font-semibold">{new Date(quote.desired_date).toLocaleTimeString()}</p>
            </div>
          )}
        </div>

        {/* Additional Services */}
        {additionalServices.length > 0 && (
          <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
            <p className="text-sm text-muted-foreground mb-2">Additional Services</p>
            <div className="space-y-1">
              {additionalServices.map((service, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{getServiceTypeDisplay(service.service_type)}</span>
                  <span className="text-sm font-semibold">${service.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {quote.total_price && (
          <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
            <p className="text-sm text-muted-foreground mb-1">Total Price</p>
            <p className="text-2xl font-bold text-accent">${quote.total_price}</p>
          </div>
        )}

        {quote.special_instructions && (
          <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
            <p className="text-sm text-muted-foreground mb-1">Special Instructions</p>
            <p className="text-sm bg-muted p-3 rounded-md">{quote.special_instructions}</p>
          </div>
        )}

        {quote.admin_notes && (
          <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
            <p className="text-sm text-muted-foreground mb-1">Admin Note</p>
            <p className="text-sm bg-muted p-3 rounded-md">{quote.admin_notes}</p>
          </div>
        )}

        {/* Booking Information */}
        {quote.bookingId && (
          <div className="bg-card p-4 rounded-lg border">
            <h4 className="font-semibold text-primary mb-2">Booking Details</h4>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Scheduled Date</p>
                <p className="font-semibold">
                  {quote.scheduledDate ? new Date(quote.scheduledDate).toLocaleString() : "Not scheduled"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant="secondary">{quote.bookingStatus}</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {quote.status === "quoted" && (
          <>
            <Separator />
            <div className="space-y-4">
              {showScheduling && (
                <div className="space-y-3">
                  <Label htmlFor="scheduledDate">Select Cleaning Date & Time</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <Alert>
                    <AlertDescription>
                      By scheduling this cleaning, you agree to our terms of service and cancellation policy.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleAccept}
                  disabled={isLoading}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isLoading ? "Processing..." : showScheduling ? "Confirm Booking" : "Accept Quote"}
                </Button>
                <Button
                  onClick={handleDecline}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                >
                  Decline
                </Button>
              </div>
            </div>
          </>
        )}

        <div className="text-xs text-muted-foreground">
          Requested on {new Date(quote.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )
}