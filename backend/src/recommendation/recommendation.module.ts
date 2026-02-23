import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { VisionModule } from '@/vision/vision.module';
import { StorageModule } from '@/storage/storage.module';

@Module({
  imports: [PrismaModule, VisionModule, StorageModule],
  controllers: [RecommendationController],
  providers: [RecommendationService],
})
export class RecommendationModule {}
