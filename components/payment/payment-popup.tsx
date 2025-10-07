"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CreditCard, CheckCircle, AlertCircle, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Initialize Stripe with better error handling
//let stripePromise: Promise<any> | null = null

let stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SDl1l5ODYdZSy5GmYyjnclv5NAprwiJ3PhRKTQaLZIJsqTFydNhA1CDn6dC5UHfx2hlUd97Jz8NU0vEzyW9UuHb00jAT3E69L'
    if (!publishableKey) {
      console.error("❌ Stripe publishable key is missing")
      throw new Error("Stripe configuration error: Missing publishable key")
    }
    
    if (publishableKey.startsWith('pk_')) {
      console.error("❌ Invalid Stripe publishable key format")
      throw new Error("Stripe configuration error: Invalid key format")
    }
    
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

interface PaymentPopupProps {
  isOpen: boolean
  onClose: () => void
  quoteId: number
  amount: number
  customerEmail?: string
  customerName?: string
  onPaymentSuccess: (paymentIntentId: string) => void
}

export function PaymentPopup({
  isOpen,
  onClose,
  quoteId,
  amount,
  customerEmail: initialCustomerEmail,
  customerName: initialCustomerName,
  onPaymentSuccess
}: PaymentPopupProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [quoteDetails, setQuoteDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [customerEmail, setCustomerEmail] = useState(initialCustomerEmail || '')
  const [customerName, setCustomerName] = useState(initialCustomerName || '')

  useEffect(() => {
    if (isOpen && quoteId) {
      console.log("🔄 Payment popup opened with:", {
        quoteId,
        amount,
        initialCustomerEmail,
        initialCustomerName
      })
      setCustomerEmail(initialCustomerEmail || '')
      setCustomerName(initialCustomerName || '')
      fetchQuoteDetails()
    } else {
      setQuoteDetails(null)
      setError(null)
      setPaymentStatus('idle')
    }
  }, [isOpen, quoteId, initialCustomerEmail, initialCustomerName, amount])

  const fetchQuoteDetails = async () => {
    setIsLoadingDetails(true)
    setError(null)
    
    try {
      console.log(`📡 Fetching quote details for ID: ${quoteId}`)
      const response = await fetch(`/api/quotes/${quoteId}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log("✅ Quote details fetched:", data)
        setQuoteDetails(data)
        
        if (data.customerEmail && !customerEmail) {
          setCustomerEmail(data.customerEmail)
        }
        if (data.customerName && !customerName) {
          setCustomerName(data.customerName)
        }
      } else {
        console.warn('⚠️ Could not fetch quote details, using provided data')
      }
    } catch (error) {
      console.error('❌ Error fetching quote details:', error)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const validateForm = () => {
    if (!customerEmail) {
      setError("Customer email is required")
      return false
    }
    
    if (!customerEmail.includes('@') || !customerEmail.includes('.')) {
      setError("Please enter a valid email address")
      return false
    }
    
    if (!customerName) {
      setError("Customer name is required")
      return false
    }
    
    if (amount <= 0) {
      setError("Invalid amount")
      return false
    }
    
    return true
  }

  const handlePayment = async () => {
    console.log("🔄 Starting payment process...")
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setPaymentStatus('processing')
    setError(null)

    try {
      // Step 1: Create payment intent
      console.log("📡 Creating payment intent with:", {
        quoteId,
        amount: Math.round(amount * 100),
        customerEmail,
        customerName
      })

      const paymentIntentResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId,
          amount: Math.round(amount * 100),
          customerEmail,
          customerName,
        }),
      })

      const paymentData = await paymentIntentResponse.json()
      console.log("📡 Payment intent response:", {
        status: paymentIntentResponse.status,
        ok: paymentIntentResponse.ok,
        data: paymentData
      })

      if (!paymentIntentResponse.ok) {
        throw new Error(paymentData.error || `Server error: ${paymentIntentResponse.status}`)
      }

      if (!paymentData.clientSecret) {
        throw new Error("No client secret received from server")
      }

      // Step 2: Initialize Stripe
      console.log("🔄 Initializing Stripe...")
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error("Stripe failed to initialize")
      }
      console.log("✅ Stripe initialized successfully")

      // Step 3: Confirm payment
      console.log("🔄 Confirming payment with Stripe...")
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        clientSecret: paymentData.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?quote_id=${quoteId}`,
        },
        redirect: 'if_required'
      })

      console.log("🔄 Stripe confirmation result:", { stripeError, paymentIntent })

      if (stripeError) {
        console.error("❌ Stripe error details:", {
          type: stripeError.type,
          code: stripeError.code,
          message: stripeError.message,
          decline_code: stripeError.decline_code,
          payment_intent: stripeError.payment_intent
        })
        
        let errorMessage = stripeError.message || "Payment failed"
        
        // Provide more specific error messages
        if (stripeError.type === 'card_error') {
          errorMessage = `Card error: ${stripeError.message}`
        } else if (stripeError.type === 'validation_error') {
          errorMessage = `Validation error: ${stripeError.message}`
        } else if (stripeError.type === 'invalid_request_error') {
          errorMessage = `Invalid request: ${stripeError.message}, ${stripeError.code}`
        }
        
        throw new Error(errorMessage)
      }

      // Step 4: Handle success
      console.log("✅ Payment successful!")
      setPaymentStatus('success')
      onPaymentSuccess(paymentData.paymentIntentId)
      
      setTimeout(() => {
        onClose()
        setPaymentStatus('idle')
      }, 2000)

    } catch (error) {
      console.error("❌ Payment processing error details:", error)
      setPaymentStatus('error')
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Payment processing failed. Please try again.'
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getCleaningTypeDisplay = (type: string) => {
    const types: { [key: string]: string } = {
      'standard': 'Standard Cleaning',
      'deep': 'Deep Cleaning',
      'post_construction': 'Post-Construction Cleaning'
    }
    return types[type] || type.replace('_', ' ')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Your Payment
          </DialogTitle>
          <DialogDescription>
            Secure payment processed by Stripe
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="break-words">
                <strong>Payment Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Customer Information Form */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Full Name *
              </Label>
              <Input
                id="customerName"
                type="text"
                placeholder="Enter your full name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="Enter your email address"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Quote Summary */}
          <Card>
            <CardContent className="p-4">
              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Loading quote details...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Quote #</span>
                    <span className="font-semibold">{quoteId}</span>
                  </div>
                  
                  {quoteDetails && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Service</span>
                      <Badge variant="secondary">
                        {getCleaningTypeDisplay(quoteDetails.cleaningType)}
                      </Badge>
                    </div>
                  )}

                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total Amount</span>
                      <span className="text-primary">
                        {formatAmount(amount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Status */}
          {paymentStatus === 'processing' && (
            <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing payment...</span>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">Payment successful!</span>
            </div>
          )}

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isLoading || paymentStatus === 'processing' || paymentStatus === 'success' || !customerEmail || !customerName}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay {formatAmount(amount)}
              </>
            )}
          </Button>

          <div className="text-xs text-center text-muted-foreground">
            🔒 Your payment is secure and encrypted
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}