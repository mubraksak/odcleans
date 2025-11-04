"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentPopupProps {
  quoteId: number
  amount: number
  customerEmail: string
  customerName: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function CheckoutForm({ 
  quoteId, 
  amount, 
  customerEmail, 
  customerName, 
  onSuccess, 
  onClose 
}: Omit<PaymentPopupProps, 'isOpen'>) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [clientSecret, setClientSecret] = useState("")

  // Create Payment Intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true)
        setErrorMessage("")

        console.log("🔄 Creating payment intent with data:", {
          quoteId,
          amount: Math.round(amount * 100),
          customerEmail,
          customerName
        })

        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quoteId: quoteId,
            amount: Math.round(amount * 100),
            customerEmail: customerEmail,
            customerName: customerName,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to create payment intent")
        }

        console.log("✅ Payment intent created:", {
          clientSecret: data.clientSecret ? `${data.clientSecret.substring(0, 20)}...` : 'missing',
          status: data.status
        })

        setClientSecret(data.clientSecret)
      } catch (error) {
        console.error("❌ Error creating payment intent:", error)
        setErrorMessage(error instanceof Error ? error.message : "Failed to initialize payment")
      } finally {
        setIsLoading(false)
      }
    }

    if (stripe && elements) {
      createPaymentIntent()
    }
  }, [stripe, elements, quoteId, amount, customerEmail, customerName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      console.error("Stripe not loaded")
      return
    }

    if (!clientSecret) {
      setErrorMessage("Payment not initialized. Please try again.")
      return
    }

    setIsLoading(true)
    setErrorMessage("")

    try {
      console.log("🔄 Submitting payment...")

      // First, submit the payment element to validate inputs
      const { error: submitError } = await elements.submit()
      
      if (submitError) {
        console.error("❌ Payment element validation error:", submitError)
        setErrorMessage(submitError.message || "Please check your payment details")
        setIsLoading(false)
        return
      }

      // Then confirm the payment - ALWAYS redirect for better UX
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?quote_id=${quoteId}&amount=${amount}&customer_email=${encodeURIComponent(customerEmail)}&customer_name=${encodeURIComponent(customerName)}`,
        },
        redirect: 'always' // Always redirect to handle all payment methods properly
      })

      if (error) {
        console.error("❌ Payment confirmation error:", error)
        
        if (error.type === "card_error" || error.type === "validation_error") {
          setErrorMessage(error.message || "Payment failed")
        } else {
          setErrorMessage("An unexpected error occurred. Please try again.")
        }
        setIsLoading(false)
      }
      // If no error, the user will be redirected to the success page
      
    } catch (error) {
      console.error("❌ Unexpected error during payment:", error)
      setErrorMessage("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {errorMessage}
        </div>
      )}

      {clientSecret ? (
        <>
          <PaymentElement 
            options={{
              layout: "tabs",
            }}
          />
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!stripe || isLoading || !clientSecret}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Processing..." : `Pay $${amount}`}
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Initializing payment...</p>
          {isLoading && <p className="text-sm text-muted-foreground">Setting up secure payment</p>}
        </div>
      )}
    </form>
  )
}

export function PaymentPopup({
  quoteId,
  amount,
  customerEmail,
  customerName,
  isOpen,
  onClose,
  onSuccess
}: PaymentPopupProps) {
  const [clientSecret, setClientSecret] = useState("")
  const [isInitializing, setIsInitializing] = useState(false)

  // Reset when popup closes
  useEffect(() => {
    if (!isOpen) {
      setClientSecret("")
    }
  }, [isOpen])

  // Create payment intent when popup opens
  useEffect(() => {
    if (isOpen && !clientSecret) {
      const initializePayment = async () => {
        try {
          setIsInitializing(true)
          console.log("🔄 Initializing payment for quote:", quoteId)

          const response = await fetch("/api/create-payment-intent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              quoteId: quoteId,
              amount: Math.round(amount * 100),
              customerEmail: customerEmail,
              customerName: customerName,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || "Failed to create payment intent")
          }

          console.log("✅ Payment intent created:", {
            clientSecret: data.clientSecret ? `${data.clientSecret.substring(0, 20)}...` : 'missing'
          })

          setClientSecret(data.clientSecret)
        } catch (error) {
          console.error("❌ Error initializing payment:", error)
        } finally {
          setIsInitializing(false)
        }
      }

      initializePayment()
    }
  }, [isOpen, clientSecret, quoteId, amount, customerEmail, customerName])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Complete Payment</CardTitle>
            <CardDescription>
              Pay ${amount} for your cleaning service
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            disabled={isInitializing}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {clientSecret ? (
            <Elements 
              stripe={stripePromise}
              options={{
                clientSecret: clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#059669',
                  }
                }
              }}
            >
              <CheckoutForm
                quoteId={quoteId}
                amount={amount}
                customerEmail={customerEmail}
                customerName={customerName}
                onSuccess={onSuccess}
                onClose={onClose}
              />
            </Elements>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p>{isInitializing ? "Setting up payment..." : "Initializing payment..."}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please wait while we prepare your secure payment
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}