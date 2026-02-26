import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { CreditService } from './credit.service';
import { CreditController } from './credit.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { TossModule } from '@/toss/toss.module';

@Module({
  imports: [PrismaModule, TossModule],
  providers: [StripeService, CreditService],
  controllers: [StripeController, CreditController],
  exports: [StripeService, CreditService],
})
export class PaymentModule {}
