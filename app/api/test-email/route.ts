// app/api/test-email/route.ts
import { NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    // Check if request has a body
    if (!request.body) {
      return NextResponse.json({ 
        error: "No request body provided",
        usage: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: {
            to: "customer@example.com",
            amount: 100.00,
            // Optional: customerName, paymentIntentId
          }
        }
      }, { status: 400 })
    }

    let body;
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError)
      return NextResponse.json({ 
        error: "Invalid JSON in request body",
        details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }, { status: 400 })
    }

    const { to, amount = 100.00, customerName = "Test Customer", paymentIntentId = "pi_test_123" } = body

    // Validate required fields
    if (!to) {
      return NextResponse.json({ 
        error: "Missing required field: 'to' (email address)"
      }, { status: 400 })
    }

    console.log("🧪 Testing email service...")
    console.log("📧 Sending to:", to)
    console.log("💰 Amount:", amount)

    // Test customer receipt email
    await emailService.sendPaymentReceipt(
      123456, // quoteId
      customerName,
      to,
      amount,
      paymentIntentId
    )

    console.log("✅ Test email sent successfully")

    return NextResponse.json({ 
      success: true, 
      message: "Test email sent successfully",
      details: {
        to,
        amount,
        customerName,
        paymentIntentId
      }
    })
  } catch (error) {
    console.error("❌ Test email failed:", error)
    return NextResponse.json({ 
      error: "Test email failed", 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' 
    }, { status: 500 })
  }
}

// Add GET method for easier testing
export async function GET(request: Request) {
  const url = new URL(request.url)
  const to = url.searchParams.get('to') || 'test@example.com'
  const amount = parseFloat(url.searchParams.get('amount') || '100.00')

  return NextResponse.json({
    message: "Use POST to test emails, or use this example:",
    example: {
      method: "POST",
      url: "/api/test-email",
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        to: to,
        amount: amount,
        customerName: "Test Customer",
        paymentIntentId: "pi_test_123"
      }
    }
  })
}