import { Controller, Get, Post, UseGuards, Request, Body, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('api/subscription')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

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
      // TODO: 결제 수단 등록 처리
      console.log('Billing callback:', { customerKey, authKey, plan, interval, price });
      
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
