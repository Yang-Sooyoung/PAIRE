import { Injectable, NotFoundException } from '@nestjs/common';
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

  async registerPaymentMethod(userId: string, billingAuthKey: string) {
    console.log('registerPaymentMethod called:', { userId, billingAuthKey });

    // 기존 결제 수단 확인
    const existingMethod = await this.prisma.paymentMethod.findFirst({
      where: { userId },
    });

    console.log('Existing payment method:', existingMethod);

    if (existingMethod) {
      // 기존 결제 수단 업데이트
      const updated = await this.prisma.paymentMethod.update({
        where: { id: existingMethod.id },
        data: { billingKey: billingAuthKey },
      });
      console.log('Updated payment method:', updated);
    } else {
      // 새 결제 수단 생성
      const created = await this.prisma.paymentMethod.create({
        data: {
          userId,
          billingKey: billingAuthKey,
        },
      });
      console.log('Created payment method:', created);
    }

    return { success: true, message: '결제 수단이 등록되었습니다.' };
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
        paymentMethod: '카드 ****',
        willExpire: subscription.status === 'CANCELLED', // 취소 예정 플래그
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
}
