// Stripe 클라이언트 (프론트엔드)
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Stripe 인스턴스 가져오기
 */
export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.error('Stripe publishable key is not set');
      return null;
    }
    
    stripePromise = loadStripe(publishableKey);
  }
  
  return stripePromise;
};

/**
 * Stripe Checkout 세션으로 리다이렉트
 */
export async function redirectToStripeCheckout(url: string) {
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
}

/**
 * Stripe Payment Element 초기화
 */
export async function createPaymentElement(clientSecret: string, elementId: string) {
  const stripe = await getStripe();
  
  if (!stripe) {
    throw new Error('Stripe is not initialized');
  }
  
  const elements = stripe.elements({ clientSecret });
  const paymentElement = elements.create('payment');
  paymentElement.mount(`#${elementId}`);
  
  return { stripe, elements, paymentElement };
}
