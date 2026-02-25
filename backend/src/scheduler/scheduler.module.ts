import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SubscriptionScheduler } from './subscription.scheduler';
import { PrismaModule } from '@/prisma/prisma.module';
import { TossModule } from '@/toss/toss.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    TossModule,
  ],
  providers: [SubscriptionScheduler],
})
export class SchedulerModule {}
