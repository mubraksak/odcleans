"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QuoteCard } from "./quote-card"
import Link from "next/link"
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
  propertyType: string
  bedrooms: number
  bathrooms: number
  cleaningType: string
  status: string
  proposedPrice?: number
  desired_date1: string
  desired_date2: string
  desired_date3: string
  specialInstructions?: string
  created_at: string
  bookingId?: number
  scheduledDate?: string
  bookingStatus?: string
  adminNote: string
  cleaning_type: string 
  square_footage: string
  cleaning_frequency: string
  has_pets: string
  base_price: number
  total_price?: number
  additional_services?: AdditionalService[] | string
  scheduled_date: any
  customer_email: string
  customer_name: string
}

export function UserDashboard() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [suggestedPrice, setSuggestedPrice] = useState("")
  const [userNotes, setUserNotes] = useState("")
  const [additionalServices, setAdditionalServices] = useState<{ [key: string]: boolean }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)


 const [existingServices, setExistingServices] = useState<AdditionalService[]>([])
  
  const fetchQuotes = async () => {
    try {
      const response = await fetch("/api/user/quotes")
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

  
  // Function to fetch quote details with additional services
  const fetchQuoteDetails = async (quoteId: number) => {
    try {
      const response = await fetch(`/api/user/quotes/${quoteId}`)
      if (response.ok) {
        const data = await response.json()
        return data.quote
      }
    } catch (error) {
      console.error("Error fetching quote details:", error)
    }
    return null
  }

  useEffect(() => {
    fetchQuotes()
  }, [])

  useEffect(() => {
    if (editingQuote) {
      // Fetch the full quote details including additional services
      fetchQuoteDetails(editingQuote.id).then(quoteDetails => {
        if (quoteDetails) {
          setSuggestedPrice(quoteDetails.total_price?.toString() || "")
          setUserNotes(quoteDetails.specialInstructions || "")
          
          // Set existing services
          setExistingServices(quoteDetails.additional_services || [])
          
          // Initialize checkboxes based on existing services
          const initialServices: { [key: string]: boolean } = {}
          if (quoteDetails.additional_services) {
            quoteDetails.additional_services.forEach((service: AdditionalService) => {
              initialServices[service.service_type] = true
            })
          }
          setAdditionalServices(initialServices)
        }
      })
    }
  }, [editingQuote])



  const parseAdditionalServices = (services: any): AdditionalService[] => {
    if (Array.isArray(services)) return services
    if (typeof services === 'string') {
      try {
        return services.split(',').map(serviceStr => {
          const [service_type, priceStr] = serviceStr.split(':')
          return { service_type, price: parseFloat(priceStr) || 0 }
        })
      } catch (error) {
        console.error('Error parsing services:', error)
      }
    }
    return []
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
// Calculate total price based on base price + selected services
  const calculateTotalPrice = () => {
    const base = Number(editingQuote?.base_price) || 0
    const additional = Object.entries(additionalServices).reduce((total, [serviceType, isSelected]) => {
      if (isSelected) {
        return total + Number(getServicePrice(serviceType))
      }
      return total
    }, 0)
    return additional + base
  }

  const handleServiceToggle = (serviceType: string, checked: boolean) => {
    setAdditionalServices(prev => ({ ...prev, [serviceType]: checked }))
  }

  const handleSubmitEdit = async () => {
    if (!editingQuote) return

    setIsSubmitting(true)
    try {
      const selectedServices = Object.entries(additionalServices)
        .filter(([_, isSelected]) => isSelected)
        .map(([serviceType]) => `${serviceType}:${getServicePrice(serviceType)}`)
        .join(',')

      const newTotalPrice = parseFloat(suggestedPrice) || calculateTotalPrice()

      const response = await fetch(`/api/user/quotes/${editingQuote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "counter_offer",
          suggested_price: parseFloat(suggestedPrice) || newTotalPrice,
          user_notes: userNotes,
          additional_services: selectedServices,
          new_total_price: newTotalPrice // Send the new calculated total price
        }),
      })

      if (response.ok) {
        await fetchQuotes()
        setEditingQuote(null)
        setSuggestedPrice("")
        setUserNotes("")
        setAdditionalServices({})
        setExistingServices([])
      }
    } catch (error) {
      console.error("Error updating quote:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const activeQuotes = quotes.filter((q) => q.status === "quoted")
  const pendingQuotes = quotes.filter((q) => q.status === "pending")
  const completedQuotes = quotes.filter((q) => ["accepted", "declined", "scheduled","completed", "counter_offer"].includes(q.status))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mb-4 mx-auto animate-pulse">
            <span className="text-accent-foreground font-bold text-lg">O</span>
          </div>
          <p className="text-muted-foreground">Loading your quotes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="font-serif font-bold text-3xl text-primary mb-2">Your Dashboard</h1>
        <p className="text-muted-foreground">Manage your cleaning service quotes and bookings</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{activeQuotes.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting your response</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pendingQuotes.length}</div>
            <p className="text-xs text-muted-foreground">Being reviewed by our team</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{quotes.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Quotes */}
      {activeQuotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl text-primary">Active Quotes</h2>
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              {activeQuotes.length} awaiting response
            </Badge>
          </div>
          <div className="grid gap-6">
            {activeQuotes.map((quote) => (
              <div key={quote.id} className="relative">
                <QuoteCard quote={quote} onUpdate={fetchQuotes} />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute top-4 right-4"
                  onClick={() => setEditingQuote(quote)}
                >
                  Edit Quote
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Quotes */}
      {pendingQuotes.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-xl text-primary">Pending Review</h2>
          <div className="grid gap-6">
            {pendingQuotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} onUpdate={fetchQuotes} />
            ))}
          </div>
        </div>
      )}

      {/* Quote History */}
      {completedQuotes.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-xl text-primary">Quote History</h2>
          <div className="grid gap-6">
            {completedQuotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} onUpdate={fetchQuotes} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {quotes.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <CardTitle className="text-xl text-primary mb-2">No quotes yet</CardTitle>
            <CardDescription className="mb-6">
              Get started by requesting your first cleaning service quote
            </CardDescription>
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/quote">Request a Quote</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Quote Modal */}
      <Dialog open={!!editingQuote} onOpenChange={() => setEditingQuote(null)}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Edit Quote #{editingQuote?.id.toString().padStart(6, "0")}</DialogTitle>
      <DialogDescription>
        Suggest changes to your cleaning service quote
      </DialogDescription>
    </DialogHeader>

    {editingQuote && (
      <div className="space-y-6">
        {/* Original Quote Details */}
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Original Quote</h3>
          <p>Base Price: ${editingQuote.base_price}</p>
          <p>Total: ${editingQuote.total_price}</p>
          {existingServices.length > 0 && (
            <div className="mt-2">
              <p className="font-medium">Current Services:</p>
              {existingServices.map((service, index) => (
                <p key={index} className="text-sm">
                  - {getServiceName(service.service_type)}: ${service.price}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Suggested Price */}
        <div className="space-y-2">
          <Label htmlFor="suggestedPrice">Your Suggested Total Price ($)</Label>
          <Input
            id="suggestedPrice"
            type="number"
            value={suggestedPrice}
            onChange={(e) => setSuggestedPrice(e.target.value)}
            placeholder="Enter your suggested total price"
          />
          <p className="text-sm text-muted-foreground">
            Original total: ${editingQuote.total_price}
          </p>
        </div>

        {/* Additional Services */}
        <div className="space-y-2">
          <Label>Adjust Additional Services</Label>
          <div className="grid grid-cols-2 gap-2">
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

        {/* Real-time Calculation */}
        <div className="bg-accent/5 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Price Calculation</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Base Cleaning:</span>
              <span>${editingQuote.base_price}</span>
            </div>
            {Object.entries(additionalServices)
              .filter(([_, isSelected]) => isSelected)
              .map(([serviceType]) => (
                <div key={serviceType} className="flex justify-between">
                  <span>{getServiceName(serviceType)}:</span>
                  <span>+${getServicePrice(serviceType)}</span>
                </div>
              ))}
            <div className="border-t pt-1 mt-1 flex justify-between font-semibold">
              <span>Calculated Total:</span>
              <span>${calculateTotalPrice()}</span>
            </div>
          </div>
        </div>

       {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingQuote(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitEdit} 
                  className="flex-1 bg-accent"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Changes"}
                </Button>
              </div>
        {/* ... (rest of your modal) */}
      </div>
    )}
  </DialogContent>
</Dialog>
    </div>
  )
}