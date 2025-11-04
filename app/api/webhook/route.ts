import { NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set.");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10" as any,
})

export async function POST(request: Request) {
  const body = await request.text()
  const signature = (await headers()).get("stripe-signature")!

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handleSuccessfulPayment(paymentIntent)
        break
      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent
        await handleFailedPayment(failedPayment)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    )
  }
}

async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  const quoteId = paymentIntent.metadata.quoteId

  // Update quote status to "paid"
  await updateQuoteStatus(parseInt(quoteId), 'accepted')
  
  // Send confirmation email
  // await emailService.sendPaymentConfirmation(...)
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  const quoteId = paymentIntent.metadata.quoteId
  
  // Update quote status to "payment_failed"
  await updateQuoteStatus(parseInt(quoteId), 'qouted')
}


//TODO: Implement this function based on your database
async function updateQuoteStatus(arg0: number, arg1: string) {
    throw new Error("Function not implemented.")
}
