import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { TossModule } from '@/toss/toss.module';

@Module({
  imports: [PrismaModule, TossModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
