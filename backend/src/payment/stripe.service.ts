import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    
    if (!apiKey) {
      console.warn('Stripe secret key is not set. Stripe payments will not work.');
      // 개발 중에는 에러를 던지지 않음
      this.stripe = null as any;
      return;
    }

    this.stripe = new Stripe(apiKey, {
      apiVersion: '2026-01-28.clover',
    });
  }

  /**
   * Checkout Session 생성 (일회성 결제)
   */
  async createCheckoutSession(params: {
    userId: string;
    email: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }) {
    if (!this.stripe) {
      throw new Error('Stripe is not initialized');
    }

    const session = await this.stripe.checkout.sessions.create({
      customer_email: params.email,
      client_reference_id: params.userId,
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata || {},
    });

    return session;
  }

  /**
   * Subscription Checkout Session 생성 (정기 결제)
   */
  async createSubscriptionSession(params: {
    userId: string;
    email: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }) {
    if (!this.stripe) {
      throw new Error('Stripe is not initialized');
    }

    const session = await this.stripe.checkout.sessions.create({
      customer_email: params.email,
      client_reference_id: params.userId,
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata || {},
    });

    return session;
  }

  /**
   * Customer 생성
   */
  async createCustomer(params: {
    email: string;
    name?: string;
    metadata?: Record<string, string>;
  }) {
    if (!this.stripe) {
      throw new Error('Stripe is not initialized');
    }

    const customer = await this.stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: params.metadata || {},
    });

    return customer;
  }

  /**
   * Subscription 생성
   */
  async createSubscription(params: {
    customerId: string;
    priceId: string;
    metadata?: Record<string, string>;
  }) {
    if (!this.stripe) {
      throw new Error('Stripe is not initialized');
    }

    const subscription = await this.stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      metadata: params.metadata || {},
    });

    return subscription;
  }

  /**
   * Subscription 취소
   */
  async cancelSubscription(subscriptionId: string) {
    if (!this.stripe) {
      throw new Error('Stripe is not initialized');
    }

    const subscription = await this.stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  }

  /**
   * Webhook 이벤트 검증
   */
  constructWebhookEvent(payload: Buffer, signature: string) {
    if (!this.stripe) {
      throw new Error('Stripe is not initialized');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret is not set');
    }

    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  /**
   * Payment Intent 생성
   */
  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    customerId?: string;
    metadata?: Record<string, string>;
  }) {
    if (!this.stripe) {
      throw new Error('Stripe is not initialized');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      customer: params.customerId,
      metadata: params.metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  }

  /**
   * Customer Portal Session 생성 (구독 관리)
   */
  async createPortalSession(params: {
    customerId: string;
    returnUrl: string;
  }) {
    if (!this.stripe) {
      throw new Error('Stripe is not initialized');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });

    return session;
  }
}
