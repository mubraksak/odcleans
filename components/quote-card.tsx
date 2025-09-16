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
  
 
  //pets: string
  id: number
  propertyType: string
  bedrooms: number
  bathrooms: number
  cleaning_type: string
  status: string
  total_price?: number
  desired_date1: string | number | Date
  desired_date3: string | number | Date
  desired_date2: string | number | Date
  special_instructions?: string
  created_at: string
  bookingId?: number
  scheduled_date: string | number | Date
  bookingStatus?: string
  admin_notes?: string
  additional_service_types?: string
  additional_services?: AdditionalService[] | string // Can be array or string (for parsing)
  square_footage: string
  cleaning_frequency: string
  has_pets: string
   base_price: number
}

interface QuoteCardProps {
  quote: Quote
  onUpdate: () => void
  onEdit?: (quote: Quote) => void // Add this prop for edit functionality
}

export function QuoteCard({ quote, onUpdate, onEdit }: QuoteCardProps) {
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

  const hasPets = (has_pets: string) =>{
    switch(has_pets){
       case "0":
        return "yes"
      case "1":
        return "no"
      default : 
        return has_pets

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
  if (!confirm("Are you sure you want to accept this quote?")) {
    return
  }

    //  if (!scheduledDate) {
    //   setShowScheduling(true)
    //   return
    // }

    setIsLoading(true)
  try {
    const response = await fetch(`/api/user/quotes/${quote.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "accept",
      }),
    })

    if (response.ok) {
      onUpdate()
      alert("Quote accepted successfully! You can now schedule the cleaning.")
    } else {
      alert("Failed to accept quote. Please try again.")
    }
  } catch (error) {
    console.error("Accept error:", error)
    alert("An error occurred while accepting the quote")
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
       console.log("Declining quote:", quote.id)
      const response = await fetch(`/api/user/quotes/${quote.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "decline",
        }),
      })
      const responseData = await response.json()
      console.log("Decline response:", response.status, responseData)
      if (response.ok) {
        onUpdate()
      } else {
        alert(`Failed to decline quote: ${responseData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Decline error:", error)
      alert("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

   const handleEdit = () => {
    if (onEdit) {
      onEdit(quote)
    }
  }


  return (
    <Card className="border-border/50 relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg text-primary">Quote #{quote.id.toString().padStart(6, "0")}</CardTitle>
            <CardDescription>
              <h1 className="text-lg font-bold text-dark"> service Type :{getCleaningTypeDisplay(quote.cleaning_type)} for {quote.propertyType === "Residencial" ? "🏠 Residencial" : "🏢 Commercial"}  Building</h1>
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
            <p className="text-muted-foreground">Rooms</p>
            <p className="font-semibold">{quote.bedrooms}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Bathrooms</p>
            <p className="font-semibold">{quote.bathrooms}</p>
          </div>


          <div>
            <p className="text-muted-foreground">Square Meters</p>
            <p className="font-semibold">{quote.square_footage}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cleaning Type</p>
            <p className="font-semibold">{quote.cleaning_type} cleaning</p>
          </div>


          
          <div>
            <p className="text-muted-foreground">Frequent Cleaning </p>
            <p className="font-semibold">{quote.cleaning_frequency}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Pets</p>
          <h1 className="text-lg font-bold text-dark">  {quote.has_pets == "1" ? "🐱 YES" : "🐶 NO"} </h1>
            {/* <p className="font-semibold">{quote.has_pets} </p> */}
          </div>


          {/* DESIRED DATE SECTION */}
<div className="space-y-6 p-0 bg-accent/5 rounded-lg border border-accent/20 col-span-2">
  {quote.status === 'scheduled' && quote?.scheduled_date ? (
    // Show scheduled date and time when status is scheduled
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <p className="text-green-800 font-semibold text-sm">Scheduled Service</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-green-600 text-sm">Scheduled Date</p>
          <p className="font-semibold text-green-800">
            {new Date(quote.scheduled_date).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-green-600 text-sm">Scheduled Time</p>
          <p className="font-semibold text-green-800">
            {new Date(quote.scheduled_date).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  ) : (
    // Show desired dates when not scheduled
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-muted-foreground text-sm">Desired Date 1</p>
          <p className="font-semibold">
            {quote.desired_date1 ? new Date(quote.desired_date1).toLocaleDateString() : 'Not specified'}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Desired Date 2</p>
          <p className="font-semibold">
            {quote.desired_date2 ? new Date(quote.desired_date2).toLocaleDateString() : 'Not specified'}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Desired Date 3</p>
          <p className="font-semibold">
            {quote.desired_date3 ? new Date(quote.desired_date3).toLocaleDateString() : 'Not specified'}
          </p>
        </div>
      </div>
      
      {quote.desired_date1 && (
        <div>
          <p className="text-muted-foreground text-sm">Desired Time</p>
          <p className="font-semibold">
            {new Date(quote.desired_date1).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      )}
    </>
  )}
</div>


        </div>
        {/* DESIRED DATE SECTION  */}


        

        {/* pricing Section */}
     
          <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
            <h3 className="text-lg font-bold  mb-2 text-accent">Pricing</h3>
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{getServiceTypeDisplay(quote.cleaning_type)}</span>
                  <span className="text-sm font-semibold">${quote.base_price}</span>
                </div>
            </div>
          </div>
       


        {/* Additional Services */}
        {additionalServices.length > 0 && (
          <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
            <h3 className="text-lg font-bold  mb-2 text-accent">Additional Services</h3>
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
                  {quote.scheduled_date ? new Date(quote.scheduled_date).toLocaleString() : "Not scheduled"}
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
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={handleAccept}
          disabled={isLoading}
          className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground min-w-[120px]"
        >
          {isLoading ? "Processing..." : "Accept Quote"}
        </Button>
        <Button
          onClick={handleDecline}
          disabled={isLoading}
          variant="outline"
          className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground min-w-[120px]"
        >
          {isLoading ? "Processing..." : "Decline"}
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