import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { TossService } from '@/toss/toss.service';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private tossService: TossService,
  ) {}

  /**
   * 결제 승인 (일반 결제용 - 후원 등)
   */
  async confirmPayment(userId: string, dto: { orderId: string; paymentKey: string; amount: number }) {
    try {
      // Toss Payments API로 결제 승인
      const confirmResult = await this.tossService.confirmPayment(dto.paymentKey, dto.orderId, dto.amount);

      if (!confirmResult.success) {
        throw new Error('결제 승인 실패');
      }

      // 결제 정보 저장
      await this.prisma.payment.create({
        data: {
          userId,
          paymentKey: dto.paymentKey,
          orderId: dto.orderId,
          amount: dto.amount,
          status: 'COMPLETED',
        },
      });

      return { success: true, message: '결제가 완료되었습니다.' };
    } catch (error) {
      console.error('결제 승인 오류:', error);
      throw error;
    }
  }

  /**
   * 결제 웹훅 처리 (Toss Payments)
   */
  async handleWebhook(signature: string, body: string) {
    // 웹훅 서명 검증
    const isValid = this.tossService.verifyWebhookSignature(signature, body);
    if (!isValid) {
      throw new Error('웹훅 서명 검증 실패');
    }

    const data = JSON.parse(body);
    const { eventName, data: paymentData } = data;

    if (eventName === 'payment.completed') {
      return this.handlePaymentCompleted(paymentData);
    }

    if (eventName === 'payment.failed') {
      return this.handlePaymentFailed(paymentData);
    }

    return { success: true };
  }

  /**
   * 결제 완료 처리
   */
  private async handlePaymentCompleted(paymentData: any) {
    try {
      // Toss에서 결제 정보 조회 (검증)
      const paymentInfo = await this.tossService.getPayment(paymentData.paymentKey);

      if (!paymentInfo.success) {
        throw new Error('결제 정보 조회 실패');
      }

      // 결제 정보 저장
      const payment = await this.prisma.payment.create({
        data: {
          userId: paymentData.userId,
          paymentKey: paymentData.paymentKey,
          orderId: paymentData.orderId,
          amount: paymentData.amount,
          status: 'COMPLETED',
        },
      });

      // 구독 정보 업데이트
      const subscription = await this.prisma.subscription.findFirst({
        where: { userId: paymentData.userId, status: 'ACTIVE' },
      });

      if (subscription) {
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
      }

      // 사용자 멤버십 업데이트
      await this.prisma.user.update({
        where: { id: paymentData.userId },
        data: { membership: 'PREMIUM' },
      });

      return { success: true, payment };
    } catch (error) {
      console.error('결제 완료 처리 오류:', error);
      throw error;
    }
  }

  /**
   * 결제 실패 처리
   */
  private async handlePaymentFailed(paymentData: any) {
    try {
      // 결제 정보 저장
      const payment = await this.prisma.payment.create({
        data: {
          userId: paymentData.userId,
          paymentKey: paymentData.paymentKey,
          orderId: paymentData.orderId,
          amount: paymentData.amount,
          status: 'FAILED',
        },
      });

      // 구독 상태 변경
      const subscription = await this.prisma.subscription.findFirst({
        where: { userId: paymentData.userId, status: 'ACTIVE' },
      });

      if (subscription) {
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'FAILED' },
        });

        // 사용자 멤버십 변경
        await this.prisma.user.update({
          where: { id: paymentData.userId },
          data: { membership: 'FREE' },
        });
      }

      return { success: false, payment };
    } catch (error) {
      console.error('결제 실패 처리 오류:', error);
      throw error;
    }
  }

  /**
   * 결제 조회
   */
  async getPayment(paymentKey: string) {
    try {
      const paymentInfo = await this.tossService.getPayment(paymentKey);
      return paymentInfo;
    } catch (error) {
      console.error('결제 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 결제 취소
   */
  async cancelPayment(paymentKey: string, cancelReason: string) {
    try {
      const result = await this.tossService.cancelPayment(paymentKey, cancelReason);

      if (result.success) {
        // 결제 정보 업데이트
        await this.prisma.payment.updateMany({
          where: { paymentKey },
          data: { status: 'CANCELLED' },
        });
      }

      return result;
    } catch (error) {
      console.error('결제 취소 오류:', error);
      throw error;
    }
  }
}
