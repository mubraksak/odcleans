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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Filter, 
  User, 
  FileText, 
  Clock, 
  CheckCircle, 
  Calendar,
  Menu,
  Home
} from "lucide-react"

interface AdditionalService {
  service_type: string
  price: number
}

interface Quote {
  id: number
  property_type: string
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

interface UserDashboardProps {
  user: {
    id: number
    email: string
    name: string
  }
}

type FilterStatus = 'all' | 'pending' | 'quoted' | 'accepted' | 'paid' | 'scheduled' | 'completed'

export function UserDashboard({ user }: UserDashboardProps) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [suggestedPrice, setSuggestedPrice] = useState("")
  const [userNotes, setUserNotes] = useState("")
  const [additionalServices, setAdditionalServices] = useState<{ [key: string]: boolean }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingServices, setExistingServices] = useState<AdditionalService[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Client-side session verification
  useEffect(() => {
    const verifyClientSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
          credentials: "include"
        })
        
        if (!response.ok) {
          console.log("Session invalid, redirecting to login")
          window.location.href = "/login"
          return
        }
        
        const data = await response.json()
        console.log("Client session verified for user:", data.user?.email)
      } catch (error) {
        console.error("Client session verification failed:", error)
        window.location.href = "/login"
      }
    }

    verifyClientSession()
  }, [])

  const fetchQuotes = async () => {
    try {
      const response = await fetch("/api/user/quotes")
      if (response.ok) {
        const data = await response.json()
        const quotesWithCustomerData = data.quotes.map((quote: any) => ({
          ...quote,
          customer_email: quote.customer_email || user.email,
          customer_name: quote.customer_name || user.name,
        }))
        setQuotes(quotesWithCustomerData)
      }
    } catch (error) {
      console.error("Error fetching quotes:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuoteDetails = async (quoteId: number) => {
    try {
      const response = await fetch(`/api/user/quotes/${quoteId}`)
      if (response.ok) {
        const data = await response.json()
        return data.quote
      } else if (response.status === 401) {
        window.location.href = "/login"
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
      fetchQuoteDetails(editingQuote.id).then(quoteDetails => {
        if (quoteDetails) {
          setSuggestedPrice(quoteDetails.total_price?.toString() || "")
          setUserNotes(quoteDetails.specialInstructions || "")
          setExistingServices(quoteDetails.additional_services || [])
          
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
          new_total_price: newTotalPrice
        }),
      })

      if (response.ok) {
        await fetchQuotes()
        setEditingQuote(null)
        setSuggestedPrice("")
        setUserNotes("")
        setAdditionalServices({})
        setExistingServices([])
      } else if (response.status === 401) {
        window.location.href = "/login"
      }
    } catch (error) {
      console.error("Error updating quote:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter quotes based on active filter
  const filteredQuotes = quotes.filter(quote => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'accepted') return ['accepted', 'paid'].includes(quote.status)
    return quote.status === activeFilter
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary'
      case 'quoted': return 'default'
      case 'accepted': return 'default'
      case 'paid': return 'default'
      case 'scheduled': return 'secondary'
      case 'completed': return 'default'
      case 'declined': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'quoted': return <FileText className="h-4 w-4" />
      case 'accepted': return <CheckCircle className="h-4 w-4" />
      case 'paid': return <CheckCircle className="h-4 w-4" />
      case 'scheduled': return <Calendar className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Mobile Header */}
      {/* <div className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-primary" />
              <span className="font-serif font-bold text-lg">CleanHome</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile">
              <User className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div> */}

      <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
        {/* Welcome Section */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="hidden lg:flex items-center justify-center space-x-3 mb-4">
            {/* <Home className="h-8 w-8 text-primary" /> */}
            <img src="/logo.png" width="100px" height="150px" alt="OD Cleaning Services Logo" />
            <h1 className="font-serif font-bold text-4xl text-primary">OD Cleaning Services</h1>
          </div>
          <h2 className="font-serif font-bold text-2xl lg:text-3xl text-primary mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-muted-foreground text-sm lg:text-base">
            Manage your cleaning service quotes and bookings
          </p>
        </div>

        {/* Quick Stats - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2 lg:pb-3 px-3 lg:px-6">
              <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground flex items-center">
                <FileText className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 lg:px-6 pb-3 lg:pb-6">
              <div className="text-xl lg:text-2xl font-bold text-primary">{quotes.length}</div>
              <p className="text-xs text-muted-foreground hidden lg:block">All requests</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2 lg:pb-3 px-3 lg:px-6">
              <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 lg:px-6 pb-3 lg:pb-6">
              <div className="text-xl lg:text-2xl font-bold text-primary">
                {quotes.filter(q => q.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground hidden lg:block">Under review</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2 lg:pb-3 px-3 lg:px-6">
              <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground flex items-center">
                <FileText className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                Active
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 lg:px-6 pb-3 lg:pb-6">
              <div className="text-xl lg:text-2xl font-bold text-primary">
                {quotes.filter(q => ['quoted', 'accepted'].includes(q.status)).length}
              </div>
              <p className="text-xs text-muted-foreground hidden lg:block">Awaiting action</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2 lg:pb-3 px-3 lg:px-6">
              <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground flex items-center">
                <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 lg:px-6 pb-3 lg:pb-6">
              <div className="text-xl lg:text-2xl font-bold text-primary">
                {quotes.filter(q => ['completed', 'paid', 'scheduled'].includes(q.status)).length}
              </div>
              <p className="text-xs text-muted-foreground hidden lg:block">Finished jobs</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-lg lg:text-xl text-primary flex items-center">
              <Filter className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
              Filter Quotes
            </h3>
            <Badge variant="secondary" className="hidden lg:flex">
              {filteredQuotes.length} found
            </Badge>
          </div>
          
          {/* Mobile Filter - Horizontal Scroll */}
          <div className="lg:hidden overflow-x-auto pb-2">
            <div className="flex space-x-2 min-w-max">
              {[
                { value: 'all' as FilterStatus, label: 'All', count: quotes.length },
                { value: 'pending', label: 'Pending', count: quotes.filter(q => q.status === 'pending').length },
                { value: 'quoted', label: 'Quoted', count: quotes.filter(q => q.status === 'quoted').length },
                { value: 'accepted', label: 'Accepted/Paid', count: quotes.filter(q => ['accepted', 'paid'].includes(q.status)).length },
                { value: 'scheduled', label: 'Scheduled', count: quotes.filter(q => q.status === 'scheduled').length },
                { value: 'completed', label: 'Completed', count: quotes.filter(q => q.status === 'completed').length },
              ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={activeFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.value as FilterStatus)}
                  className="whitespace-nowrap"
                >
                  {filter.label}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {filter.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Desktop Filter */}
          <div className="hidden lg:flex flex-wrap gap-2">
            {[
              { value: 'all' as FilterStatus, label: 'All Quotes', count: quotes.length },
              { value: 'pending', label: 'Pending Review', count: quotes.filter(q => q.status === 'pending').length },
              { value: 'quoted', label: 'Quoted', count: quotes.filter(q => q.status === 'quoted').length },
              { value: 'accepted', label: 'Accepted & Paid', count: quotes.filter(q => ['accepted', 'paid'].includes(q.status)).length },
              { value: 'scheduled', label: 'Scheduled', count: quotes.filter(q => q.status === 'scheduled').length },
              { value: 'completed', label: 'Completed', count: quotes.filter(q => q.status === 'completed').length },
            ].map((filter) => (
              <Button
                key={filter.value}
                variant={activeFilter === filter.value ? "default" : "outline"}
                onClick={() => setActiveFilter(filter.value as FilterStatus)}
                className="flex items-center space-x-2"
              >
                <span>{filter.label}</span>
                <Badge variant="secondary" className="ml-1">
                  {filter.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Quotes List */}
        {filteredQuotes.length > 0 ? (
          <div className="space-y-4 lg:space-y-6">
            {filteredQuotes.map((quote) => (
              <Card key={quote.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Quote Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between lg:justify-start lg:space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(quote.status)}
                          <span className="font-semibold text-sm lg:text-base">
                            Quote #{quote.id.toString().padStart(6, "0")}
                          </span>
                        </div>
                        <Badge variant={getStatusBadgeVariant(quote.status)} className="text-xs">
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Property:</span>
                          <p className="font-medium">{quote.property_type}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cleaning:</span>
                          <p className="font-medium">{quote.cleaning_type}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total:</span>
                          <p className="font-medium text-primary">${quote.total_price}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date:</span>
                          <p className="font-medium">
                            {new Date(quote.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2">
                      <Button 
                        asChild
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                      >
                        <Link href={`/dashboard/quotes/${quote.id}`}>
                          View Details
                        </Link>
                      </Button>
                      
                      {/* Show Edit button only for quoted status */}
                      {quote.status === 'quoted' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingQuote(quote)}
                          className="flex-1"
                        >
                          Edit Quote
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="text-center py-12 lg:py-16 shadow-sm">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl text-primary mb-2">
                No quotes found
              </CardTitle>
              <CardDescription className="mb-6 max-w-md mx-auto">
                {activeFilter === 'all' 
                  ? "Get started by requesting your first cleaning service quote"
                  : `No quotes with status "${activeFilter}" found`
                }
              </CardDescription>
              {activeFilter === 'all' && (
                <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Link href="/quote">Request a Quote</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Mobile Navigation Menu */}
        {/* <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-[280px] sm:w-[300px]">
            <SheetHeader>
              <SheetTitle className="flex items-center space-x-2">
                <Home className="h-6 w-6 text-primary" />
                <span>CleanHome</span>
              </SheetTitle>
            </SheetHeader>
            <div className="mt-8 space-y-4">
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/quote" onClick={() => setMobileMenuOpen(false)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Request Quote
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet> */}

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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
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
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}