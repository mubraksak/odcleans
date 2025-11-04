import { NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"
import { query } from "@/lib/database"
import { emailService } from "@/lib/email-service"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10" as any,
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {





  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event



  // Add at the beginning of the POST function


  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }


  console.log("🔔 Webhook received:", {
  type: event.type,
  id: event.id,
  livemode: event.livemode
})


  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("❌ Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("💰 Payment succeeded:", paymentIntent.id)
  
  const quoteId = paymentIntent.metadata.quote_id
  const customerEmail = paymentIntent.metadata.customer_email
  const customerName = paymentIntent.metadata.customer_name

  if (!quoteId) {
    console.error("❌ No quote ID in payment intent metadata")
    return
  }

  try {
    // Remove transaction - execute queries individually
    // 1. Update quote status to 'paid'
    await query(
      "UPDATE quote_requests SET status = 'paid', updated_at = NOW() WHERE id = ?",
      [quoteId]
    )

    // 2. Record transaction in database
    await query(
      `INSERT INTO transactions (
        quote_id, 
        stripe_payment_intent_id, 
        amount, 
        currency, 
        status, 
        customer_email,
        customer_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        quoteId,
        paymentIntent.id,
        paymentIntent.amount / 100,
        paymentIntent.currency,
        'succeeded',
        customerEmail,
        customerName
      ]
    )

    // 3. Update booking status if exists
    await query(
      "UPDATE bookings SET status = 'confirmed' WHERE quote_request_id = ?",
      [quoteId]
    )

    console.log("✅ Quote status updated and transaction recorded")

    // 4. Send receipt email to customer
    try {
      await emailService.sendPaymentReceipt(
        Number(quoteId),
        customerName,
        customerEmail,
        paymentIntent.amount / 100,
        paymentIntent.id
      )
      console.log("✅ Receipt email sent to customer")
    } catch (emailError) {
      console.error("❌ Failed to send receipt email to customer:", emailError)
    }

    // 5. Send notification to admin
    try {
      await emailService.sendPaymentReceivedAdmin(
        Number(quoteId),
        customerName,
        customerEmail,
        paymentIntent.amount / 100,
        paymentIntent.id
      )
      console.log("✅ Payment notification sent to admin")
    } catch (adminEmailError) {
      console.error("❌ Failed to send admin notification:", adminEmailError)
    }

  } catch (error) {
    console.error("❌ Error updating quote and recording transaction:", error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("❌ Payment failed:", paymentIntent.id)
  
  const quoteId = paymentIntent.metadata.quote_id
  const customerEmail = paymentIntent.metadata.customer_email

  if (!quoteId) return

  try {
    // Record failed transaction
    await query(
      `INSERT INTO transactions (
        quote_id, 
        stripe_payment_intent_id, 
        amount, 
        currency, 
        status, 
        customer_email,
        failure_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        quoteId,
        paymentIntent.id,
        paymentIntent.amount / 100,
        paymentIntent.currency,
        'failed',
        customerEmail,
        paymentIntent.last_payment_error?.message || 'Payment failed'
      ]
    )

    console.log("✅ Failed transaction recorded")
  } catch (error) {
    console.error("❌ Error recording failed transaction:", error)
  }
}