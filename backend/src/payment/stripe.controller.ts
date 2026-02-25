import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
    Headers,
    RawBodyRequest,
    Req,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stripe')
export class StripeController {
    constructor(private readonly stripeService: StripeService) { }

    /**
     * Stripe Checkout Session 생성 (일회성 결제 - 크레딧)
     */
    @Post('create-checkout-session')
    @UseGuards(JwtAuthGuard)
    async createCheckoutSession(@Request() req: any, @Body() body: any) {
        const userId = req.user.sub;
        const { priceId, credits, successUrl, cancelUrl } = body;

        const session = await this.stripeService.createCheckoutSession({
            userId,
            email: req.user.email || `user_${userId}@paire.app`,
            priceId,
            successUrl: successUrl || `${process.env.FRONTEND_URL}/payment/success`,
            cancelUrl: cancelUrl || `${process.env.FRONTEND_URL}/subscription`,
            metadata: {
                userId,
                credits: credits?.toString() || '0',
                type: 'credit_purchase',
            },
        });

        return {
            sessionId: session.id,
            url: session.url,
        };
    }

    /**
     * Stripe Subscription Session 생성 (정기 결제)
     */
    @Post('create-subscription-session')
    @UseGuards(JwtAuthGuard)
    async createSubscriptionSession(@Request() req: any, @Body() body: any) {
        const userId = req.user.sub;
        const { priceId, planId, successUrl, cancelUrl } = body;

        const session = await this.stripeService.createSubscriptionSession({
            userId,
            email: req.user.email || `user_${userId}@paire.app`,
            priceId,
            successUrl: successUrl || `${process.env.FRONTEND_URL}/subscription/success`,
            cancelUrl: cancelUrl || `${process.env.FRONTEND_URL}/subscription`,
            metadata: {
                userId,
                planId: planId || 'unknown',
                type: 'subscription',
            },
        });

        return {
            sessionId: session.id,
            url: session.url,
        };
    }

    /**
     * Customer Portal Session 생성 (구독 관리)
     */
    @Post('create-portal-session')
    @UseGuards(JwtAuthGuard)
    async createPortalSession(@Request() req: any, @Body() body: any) {
        const { customerId, returnUrl } = body;

        if (!customerId) {
            throw new Error('Customer ID is required');
        }

        const session = await this.stripeService.createPortalSession({
            customerId,
            returnUrl: returnUrl || `${process.env.FRONTEND_URL}/subscription/status`,
        });

        return {
            url: session.url,
        };
    }

    /**
     * Stripe Webhook 처리
     */
    @Post('webhook')
    async handleWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string,
    ) {
        const rawBody = req.rawBody;

        if (!rawBody) {
            throw new Error('Raw body is required for webhook verification');
        }

        try {
            const event = this.stripeService.constructWebhookEvent(
                Buffer.from(rawBody),
                signature,
            );

            console.log('Stripe webhook event:', event.type);

            // 이벤트 타입별 처리
            switch (event.type) {
                case 'checkout.session.completed':
                    await this.handleCheckoutSessionCompleted(event.data.object);
                    break;
                case 'customer.subscription.created':
                    await this.handleSubscriptionCreated(event.data.object);
                    break;
                case 'customer.subscription.updated':
                    await this.handleSubscriptionUpdated(event.data.object);
                    break;
                case 'customer.subscription.deleted':
                    await this.handleSubscriptionDeleted(event.data.object);
                    break;
                case 'invoice.payment_succeeded':
                    await this.handleInvoicePaymentSucceeded(event.data.object);
                    break;
                case 'invoice.payment_failed':
                    await this.handleInvoicePaymentFailed(event.data.object);
                    break;
                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            return { received: true };
        } catch (err: any) {
            console.error('Webhook error:', err.message);
            throw err;
        }
    }

    private async handleCheckoutSessionCompleted(session: any) {
        console.log('Checkout session completed:', session.id);
        const userId = session.client_reference_id || session.metadata?.userId;
        const type = session.metadata?.type;

        if (type === 'credit_purchase') {
            const credits = parseInt(session.metadata?.credits || '0');
            console.log(`User ${userId} purchased ${credits} credits`);
            // TODO: 크레딧 추가 로직
        } else if (type === 'subscription') {
            console.log(`User ${userId} subscribed`);
            // TODO: 구독 활성화 로직
        }
    }

    private async handleSubscriptionCreated(subscription: any) {
        console.log('Subscription created:', subscription.id);
        // TODO: 구독 생성 로직
    }

    private async handleSubscriptionUpdated(subscription: any) {
        console.log('Subscription updated:', subscription.id);
        // TODO: 구독 업데이트 로직
    }

    private async handleSubscriptionDeleted(subscription: any) {
        console.log('Subscription deleted:', subscription.id);
        // TODO: 구독 취소 로직
    }

    private async handleInvoicePaymentSucceeded(invoice: any) {
        console.log('Invoice payment succeeded:', invoice.id);
        // TODO: 결제 성공 로직
    }

    private async handleInvoicePaymentFailed(invoice: any) {
        console.log('Invoice payment failed:', invoice.id);
        // TODO: 결제 실패 로직
    }
}
