"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentStatus, setPaymentStatus] = useState<"loading" | "success" | "error">("loading")
  const [isUpdating, setIsUpdating] = useState(false)
  
  const quoteId = searchParams.get("quote_id")
  const amount = searchParams.get("amount")
  const customerEmail = searchParams.get("customer_email")
  const customerName = searchParams.get("customer_name")
  const payment_intent = searchParams.get("payment_intent")
  const payment_intent_client_secret = searchParams.get("payment_intent_client_secret")
  const redirect_status = searchParams.get("redirect_status")

  useEffect(() => {
    const processPaymentSuccess = async () => {
      console.log("🔄 Processing payment success with params:", {
        quoteId,
        payment_intent,
        redirect_status
      })

      if (!quoteId) {
        console.error("❌ No quote ID found in URL")
        setPaymentStatus("error")
        return
      }

      try {
        setIsUpdating(true)

        // Update quote status via API
        const response = await fetch(`/api/user/quotes/${quoteId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "payment_success",
            payment_intent_id: payment_intent,
            amount: amount ? parseFloat(amount) : null,
            customer_email: customerEmail,
            customer_name: customerName,
          }),
        })

        if (response.ok) {
          console.log("✅ Quote status updated successfully")
          setPaymentStatus("success")
          
          // Wait a moment then redirect to dashboard
          setTimeout(() => {
            router.push("/dashboard")
          }, 3000)
        } else {
          const errorData = await response.json()
          console.error("❌ Failed to update quote status:", errorData)
          setPaymentStatus("error")
        }
      } catch (error) {
        console.error("❌ Error updating quote status:", error)
        setPaymentStatus("error")
      } finally {
        setIsUpdating(false)
      }


      try {
          console.log("📧 Sending immediate payment emails...")
          
          // Send customer receipt
          const emailResponse = await fetch('/api/send-payment-emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              quoteId: Number(quoteId),
              customerEmail: customerEmail,
              customerName: customerName,
              amount: amount ? parseFloat(amount) : null,
              paymentIntentId: payment_intent,
              action: 'payment_success'
            }),
          })

          if (emailResponse.ok) {
            console.log("✅ Immediate emails sent successfully")
          } else {
            console.error("❌ Failed to send immediate emails")
          }
        } catch (emailError) {
          console.error("❌ Error sending immediate emails:", emailError)
        }
    }

    // Only process if we have a quote ID
    if (quoteId) {
      processPaymentSuccess()
    } else {
      setPaymentStatus("error")
    }
  }, [quoteId, payment_intent, amount, customerEmail, customerName, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          {paymentStatus === "success" && (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          )}
          {paymentStatus === "loading" && (
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}
          {paymentStatus === "error" && (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-red-600" />
            </div>
          )}
          
          <CardTitle className="text-2xl">
            {paymentStatus === "success" && "Payment Successful!"}
            {paymentStatus === "loading" && "Processing Payment..."}
            {paymentStatus === "error" && "Payment Issue"}
          </CardTitle>
          
          <CardDescription>
            {paymentStatus === "success" && "Thank you for your payment! Your service has been confirmed."}
            {paymentStatus === "loading" && "Please wait while we confirm your payment..."}
            {paymentStatus === "error" && "There was an issue with your payment."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {paymentStatus === "success" && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800 font-semibold">
                  Your cleaning service has been confirmed!
                </p>
                {quoteId && (
                  <p className="text-sm text-green-700 mt-1">
                    Quote ID: #{quoteId.toString().padStart(6, "0")}
                  </p>
                )}
                {amount && (
                  <p className="text-sm text-green-700">
                    Amount Paid: ${parseFloat(amount).toFixed(2)}
                  </p>
                )}
              </div>

              <p className="text-muted-foreground">
                You will be redirected to your dashboard shortly...
              </p>

              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/dashboard">
                    Go to Dashboard Now
                  </Link>
                </Button>
                <Button asChild className="flex-1 bg-accent">
                  <Link href="/quote">
                    New Quote
                  </Link>
                </Button>
              </div>
            </>
          )}

          {paymentStatus === "loading" && (
            <>
              <p className="text-muted-foreground">
                Please wait while we update your account and send your receipt...
              </p>
              {isUpdating && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating your quote status...
                </div>
              )}
            </>
          )}

          {paymentStatus === "error" && (
            <>
              <p className="text-red-600">
                There was an issue processing your payment. Please check your dashboard for status.
              </p>
              <p className="text-sm text-muted-foreground">
                If you were charged but see this message, please contact support with your quote ID.
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}