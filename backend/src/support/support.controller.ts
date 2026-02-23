import { Controller, Post, Body } from '@nestjs/common';
import { SupportService } from './support.service';

@Controller('api/support')
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Post('message')
  async sendMessage(@Body() dto: { userId?: string; email?: string; message: string }) {
    return this.supportService.saveMessage(dto);
  }
}
