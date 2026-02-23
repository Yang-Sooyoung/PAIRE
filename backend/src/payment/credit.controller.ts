import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreditService } from './credit.service';

@Controller('api/credit')
@UseGuards(JwtAuthGuard)
export class CreditController {
  constructor(private creditService: CreditService) {}

  @Get('packages')
  getPackages() {
    return this.creditService.getPackages();
  }

  @Get('balance')
  getBalance(@Request() req: any) {
    return this.creditService.getBalance(req.user.sub);
  }

  @Post('purchase')
  async purchaseCredit(@Request() req: any, @Body() dto: any) {
    return this.creditService.createPurchase(req.user.sub, dto);
  }

  @Post('confirm')
  async confirmPurchase(@Request() req: any, @Body() dto: any) {
    return this.creditService.confirmPurchase(req.user.sub, dto);
  }
}
