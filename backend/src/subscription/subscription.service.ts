import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { TossService } from '@/toss/toss.service';

@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private tossService: TossService,
  ) {}

  async getMethods(userId: string) {
    // 사용자의 결제 수단 조회
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!subscription) {
      return { success: true, methods: [] };
    }

    return {
      success: true,
      methods: [
        {
          id: 'method_1',
          billingKey: subscription.billingKey,
          cardLast4: '****',
          createdAt: subscription.createdAt,
        },
      ],
    };
  }

  async createSubscription(userId: string, dto: any) {
    // 기존 구독 확인
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (existingSubscription) {
      throw new Error('이미 활성 구독이 있습니다.');
    }

    // 다음 갱신일 계산
    const nextBillingDate = new Date();
    if (dto.interval === 'MONTHLY') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    // 구독 생성
    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        membership: 'PREMIUM',
        interval: dto.interval,
        price: dto.price,
        billingKey: dto.billingKey,
        nextBillingDate,
        status: 'ACTIVE',
      },
    });

    // 사용자 멤버십 업데이트
    await this.prisma.user.update({
      where: { id: userId },
      data: { membership: 'PREMIUM' },
    });

    return { success: true, subscription };
  }

  async getStatus(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!subscription) {
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
        paymentMethod: '카드 ****',
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

    // 구독 상태 변경
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'CANCELLED' },
    });

    return { success: true, message: '구독이 취소되었습니다. 다음 갱신일부터 FREE로 변경됩니다.' };
  }

  /**
   * 자동 갱신 처리 (매월/매년 실행)
   */
  async processAutoRenewal() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 갱신 예정인 구독 조회
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextBillingDate: { lte: today },
      },
    });

    for (const subscription of subscriptions) {
      try {
        // Toss에서 결제 승인
        const paymentResult = await this.tossService.authorizePayment(
          subscription.billingKey,
          `renewal_${subscription.id}_${Date.now()}`,
          subscription.price,
        );

        if (paymentResult.success) {
          // 다음 갱신일 업데이트
          const nextBillingDate = new Date(subscription.nextBillingDate);
          if (subscription.interval === 'MONTHLY') {
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          } else {
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          }

          await this.prisma.subscription.update({
            where: { id: subscription.id },
            data: { nextBillingDate },
          });
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
        }
      } catch (error) {
        console.error(`구독 갱신 실패 (${subscription.id}):`, error);
        // 실패 로그 기록
      }
    }
  }
}
