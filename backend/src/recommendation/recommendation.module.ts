import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { VisionModule } from '@/vision/vision.module';

@Module({
  imports: [PrismaModule, VisionModule],
  controllers: [RecommendationController],
  providers: [RecommendationService],
})
export class RecommendationModule {}
