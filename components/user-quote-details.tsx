"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { QuoteCard } from "./quote-card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { PaymentPopup } from "./payment/payment-popup"

interface QuoteImage {
  id: number
  image_url: string
  image_name: string
  image_size: number
  uploaded_at: string
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
  additional_services?: any[]
  scheduled_date: any
  customer_email: string
  customer_name: string
  user_email?: string     // Fallback fields
  user_name?: string      // Fallback fields
}

interface UserQuoteDetailsProps {
  quoteId: number
  user: {
    id: number
    email: string
    name: string
  }
}



export function UserQuoteDetails({ quoteId, user }: UserQuoteDetailsProps) {
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [images, setImages] = useState<QuoteImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [showPayment, setShowPayment] = useState(false)


// Add this useEffect to your UserQuoteDetails component
useEffect(() => {




  const verifyClientSession = async () => {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include"
      })
      
      if (!response.ok) {
        window.location.href = "/login"
        return
      }
    } catch (error) {
      console.error("Client session verification failed:", error)
      window.location.href = "/login"
    }
  }

  verifyClientSession()
}, [])



  const fetchQuoteDetails = async () => {
    try {
      const response = await fetch(`/api/user/quotes/${quoteId}`)
      if (response.ok) {
        const data = await response.json()
        setQuote(data.quote)
      } else {
        console.error("Failed to fetch quote details")
      }
    } catch (error) {
      console.error("Error fetching quote details:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuoteImages = async () => {
    try {
      const response = await fetch(`/api/user/quotes/${quoteId}/images`)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "quoted": return "bg-blue-100 text-blue-800 border-blue-200"
      case "accepted": return "bg-green-100 text-green-800 border-green-200"
      case "declined": return "bg-red-100 text-red-800 border-red-200"
      case "completed": return "bg-gray-100 text-gray-800 border-gray-200"
      case "scheduled": return "bg-purple-100 text-purple-800 border-purple-200"
      case "counter_offer": return "bg-orange-100 text-orange-800 border-orange-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
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
        <Button onClick={() => router.push("/dashboard")} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="font-serif font-bold text-3xl text-primary">
            Quote #{quote.id.toString().padStart(6, "0")}
          </h1>
          <p className="text-muted-foreground">
            View your quote details and uploaded images
          </p>
        </div>
        <Badge className={`ml-auto ${getStatusColor(quote.status)}`}>
          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1).replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quote Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <QuoteCard quote={quote} onUpdate={fetchQuoteDetails} showActions={true} />
            </CardContent>
          </Card>

          {/* Property Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><strong>Property Type:</strong> {quote.propertyType}</div>
                <div><strong>Cleaning Type:</strong> {quote.cleaning_type?.replace("_", " ") || quote.cleaningType}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><strong>Bedrooms:</strong> {quote.bedrooms}</div>
                <div><strong>Bathrooms:</strong> {quote.bathrooms}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><strong>Square Footage:</strong> {quote.square_footage || "N/A"}</div>
                <div><strong>Cleaning Frequency:</strong> {quote.cleaning_frequency || "N/A"}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><strong>Pets in Home:</strong> {quote.has_pets ? "Yes" : "No"}</div>
                <div><strong>Base Price:</strong> ${quote.base_price || 0}</div>
              </div>

              {quote.total_price && (
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Total Price:</strong> ${quote.total_price}</div>
                </div>
              )}

              {quote.specialInstructions && (
                <div>
                  <strong>Special Instructions:</strong>
                  <p className="mt-1 p-3 bg-muted rounded-md">{quote.specialInstructions}</p>
                </div>
              )}

              {/* Preferred Dates */}
              {(quote.desired_date1 || quote.desired_date2 || quote.desired_date3) && (
                <div>
                  <strong>Preferred Dates:</strong>
                  <div className="space-y-1 mt-1">
                    {quote.desired_date1 && (
                      <p>• {new Date(quote.desired_date1).toLocaleDateString()}</p>
                    )}
                    {quote.desired_date2 && (
                      <p>• {new Date(quote.desired_date2).toLocaleDateString()}</p>
                    )}
                    {quote.desired_date3 && (
                      <p>• {new Date(quote.desired_date3).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uploaded Images Card */}
          {images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Uploaded Images</CardTitle>
                <CardDescription>Images you provided for this quote</CardDescription>
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

          {images.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No images uploaded for this quote</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className={`text-lg py-2 ${getStatusColor(quote.status)}`}>
                  {quote.status.charAt(0).toUpperCase() + quote.status.slice(1).replace('_', ' ')}
                </Badge>
              </div>
              
              {quote.created_at && (
                <div>
                  <strong>Request Date:</strong>
                  <p>{new Date(quote.created_at).toLocaleDateString()}</p>
                </div>
              )}

              {quote.scheduled_date && (
                <div>
                  <strong>Scheduled Date:</strong>
                  <p>{new Date(quote.scheduled_date).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                Back to Dashboard
              </Button>
              <Button 
                className="w-full bg-accent"
                onClick={() => router.push("/quote")}
              >
                Request New Quote
              </Button>
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



{/*             
{showPayment && (
  <PaymentPopup
    quoteId={quote.id}
    amount={quote.total_price || 0}
    customerEmail={quote.customer_email || quote.user_email || "user@example.com"}
    customerName={quote.customer_name || quote.user_name || "Customer"}
    isOpen={showPayment}
    onClose={() => setShowPayment(false)}
    onSuccess={() => {
      setShowPayment(false)
      // Refresh the quote details to show updated status
      fetchQuoteDetails()
      // Show success message
      alert("Payment successful! Your cleaning service has been confirmed.")
    }}
  />
)}


// Add a Pay Now button in your quote details
{quote.status === "quoted" && quote.total_price && quote.total_price > 0 && (
  <Card>
    <CardHeader>
      <CardTitle>Ready to Book?</CardTitle>
      <CardDescription>
        Secure your cleaning service by completing payment
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-2xl font-bold text-accent">${quote.total_price}</p>
          <p className="text-sm text-muted-foreground">Total amount due</p>
        </div>
        <Button 
          onClick={() => setShowPayment(true)}
          className="bg-green-600 hover:bg-green-700"
          size="lg"
        >
          Pay Now
        </Button>
      </div>
    </CardContent>
  </Card>
)} */}

    </div>





  )
}