import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { VisionService } from '@/vision/vision.service';

@Injectable()
export class RecommendationService {
  constructor(
    private prisma: PrismaService,
    private visionService: VisionService,
  ) { }

  async createRecommendation(userId: string | null, dto: any) {
    // 권한 체크 (비로그인, FREE, PREMIUM)
    if (userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.membership === 'FREE') {
        // FREE 사용자 일일 한도 체크
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const count = await this.prisma.recommendation.count({
          where: {
            userId,
            createdAt: { gte: today },
          },
        });
        if (count >= 1) {
          throw new BadRequestException('일일 추천 한도(1회)를 초과했습니다. PREMIUM으로 업그레이드하세요.');
        }
      }
    }

    // Vision API로 음식 인식
    let detectedFoods: string[] = [];
    if (dto.imageUrl) {
      // base64 이미지는 Vision API에서 처리 불가 - 일단 스킵
      if (dto.imageUrl.startsWith('data:image')) {
        console.log('Base64 image detected - skipping Vision API');
        detectedFoods = ['음식'];
      } else {
        try {
          detectedFoods = await this.visionService.detectFoodLabels(dto.imageUrl);
        } catch (error) {
          console.error('Vision API 오류:', error);
          detectedFoods = ['음식'];
        }
      }
    } else {
      detectedFoods = ['음식'];
    }

    // 추천 엔진: 음식 + 상황 + 취향 → 음료
    const recommendedDrinks = await this.recommendDrinks(
      detectedFoods,
      dto.occasion,
      dto.tastes,
    );

    const fairyMessages = [
      '이 순간에는 이 한 잔이 어울릴 것 같아요...',
      '당신의 취향을 읽었어요. 이 음료를 추천합니다.',
      '음식의 향과 맛을 생각하면, 이것이 최고의 페어링이에요.',
      '요정의 직감이 말해줘요. 이 한 잔이 정답입니다.',
      '당신의 순간을 더 특별하게 만들어줄 음료예요.',
    ];

    const recommendation = {
      id: `rec_${Date.now()}`,
      drinks: recommendedDrinks,
      detectedFoods,
      fairyMessage: fairyMessages[Math.floor(Math.random() * fairyMessages.length)],
      createdAt: new Date(),
    };

    // 데이터베이스에 저장
    if (userId) {
      await this.prisma.recommendation.create({
        data: {
          userId,
          occasion: dto.occasion,
          tastes: dto.tastes,
          drinks: recommendedDrinks,
          fairyMessage: recommendation.fairyMessage,
        },
      });
    }

    return { recommendation };
  }

  /**
   * 추천 엔진: 음식 + 상황 + 취향 → 음료
   */
  private async recommendDrinks(foods: string[], occasion: string, tastes: string[]): Promise<any[]> {
    // 데이터베이스에서 모든 음료 조회
    const allDrinks = await this.prisma.drink.findMany();

    let candidates = [...allDrinks];

    // 1. 상황에 맞는 음료 필터링
    if (occasion !== 'all') {
      candidates = candidates.filter((drink) => {
        const occasions = drink.occasions as string[];
        return occasions.includes(occasion) || occasions.includes('all');
      });
    }

    // 2. 취향에 맞는 음료 필터링
    if (tastes && tastes.length > 0) {
      candidates = candidates.filter((drink) => {
        const drinkTastes = drink.tastes as string[];
        return tastes.some((taste) => drinkTastes.includes(taste));
      });
    }

    // 3. 음식 페어링 점수 계산
    const scored = candidates.map((drink) => {
      let score = 0;

      // 음식 페어링 점수
      const foodPairings = drink.foodPairings as string[];
      if (foodPairings.includes('all')) {
        score += 10;
      } else {
        foods.forEach((food) => {
          if (foodPairings.some((pairing) => food.toLowerCase().includes(pairing))) {
            score += 5;
          }
        });
      }

      // 취향 점수
      if (tastes && tastes.length > 0) {
        const drinkTastes = drink.tastes as string[];
        const matchingTastes = drinkTastes.filter((taste) => tastes.includes(taste));
        score += matchingTastes.length * 3;
      }

      return { ...drink, score };
    });

    // 4. 상위 3개 반환
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ score, ...drink }) => ({
        id: drink.id,
        name: drink.name,
        type: drink.type,
        description: drink.description,
        tastingNotes: drink.tastingNotes,
        image: drink.image,
        price: drink.price,
      }));
  }

  async getHistory(userId: string, limit: number = 10, offset: number = 0) {
    const recommendations = await this.prisma.recommendation.findMany({
      where: { userId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.recommendation.count({
      where: { userId },
    });

    return { recommendations, total };
  }

  async getDetail(id: string, userId?: string) {
    const recommendation = await this.prisma.recommendation.findUnique({
      where: { id },
    });

    if (!recommendation) {
      throw new BadRequestException('추천을 찾을 수 없습니다.');
    }

    // 권한 체크 (자신의 추천만 조회 가능)
    if (userId && recommendation.userId !== userId) {
      throw new BadRequestException('접근 권한이 없습니다.');
    }

    return recommendation;
  }
}
