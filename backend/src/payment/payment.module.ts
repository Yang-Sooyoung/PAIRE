import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { CreditService } from './credit.service';
import { CreditController } from './credit.controller';

@Module({
  providers: [StripeService, CreditService],
  controllers: [StripeController, CreditController],
  exports: [StripeService, CreditService],
})
export class PaymentModule {}
