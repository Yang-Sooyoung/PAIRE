import { Controller, Get, Post, UseGuards, Request, Body } from '@nestjs/common';
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
}
