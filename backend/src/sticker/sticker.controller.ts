import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { StickerService } from './sticker.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('api/sticker')
@UseGuards(JwtAuthGuard)
export class StickerController {
  constructor(private stickerService: StickerService) {}

  @Get()
  async getUserStickers(@Request() req: any) {
    return this.stickerService.getUserStickers(req.user.sub);
  }

  @Get('my-stickers')
  async getMyStickers(@Request() req: any) {
    return this.stickerService.getUserStickers(req.user.sub);
  }

  @Post('check')
  async checkAndUnlock(@Request() req: any) {
    return this.stickerService.checkAndUnlockStickers(req.user.sub);
  }
}
