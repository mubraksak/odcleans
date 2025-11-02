"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Create a separate component that uses useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const quoteId = searchParams.get('quote_id')
  const [quoteDetails, setQuoteDetails] = useState<any>(null)

  useEffect(() => {
    if (quoteId) {
      fetchQuoteDetails()
    }
  }, [quoteId])

  const fetchQuoteDetails = async () => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}`)
      if (response.ok) {
        const data = await response.json()
        setQuoteDetails(data)
      }
    } catch (error) {
      console.error('Error fetching quote details:', error)
    }
  }

  const handleDownloadReceipt = async () => {
    // Implement receipt download
    console.log('Download receipt for quote:', quoteId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Payment Successful!
          </CardTitle>
          <CardDescription>
            Thank you for your payment. Your cleaning service has been confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {quoteDetails && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Quote #:</span>
                <span className="font-semibold">{quoteId}</span>
              </div>
              <div className="flex justify-between">
                <span>Service:</span>
                <Badge variant="secondary">
                  {quoteDetails.cleaningType?.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="font-semibold text-green-600">
                  ${quoteDetails.totalPrice}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Button className="w-full" onClick={handleDownloadReceipt}>
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
            <Button variant="outline" className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Email Confirmation
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <a href="/">Return to Home</a>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            A confirmation email has been sent to your email address with all the details.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Main component with Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <div className="text-center">Loading payment details...</div>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}