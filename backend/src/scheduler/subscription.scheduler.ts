import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/prisma/prisma.service';
import { TossService } from '@/toss/toss.service';

@Injectable()
export class SubscriptionScheduler {
  private readonly logger = new Logger(SubscriptionScheduler.name);

  constructor(
    private prisma: PrismaService,
    private tossService: TossService,
  ) {}

  /**
   * 매일 자정에 구독 결제 처리
   * 주간/월간/연간 구독의 nextBillingDate가 오늘인 경우 자동 결제
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleSubscriptionBilling() {
    this.logger.log('Starting subscription billing process...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // 오늘 결제일인 활성 구독 조회
      const subscriptions = await this.prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          nextBillingDate: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          user: true,
        },
      });

      this.logger.log(`Found ${subscriptions.length} subscriptions to bill`);

      for (const subscription of subscriptions) {
        try {
          // Toss 자동 결제 요청
          const paymentResult = await this.tossService.billingPayment(
            subscription.billingKey,
            subscription.price,
            `${subscription.user.username}님의 PREMIUM 구독 (${subscription.interval})`,
          );

          if (paymentResult.success) {
            // 다음 결제일 계산
            let nextBillingDate = new Date(subscription.nextBillingDate);
            
            switch (subscription.interval) {
              case 'WEEKLY':
                nextBillingDate.setDate(nextBillingDate.getDate() + 7);
                break;
              case 'MONTHLY':
                nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
                break;
              case 'ANNUALLY':
                nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
                break;
            }

            // 구독 정보 업데이트
            await this.prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                nextBillingDate,
              },
            });

            this.logger.log(
              `Successfully billed subscription ${subscription.id} for user ${subscription.userId}`,
            );
          } else {
            // 결제 실패 시 구독 상태 변경
            await this.prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: 'FAILED',
              },
            });

            // 사용자 멤버십 다운그레이드
            await this.prisma.user.update({
              where: { id: subscription.userId },
              data: {
                membership: 'FREE',
              },
            });

            this.logger.error(
              `Failed to bill subscription ${subscription.id} for user ${subscription.userId}`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error billing subscription ${subscription.id}:`,
            error,
          );
        }
      }

      this.logger.log('Subscription billing process completed');
    } catch (error) {
      this.logger.error('Error in subscription billing process:', error);
    }
  }

  /**
   * 매일 자정에 FREE 사용자의 일일 무료 이용 횟수 초기화
   * (실제로는 카운트를 리셋하는 것이 아니라, 추천 생성 시 오늘 날짜로 체크)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetDailyFreeUsage() {
    this.logger.log('Daily free usage reset completed (handled in recommendation service)');
    // 실제 리셋은 추천 생성 시 오늘 날짜 기준으로 카운트하므로 별도 작업 불필요
  }

  /**
   * 매주 월요일 자정에 만료된 구독 정리
   */
  @Cron('0 0 0 * * 1') // 매주 월요일 자정
  async cleanupExpiredSubscriptions() {
    this.logger.log('Starting expired subscription cleanup...');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // 30일 이상 FAILED 상태인 구독 삭제
      const result = await this.prisma.subscription.deleteMany({
        where: {
          status: 'FAILED',
          updatedAt: {
            lt: thirtyDaysAgo,
          },
        },
      });

      this.logger.log(`Cleaned up ${result.count} expired subscriptions`);
    } catch (error) {
      this.logger.error('Error in expired subscription cleanup:', error);
    }
  }
}
