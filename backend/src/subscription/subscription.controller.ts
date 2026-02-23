import { Controller, Get, Post, UseGuards, Request, Body, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('api/subscription')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) { }

  @Get('methods')
  @UseGuards(JwtAuthGuard)
  async getMethods(@Request() req: any) {
    return this.subscriptionService.getMethods(req.user.sub);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createSubscription(@Request() req: any, @Body() dto: any) {
    return this.subscriptionService.createSubscription(req.user.sub, dto);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Request() req: any) {
    return this.subscriptionService.getStatus(req.user.sub);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  async cancelSubscription(@Request() req: any) {
    return this.subscriptionService.cancelSubscription(req.user.sub);
  }

  @Post('remove-method')
  @UseGuards(JwtAuthGuard)
  async removePaymentMethod(@Request() req: any) {
    // 결제 수단 제거 = 구독 취소
    return this.subscriptionService.cancelSubscription(req.user.sub);
  }

  @Get('billing-callback')
  async billingCallback(
    @Query('customerKey') customerKey: string,
    @Query('authKey') authKey: string,
    @Query('plan') plan: string,
    @Query('interval') interval: string,
    @Query('price') price: string,
    @Res() res: Response,
  ) {
    try {
      // authKey를 billingKey로 저장 (Toss에서 발급한 키)
      console.log('Billing callback:', { customerKey, authKey, plan, interval, price });

      // customerKey에서 userId 추출 (user_xxxxx 형식)
      const userId = customerKey.replace('user_', '');

      // 기존 구독이 있는지 확인
      const existingSubscription = await this.subscriptionService['prisma'].subscription.findFirst({
        where: { userId, status: 'ACTIVE' },
      });

      if (!existingSubscription) {
        // 새 구독 생성
        const nextBillingDate = new Date();
        if (interval === 'MONTHLY') {
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        } else {
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        }

        await this.subscriptionService['prisma'].subscription.create({
          data: {
            userId,
            membership: plan as any,
            interval: interval as any,
            price: parseInt(price),
            billingKey: authKey,
            nextBillingDate,
            status: 'ACTIVE',
          },
        });

        // 사용자 멤버십 업데이트
        await this.subscriptionService['prisma'].user.update({
          where: { id: userId },
          data: { membership: plan as any },
        });
      }

      // 프론트엔드로 리다이렉트
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/subscription/success?plan=${plan}&interval=${interval}&price=${price}`);
    } catch (error) {
      console.error('Billing callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/subscription/fail`);
    }
  }
}
