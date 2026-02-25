import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreditService } from './credit.service';

@Controller('api/credit')
export class CreditController {
  constructor(private creditService: CreditService) {}

  @Get('packages')
  getPackages() {
    return this.creditService.getPackages();
  }

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  getBalance(@Request() req: any) {
    return this.creditService.getBalance(req.user.sub);
  }

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  async purchaseCredit(@Request() req: any, @Body() dto: any) {
    return this.creditService.createPurchase(req.user.sub, dto);
  }

  @Post('confirm')
  async confirmPurchase(@Body() dto: any) {
    // orderId에서 userId 추출 (credit_userId_timestamp 형식)
    const userId = dto.orderId.split('_')[1];
    return this.creditService.confirmPurchase(userId, dto);
  }
}
