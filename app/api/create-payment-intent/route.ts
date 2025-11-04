import { NextResponse } from "next/server"
import Stripe from "stripe"
import { query } from "@/lib/database"
import { emailService } from "@/lib/email-service"

// Validate environment variables first
function initializeStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }

  // Validate key format
  if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
    throw new Error(`Invalid Stripe secret key format. Expected 'sk_test_...' or 'sk_live_...', got: ${secretKey.substring(0, Math.min(secretKey.length, 20))}...`);
  }

  console.log("✅ Stripe secret key format is valid");

  // Initialize Stripe with error handling
  try {
    const stripe = new Stripe(secretKey, {
      apiVersion: "2024-04-10" as any,
    });
    return stripe;
  } catch (error) {
    console.error("❌ Failed to initialize Stripe:", error);
    throw new Error(`Stripe initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function POST(request: Request) {
  try {
    console.log("🔄 Initializing Stripe...");
    
    // Initialize Stripe with validation
    const stripe = initializeStripe();
    
    const body = await request.json();
    console.log("📦 Request body received");

    const { quoteId, amount, customerEmail, customerName } = body;

    // Validate required fields
    if (!quoteId || !amount || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields: quoteId, amount, and customerEmail are required" },
        { status: 400 }
      );
    }

    // Validate amount
    const amountInCents = Math.round(Number(amount));
    if (isNaN(amountInCents) || amountInCents < 50) { // Minimum 50 cents
      return NextResponse.json(
        { error: "Invalid amount. Minimum payment is $0.50" },
        { status: 400 }
      );
    }

    console.log("💳 Creating payment intent...", {
      quoteId,
      amount: amountInCents,
      customerEmail: customerEmail.substring(0, 5) + '...',
      hasCustomerName: !!customerName
    });

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        quote_id: String(quoteId),
        customer_email: customerEmail,
        customer_name: customerName || "",
      },
      description: `Cleaning Service - Quote #${quoteId}`,
      receipt_email: customerEmail,
    });

    console.log("✅ Payment intent created successfully:", {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      message: "Payment intent created successfully"
    });

  } catch (error: any) {
    console.error("❌ Error in create-payment-intent:", error);
    
    // Provide specific error messages
    let errorMessage = "Payment processing failed";
    
    if (error.message.includes("Invalid Stripe secret key format")) {
      errorMessage = "Stripe configuration error: Invalid secret key format";
    } else if (error.message.includes("STRIPE_SECRET_KEY")) {
      errorMessage = "Stripe configuration error: Missing secret key";
    } else if (error.type === 'StripeInvalidRequestError') {
      errorMessage = `Stripe error: ${error.message}`;
    } else {
      errorMessage = error.message || "Internal server error";
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.type || "unknown_error"
      },
      { status: 400 }
    );
  }
}