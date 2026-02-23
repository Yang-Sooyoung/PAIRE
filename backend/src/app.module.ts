import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { PaymentModule } from './payment/payment.module';
import { VisionModule } from './vision/vision.module';
import { TossModule } from './toss/toss.module';
import { SupportModule } from './support/support.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    RecommendationModule,
    SubscriptionModule,
    PaymentModule,
    VisionModule,
    TossModule,
    SupportModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
