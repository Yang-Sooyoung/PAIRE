import { Module } from '@nestjs/common';
import { StickerController } from './sticker.controller';
import { StickerService } from './sticker.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StickerController],
  providers: [StickerService],
  exports: [StickerService],
})
export class StickerModule {}
