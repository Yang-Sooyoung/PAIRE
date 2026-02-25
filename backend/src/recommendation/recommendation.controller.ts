import { Controller, Post, Get, Body, UseGuards, Request, Query, Param } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '@/auth/guards/optional-jwt-auth.guard';

@Controller('api/recommendation')
export class RecommendationController {
  constructor(private recommendationService: RecommendationService) {}

  @Post('create')
  @UseGuards(OptionalJwtAuthGuard)
  async createRecommendation(@Request() req: any, @Body() dto: any) {
    // 비로그인 사용자도 추천 가능 (일일 한도 체크는 서비스에서)
    const userId = req.user?.sub || null;
    console.log('=== Recommendation Controller ===');
    console.log('req.user:', req.user);
    console.log('userId:', userId);
    console.log('dto:', dto);
    return this.recommendationService.createRecommendation(userId, dto);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @Request() req: any,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    return this.recommendationService.getHistory(req.user.sub, limit, offset);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getDetail(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.sub || null;
    return this.recommendationService.getDetail(id, userId);
  }
}
