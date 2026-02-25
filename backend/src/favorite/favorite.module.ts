import { Module } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteController, DrinkController } from './favorite.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FavoriteController, DrinkController],
  providers: [FavoriteService],
})
export class FavoriteModule {}
