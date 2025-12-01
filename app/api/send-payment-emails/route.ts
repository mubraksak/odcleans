import { NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("📧 Sending payment emails with data:", body)

    const { quoteId, customerEmail, customerName, amount, paymentIntentId, action } = body

    if (action === 'payment_success') {
      // Send customer receipt
      await emailService.sendPaymentReceipt(
        quoteId,
        customerName,
        customerEmail,
        amount,
        paymentIntentId
      )

      // Send admin notification
      await emailService.sendPaymentReceivedAdmin(
        quoteId,
        customerName,
        customerEmail,
        amount,
        paymentIntentId
      )

      console.log("✅ Payment emails sent successfully")
    }

    return NextResponse.json({ success: true, message: "Emails sent successfully" })
  } catch (error) {
    console.error("❌ Error sending payment emails:", error)
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500 })
  }
}