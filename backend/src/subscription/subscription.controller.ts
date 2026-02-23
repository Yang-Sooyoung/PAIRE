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

  @Post('register-method')
  @UseGuards(JwtAuthGuard)
  async registerPaymentMethod(@Request() req: any, @Body() dto: { billingAuthKey: string; customerKey: string }) {
    return this.subscriptionService.registerPaymentMethod(req.user.sub, dto.billingAuthKey);
  }
}
