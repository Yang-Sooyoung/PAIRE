import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { TossModule } from '@/toss/toss.module';

@Module({
  imports: [PrismaModule, TossModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}
