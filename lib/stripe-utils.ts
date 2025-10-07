// lib/stripe-utils.ts
export function validateStripeKeys() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  console.log("🔍 Validating Stripe keys...");

  // Check if keys exist
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is missing from environment variables");
  }

  if (!publishableKey) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing from environment variables");
  }

  // Validate secret key format
  if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
    throw new Error(`Invalid STRIPE_SECRET_KEY format. Should start with 'sk_test_' or 'sk_live_'. Current: ${secretKey.substring(0, 8)}...`);
  }

  // Validate publishable key format
  if (!publishableKey.startsWith('pk_test_') && !publishableKey.startsWith('pk_live_')) {
    throw new Error(`Invalid NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY format. Should start with 'pk_test_' or 'pk_live_'. Current: ${publishableKey.substring(0, 8)}...`);
  }

  console.log("✅ Stripe keys are valid");
  return true;
}