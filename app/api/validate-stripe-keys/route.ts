import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    const result = {
      hasSecretKey: !!secretKey,
      hasPublishableKey: !!publishableKey,
      secretKeyFormat: secretKey ? secretKey.substring(0, 8) + '...' : 'missing',
      publishableKeyFormat: publishableKey ? publishableKey.substring(0, 8) + '...' : 'missing',
      isValid: false,
      message: ''
    };

    // Check if keys exist
    if (!secretKey || !publishableKey) {
      result.message = 'Missing one or both Stripe keys';
      return NextResponse.json(result);
    }

    // Validate formats
    if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
      result.message = `Invalid secret key format: ${secretKey.substring(0, 20)}...`;
      return NextResponse.json(result);
    }

    if (!publishableKey.startsWith('pk_test_') && !publishableKey.startsWith('pk_live_')) {
      result.message = `Invalid publishable key format: ${publishableKey.substring(0, 20)}...`;
      return NextResponse.json(result);
    }

    // Test the keys by making a simple Stripe request
    try {
      const stripe = new Stripe(secretKey, { apiVersion: "2025-09-30.clover" as any });
      await stripe.balance.retrieve(); // Simple API call to test the key
      
      result.isValid = true;
      result.message = 'Stripe keys are valid and working';
    } catch (stripeError: any) {
      result.message = `Stripe API test failed: ${stripeError.message}`;
    }

    return NextResponse.json(result);

  } catch (error: any) {
    return NextResponse.json({
      isValid: false,
      message: `Validation error: ${error.message}`
    }, { status: 500 });
  }
}