"use client"

import { useState } from "react"
import { PaymentPopup } from "@/components/payment/payment-popup"

export default function TestPaymentPage() {
  const [showPayment, setShowPayment] = useState(false)

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log("Payment successful:", paymentIntentId)
    alert(`Payment successful! Intent ID: ${paymentIntentId}`)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Payment</h1>
      
      <div className="space-y-4 mb-6">
        <p>Click the button below to test the payment popup:</p>
        
        <button 
          onClick={() => setShowPayment(true)}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Test Payment Popup
        </button>
      </div>

      <PaymentPopup
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        quoteId={1}
        amount={25.00}
        customerEmail="mubraksak@gmail.com"
        customerName="Mubarak Abdulkadir"
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}