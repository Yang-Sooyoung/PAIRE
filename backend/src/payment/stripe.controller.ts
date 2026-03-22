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
import { PrismaService } from '@/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stripe')
export class StripeController {
    constructor(
        private readonly stripeService: StripeService,
        private readonly prisma: PrismaService,
    ) { }

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
        const userId = session.client_reference_id || session.metadata?.userId;
        const type = session.metadata?.type;

        if (!userId) {
            console.error('No userId in session metadata');
            return;
        }

        if (type === 'credit_purchase') {
            const credits = parseInt(session.metadata?.credits || '0');
            console.log(`User ${userId} purchased ${credits} credits`);

            if (credits > 0) {
                // 크레딧 충전
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { credits: { increment: credits } },
                });

                // 구매 내역 기록 (orderId: session.id)
                await this.prisma.creditPurchase.upsert({
                    where: { orderId: session.id },
                    create: {
                        userId,
                        packageType: `CREDIT_${credits}`,
                        credits,
                        price: session.amount_total || 0,
                        orderId: session.id,
                        status: 'COMPLETED',
                    },
                    update: { status: 'COMPLETED' },
                });

                console.log(`✅ ${credits} credits added to user ${userId}`);
            }
        } else if (type === 'subscription') {
            const planId = session.metadata?.planId || 'premium-monthly';
            console.log(`User ${userId} subscribed with plan ${planId}`);

            // 구독 interval 결정
            const interval = planId.includes('weekly') ? 'WEEKLY'
                : planId.includes('yearly') || planId.includes('annual') ? 'ANNUALLY'
                : 'MONTHLY';

            // 다음 결제일 계산
            const nextBillingDate = new Date();
            if (interval === 'WEEKLY') nextBillingDate.setDate(nextBillingDate.getDate() + 7);
            else if (interval === 'MONTHLY') nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
            else nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);

            // 기존 구독 취소 처리
            await this.prisma.subscription.updateMany({
                where: { userId, status: 'ACTIVE' },
                data: { status: 'CANCELLED' },
            });

            // 새 구독 생성
            await this.prisma.subscription.create({
                data: {
                    userId,
                    membership: 'PREMIUM',
                    interval,
                    price: session.amount_total || 0,
                    stripeSubscriptionId: session.subscription || null,
                    stripeCustomerId: session.customer || null,
                    nextBillingDate,
                    status: 'ACTIVE',
                },
            });

            // 멤버십 업그레이드
            await this.prisma.user.update({
                where: { id: userId },
                data: { membership: 'PREMIUM' },
            });

            console.log(`✅ User ${userId} upgraded to PREMIUM`);
        }
    }

    private async handleSubscriptionCreated(subscription: any) {
        console.log('Subscription created:', subscription.id);
        // checkout.session.completed에서 처리하므로 여기선 스킵
    }

    private async handleSubscriptionUpdated(subscription: any) {
        console.log('Subscription updated:', subscription.id);
        const stripeSubId = subscription.id;
        const status = subscription.status; // active, canceled, past_due

        const sub = await this.prisma.subscription.findFirst({
            where: { stripeSubscriptionId: stripeSubId },
        });

        if (!sub) return;

        if (status === 'active') {
            await this.prisma.subscription.update({
                where: { id: sub.id },
                data: { status: 'ACTIVE' },
            });
        } else if (status === 'canceled' || status === 'cancelled') {
            await this.prisma.subscription.update({
                where: { id: sub.id },
                data: { status: 'CANCELLED' },
            });
            // 멤버십 FREE로 다운그레이드
            await this.prisma.user.update({
                where: { id: sub.userId },
                data: { membership: 'FREE' },
            });
        }
    }

    private async handleSubscriptionDeleted(subscription: any) {
        console.log('Subscription deleted:', subscription.id);
        const stripeSubId = subscription.id;

        const sub = await this.prisma.subscription.findFirst({
            where: { stripeSubscriptionId: stripeSubId },
        });

        if (!sub) return;

        await this.prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'CANCELLED' },
        });

        // 멤버십 FREE로 다운그레이드
        await this.prisma.user.update({
            where: { id: sub.userId },
            data: { membership: 'FREE' },
        });

        console.log(`✅ User ${sub.userId} downgraded to FREE`);
    }

    private async handleInvoicePaymentSucceeded(invoice: any) {
        console.log('Invoice payment succeeded:', invoice.id);
        const stripeSubId = invoice.subscription;
        if (!stripeSubId) return;

        const sub = await this.prisma.subscription.findFirst({
            where: { stripeSubscriptionId: stripeSubId },
        });

        if (!sub) return;

        // 다음 결제일 업데이트
        const nextBillingDate = new Date();
        if (sub.interval === 'WEEKLY') nextBillingDate.setDate(nextBillingDate.getDate() + 7);
        else if (sub.interval === 'MONTHLY') nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        else nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);

        await this.prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'ACTIVE', nextBillingDate },
        });

        // 멤버십 유지
        await this.prisma.user.update({
            where: { id: sub.userId },
            data: { membership: 'PREMIUM' },
        });
    }

    private async handleInvoicePaymentFailed(invoice: any) {
        console.log('Invoice payment failed:', invoice.id);
        const stripeSubId = invoice.subscription;
        if (!stripeSubId) return;

        const sub = await this.prisma.subscription.findFirst({
            where: { stripeSubscriptionId: stripeSubId },
        });

        if (!sub) return;

        await this.prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'FAILED' },
        });
    }
}
