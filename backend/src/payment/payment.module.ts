import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { CreditService } from './credit.service';
import { CreditController } from './credit.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { TossModule } from '@/toss/toss.module';

@Module({
  imports: [PrismaModule, TossModule],
  controllers: [PaymentController, CreditController],
  providers: [PaymentService, CreditService],
  exports: [CreditService],
})
export class PaymentModule {}
