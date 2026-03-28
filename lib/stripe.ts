// Stripe client — will use stripe-react-native when dev build is ready
// For now, these are typed stubs

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

export interface PaymentResult {
  success: boolean;
  error?: string;
}

export async function initializePaymentSheet(
  eventId: string,
  amount: number,
  currency: string = 'gbp',
): Promise<PaymentResult> {
  // TODO: Call Supabase Edge Function to create PaymentIntent
  // Then initialize Stripe payment sheet
  console.log(`[stripe] Would init payment: ${amount} ${currency} for event ${eventId}`);
  return { success: true };
}

export async function presentPaymentSheet(): Promise<PaymentResult> {
  // TODO: Present Stripe payment sheet via stripe-react-native
  console.log('[stripe] Would present payment sheet');
  return { success: true };
}
