import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { TossService } from '@/toss/toss.service';

@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private tossService: TossService,
  ) { }

  async getMethods(userId: string) {
    console.log('getMethods called for userId:', userId);

    // 사용자의 결제 수단 조회 (PaymentMethod 테이블에서)
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { userId },
    });

    console.log('Found payment method:', paymentMethod);

    if (!paymentMethod) {
      console.log('No payment method found, returning empty array');
      return { success: true, methods: [] };
    }

    const result = {
      success: true,
      methods: [
        {
          id: paymentMethod.id,
          billingKey: paymentMethod.billingKey,
          cardLast4: '****',
          createdAt: paymentMethod.createdAt,
        },
      ],
    };

    console.log('Returning payment methods:', result);
    return result;
  }

  async registerPaymentMethod(userId: string, billingAuthKey: string, customerKey?: string) {
    const existingMethod = await this.prisma.paymentMethod.findFirst({
      where: { userId },
    });

    const resolvedCustomerKey = customerKey || `user_${userId}`;

    if (existingMethod) {
      await this.prisma.paymentMethod.update({
        where: { id: existingMethod.id },
        data: { billingKey: billingAuthKey, customerKey: resolvedCustomerKey },
      });
    } else {
      await this.prisma.paymentMethod.create({
        data: { userId, billingKey: billingAuthKey, customerKey: resolvedCustomerKey },
      });
    }

    return { success: true, message: '결제 수단이 등록되었습니다.' };
  }

  async createSubscription(userId: string, dto: any) {
    // ACTIVE 구독 중복 체크
    const existingActive = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (existingActive) {
      throw new BadRequestException('이미 활성 구독이 있습니다.');
    }

    // 기존 CANCELLED 구독에서 남은 기간 계산 (재구독 보너스)
    const cancelledSub = await this.prisma.subscription.findFirst({
      where: { userId, status: 'CANCELLED' },
      orderBy: { createdAt: 'desc' },
    });

    let remainingDays = 0;
    if (cancelledSub?.nextBillingDate) {
      const now = new Date();
      const remaining = new Date(cancelledSub.nextBillingDate).getTime() - now.getTime();
      remainingDays = Math.max(0, Math.floor(remaining / (1000 * 60 * 60 * 24)));
    }

    // 기존 CANCELLED 구독 아카이브
    await this.prisma.subscription.updateMany({
      where: { userId, status: 'CANCELLED' },
      data: { status: 'FAILED' },
    });

    // 첫 결제 실행 (customerKey 조회)
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { userId, billingKey: dto.billingKey },
    });
    const customerKey = paymentMethod?.customerKey || `user_${userId}`;

    const intervalLabel = dto.interval === 'WEEKLY' ? '주간' : dto.interval === 'MONTHLY' ? '월간' : '연간';
    const orderName = `PAIRÉ PREMIUM ${intervalLabel} 구독`;

    let paymentResult: any;
    try {
      paymentResult = await this.tossService.billingPayment(
        dto.billingKey,
        dto.price,
        orderName,
        undefined,
        customerKey,
      );
    } catch (e: any) {
      throw new BadRequestException(`결제 처리 중 오류가 발생했습니다: ${e.message}`);
    }

    if (!paymentResult.success) {
      // 빌링키 만료 또는 유효하지 않은 경우 결제수단 재등록 안내
      const errorMsg = paymentResult.error || '알 수 없는 오류';
      const isBillingKeyError = errorMsg.includes('빌링키') || errorMsg.includes('billing') || errorMsg.includes('인증');
      if (isBillingKeyError) {
        // 만료된 결제수단 DB에서 제거
        await this.prisma.paymentMethod.deleteMany({ where: { userId, billingKey: dto.billingKey } });
        throw new BadRequestException('결제 수단이 만료되었습니다. 결제 수단을 다시 등록해주세요.');
      }
      throw new BadRequestException(`첫 결제에 실패했습니다: ${errorMsg}`);
    }

    // 다음 갱신일 계산 (기본 주기 + 남은 기간)
    const nextBillingDate = new Date();
    if (dto.interval === 'MONTHLY') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (dto.interval === 'WEEKLY') {
      nextBillingDate.setDate(nextBillingDate.getDate() + 7);
    } else {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    // 남은 기간 추가
    if (remainingDays > 0) {
      nextBillingDate.setDate(nextBillingDate.getDate() + remainingDays);
    }

    // 구독 생성 (첫 결제 paymentKey 저장)
    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        membership: 'PREMIUM',
        interval: dto.interval,
        price: dto.price,
        billingKey: dto.billingKey,
        lastPaymentKey: paymentResult.paymentKey || null,
        lastOrderId: paymentResult.orderId || null,
        nextBillingDate,
        status: 'ACTIVE',
      },
    });

    // 사용자 멤버십 업데이트
    await this.prisma.user.update({
      where: { id: userId },
      data: { membership: 'PREMIUM' },
    });

    return { success: true, subscription, remainingDays };
  }

  async getStatus(userId: string) {
    // ACTIVE 또는 CANCELLED 구독 조회 (만료 전까지)
    const subscription = await this.prisma.subscription.findFirst({
      where: { 
        userId, 
        status: { in: ['ACTIVE', 'CANCELLED'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return { subscription: null };
    }

    // CANCELLED 구독이 만료되었는지 확인
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextBillingDate = new Date(subscription.nextBillingDate);
    nextBillingDate.setHours(0, 0, 0, 0);

    if (subscription.status === 'CANCELLED' && nextBillingDate <= today) {
      // 만료된 CANCELLED 구독
      return { subscription: null };
    }

    return {
      subscription: {
        id: subscription.id,
        membership: subscription.membership,
        interval: subscription.interval,
        price: subscription.price,
        nextBillingDate: subscription.nextBillingDate,
        status: subscription.status,
        paymentMethod: subscription.stripeSubscriptionId || subscription.stripeCustomerId ? 'Card ****' : '카드 ****',
        willExpire: subscription.status === 'CANCELLED', // 취소 예정 플래그
        isStripe: !!subscription.stripeSubscriptionId || !!subscription.stripeCustomerId,
      },
    };
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!subscription) {
      throw new NotFoundException('활성 구독을 찾을 수 없습니다.');
    }

    // 구독 상태만 CANCELLED로 변경 (멤버십은 유지)
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'CANCELLED' },
    });

    // 사용자 멤버십은 nextBillingDate까지 유지
    // 스케줄러가 nextBillingDate에 FREE로 변경

    return { 
      success: true, 
      message: '구독이 취소되었습니다. 다음 갱신일까지 PREMIUM 혜택을 이용할 수 있습니다.',
      nextBillingDate: subscription.nextBillingDate,
    };
  }

  async removePaymentMethod(userId: string) {
    // 활성 구독 확인
    const activeSubscription = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    // 활성 구독이 있으면 먼저 취소 (멤버십은 유지)
    if (activeSubscription) {
      await this.prisma.subscription.update({
        where: { id: activeSubscription.id },
        data: { status: 'CANCELLED' },
      });
      
      // 멤버십은 nextBillingDate까지 유지
    }

    // 결제 수단 제거
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { userId },
    });

    if (paymentMethod) {
      await this.prisma.paymentMethod.delete({
        where: { id: paymentMethod.id },
      });
    }

    return { 
      success: true, 
      message: activeSubscription 
        ? `구독이 취소되고 결제 수단이 제거되었습니다. ${activeSubscription.nextBillingDate.toLocaleDateString()}까지 PREMIUM 혜택을 이용할 수 있습니다.`
        : '결제 수단이 제거되었습니다.',
      nextBillingDate: activeSubscription?.nextBillingDate,
    };
  }

  /**
   * 자동 갱신 처리 (매월/매년 실행)
   */
  async processAutoRenewal() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. CANCELLED 구독 중 만료된 것 처리
    const expiredCancelledSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'CANCELLED',
        nextBillingDate: { lte: today },
      },
    });

    for (const subscription of expiredCancelledSubscriptions) {
      try {
        // 사용자 멤버십을 FREE로 변경
        await this.prisma.user.update({
          where: { id: subscription.userId },
          data: { membership: 'FREE' },
        });

        console.log(`구독 만료 처리 완료: userId=${subscription.userId}`);
      } catch (error) {
        console.error(`구독 만료 처리 실패 (${subscription.id}):`, error);
      }
    }

    // 2. ACTIVE 구독 중 갱신 예정인 것 처리
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextBillingDate: { lte: today },
      },
    });

    for (const subscription of subscriptions) {
      try {
        // customerKey 조회
        const paymentMethod = await this.prisma.paymentMethod.findFirst({
          where: { userId: subscription.userId, billingKey: subscription.billingKey },
        });
        const customerKey = paymentMethod?.customerKey || `user_${subscription.userId}`;

        const orderId = `renewal_${subscription.id}_${Date.now()}`;
        const paymentResult = await this.tossService.billingPayment(
          subscription.billingKey,
          subscription.price,
          'PAIRÉ PREMIUM 구독 갱신',
          orderId,
          customerKey,
        );

        if (paymentResult.success) {
          // 다음 갱신일 업데이트 + paymentKey 저장
          const nextBillingDate = new Date(subscription.nextBillingDate);
          if (subscription.interval === 'MONTHLY') {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          } else if (subscription.interval === 'WEEKLY') {
            nextBillingDate.setDate(nextBillingDate.getDate() + 7);
          } else {
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          }

          await this.prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              nextBillingDate,
              lastPaymentKey: paymentResult.paymentKey || null,
              lastOrderId: paymentResult.orderId || null,
            },
          });

          console.log(`구독 갱신 성공: userId=${subscription.userId}`);
        } else {
          // 결제 실패 - 상태 변경
          await this.prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'FAILED' },
          });

          // 사용자 멤버십 변경
          await this.prisma.user.update({
            where: { id: subscription.userId },
            data: { membership: 'FREE' },
          });

          console.log(`구독 갱신 실패: userId=${subscription.userId}`);
        }
      } catch (error) {
        console.error(`구독 갱신 실패 (${subscription.id}):`, error);
      }
    }
  }

  /**
   * 토스 웹훅 처리
   * 이벤트: Billing.Done, Billing.Failed, Payment.Done, Payment.Canceled
   * 토스 대시보드 웹훅 URL: https://your-domain/api/subscription/toss-webhook
   */
  async handleTossWebhook(signature: string, body: any) {
    if (signature && process.env.TOSS_WEBHOOK_SECRET) {
      const isValid = this.tossService.verifyWebhookSignature(signature, JSON.stringify(body));
      if (!isValid) {
        console.error('[Toss Webhook] Invalid signature');
        return { success: false, message: 'Invalid signature' };
      }
    }

    const { eventType, data } = body;
    console.log(`[Toss Webhook] eventType=${eventType}`);

    try {
      switch (eventType) {
        // 빌링 자동결제 성공
        case 'Billing.Done': {
          const { paymentKey, orderId } = data;
          const subIdMatch = orderId?.match(/^renewal_([^_]+)_/);
          if (!subIdMatch) break;

          const subscription = await this.prisma.subscription.findUnique({
            where: { id: subIdMatch[1] },
          });
          if (!subscription) break;

          const nextBillingDate = new Date(subscription.nextBillingDate);
          if (subscription.interval === 'WEEKLY') nextBillingDate.setDate(nextBillingDate.getDate() + 7);
          else if (subscription.interval === 'MONTHLY') nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          else nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);

          await this.prisma.subscription.update({
            where: { id: subIdMatch[1] },
            data: { status: 'ACTIVE', nextBillingDate, lastPaymentKey: paymentKey, lastOrderId: orderId },
          });
          await this.prisma.user.update({
            where: { id: subscription.userId },
            data: { membership: 'PREMIUM' },
          });
          console.log(`[Toss Webhook] Billing.Done: subscription ${subIdMatch[1]} renewed`);
          break;
        }

        // 빌링 자동결제 실패
        case 'Billing.Failed': {
          const { orderId } = data;
          const subIdMatch = orderId?.match(/^renewal_([^_]+)_/);
          if (!subIdMatch) break;

          const subscription = await this.prisma.subscription.findUnique({
            where: { id: subIdMatch[1] },
          });
          if (!subscription) break;

          await this.prisma.subscription.update({
            where: { id: subIdMatch[1] },
            data: { status: 'FAILED' },
          });
          await this.prisma.user.update({
            where: { id: subscription.userId },
            data: { membership: 'FREE' },
          });
          console.log(`[Toss Webhook] Billing.Failed: subscription ${subIdMatch[1]} failed`);
          break;
        }

        // 일반 결제 완료 (크레딧 구매)
        case 'Payment.Done': {
          const { paymentKey, orderId } = data;
          if (orderId?.startsWith('credit_')) {
            const purchase = await this.prisma.creditPurchase.findUnique({ where: { orderId } });
            if (purchase && purchase.status !== 'COMPLETED') {
              await this.prisma.creditPurchase.update({
                where: { orderId },
                data: { paymentKey, status: 'COMPLETED' },
              });
              await this.prisma.user.update({
                where: { id: purchase.userId },
                data: { credits: { increment: purchase.credits } },
              });
              console.log(`[Toss Webhook] Payment.Done: credit ${orderId} completed`);
            }
          }
          break;
        }

        // 결제 취소
        case 'Payment.Canceled': {
          const { orderId } = data;
          if (orderId?.startsWith('credit_')) {
            await this.prisma.creditPurchase.updateMany({
              where: { orderId, status: { not: 'COMPLETED' } },
              data: { status: 'CANCELLED' },
            });
          }
          break;
        }

        default:
          console.log(`[Toss Webhook] Unhandled: ${eventType}`);
      }

      return { success: true };
    } catch (error) {
      console.error('[Toss Webhook] Error:', error);
      return { success: false, message: error.message };
    }
  }
}
