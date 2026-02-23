import { Controller, Post, Body, Headers, Get, Param, UseGuards, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('api/payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('webhook')
  async handleWebhook(
    @Headers('x-toss-signature') signature: string,
    @Body() body: any,
  ) {
    const bodyString = JSON.stringify(body);
    return this.paymentService.handleWebhook(signature, bodyString);
  }

  @Get(':paymentKey')
  @UseGuards(JwtAuthGuard)
  async getPayment(@Param('paymentKey') paymentKey: string) {
    return this.paymentService.getPayment(paymentKey);
  }

  @Post(':paymentKey/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelPayment(
    @Param('paymentKey') paymentKey: string,
    @Body('cancelReason') cancelReason: string,
  ) {
    return this.paymentService.cancelPayment(paymentKey, cancelReason);
  }
}
