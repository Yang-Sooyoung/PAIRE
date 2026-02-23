import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionService } from '@/subscription/subscription.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private subscriptionService: SubscriptionService) {}

  /**
   * 매일 자정에 구독 자동 갱신 처리
   * Cron: 0 0 * * * (매일 00:00)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'subscription-renewal',
    timeZone: 'Asia/Seoul',
  })
  async handleSubscriptionRenewal() {
    this.logger.log('Starting subscription renewal process...');
    
    try {
      await this.subscriptionService.processAutoRenewal();
      this.logger.log('Subscription renewal completed successfully');
    } catch (error) {
      this.logger.error('Subscription renewal failed:', error);
    }
  }

  /**
   * 매시간 헬스체크 (선택사항)
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'health-check',
  })
  handleHealthCheck() {
    this.logger.debug('Health check: Scheduler is running');
  }
}
