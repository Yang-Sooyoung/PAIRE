import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { VisionService } from '@/vision/vision.service';
import { StorageService } from '@/storage/storage.service';
import { GeminiService } from '@/ai/gemini.service';
import {
  normalizeMenuItems,
  findPairingRules,
  generatePairingReason
} from './menu-normalizer';
import {
  calculateDrinkScore,
  selectTopDrinks,
  DEFAULT_WEIGHTS,
} from './recommendation-engine';

@Injectable()
export class RecommendationService {
  constructor(
    private prisma: PrismaService,
    private visionService: VisionService,
    private storageService: StorageService,
    private geminiService: GeminiService,
  ) { }

  async createRecommendation(userId: string | null, dto: any) {
    // 권한 체크 (비로그인, FREE, CREDIT, PREMIUM)
    if (userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      
      if (user?.membership === 'PREMIUM') {
        // PREMIUM: 무제한
      } else if (user && user.credits > 0) {
        // 크레딧 보유: 크레딧 차감
        await this.prisma.user.update({
          where: { id: userId },
          data: { credits: { decrement: 1 } },
        });
      } else if (user?.membership === 'FREE') {
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
          throw new BadRequestException(
            '일일 추천 한도(1회)를 초과했습니다. 크레딧을 구매하거나 PREMIUM으로 업그레이드하세요.'
          );
        }
      }
    }

    // 이미지 처리
    let imageUrl = dto.imageUrl;
    let detectedFoods: string[] = [];
    let foodAnalysis: any = null;

    if (imageUrl) {
      // base64 이미지면 Supabase에 업로드
      if (imageUrl.startsWith('data:image')) {
        console.log('Uploading base64 image to Supabase...');
        const uploadedUrl = await this.storageService.uploadBase64Image(imageUrl, userId);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          console.log('Image uploaded:', uploadedUrl);
        } else {
          console.log('Image upload failed, using base64');
        }
      }

      // Vision API로 음식 인식 (base64는 스킵)
      if (!imageUrl.startsWith('data:image')) {
        try {
          // Vision으로 상세 분석
          foodAnalysis = await this.visionService.analyzeFoodImage(imageUrl);
          console.log('Food analysis:', foodAnalysis);
          detectedFoods = foodAnalysis.keywords;
        } catch (error) {
          console.error('Vision API 오류:', error);
          detectedFoods = ['음식'];
        }
      } else {
        detectedFoods = ['음식'];
      }
    } else {
      // 이미지 없이도 AI 추천 사용 (상황과 취향 기반)
      detectedFoods = ['일반 음식'];
    }

    // Gemini AI로 추천 생성 (이미지 유무와 관계없이)
    try {
      // 음식 분석 정보가 없으면 기본값 생성
      if (!foodAnalysis) {
        foodAnalysis = {
          keywords: detectedFoods,
          category: 'general',
          characteristics: [],
        };
      }

      const aiResult = await this.geminiService.recommendDrinks(
        foodAnalysis,
        dto.occasion,
        dto.tastes,
      );

      console.log('AI recommendation:', {
        fromCache: aiResult.fromCache,
        recommendations: aiResult.recommendations.length,
      });

      // AI 추천 결과를 사용
      const recommendedDrinks = await this.enrichDrinkData(aiResult.recommendations);

      const recommendation = {
        id: `rec_${Date.now()}`,
        drinks: recommendedDrinks,
        detectedFoods,
        fairyMessage: aiResult.fairyMessage,
        createdAt: new Date(),
      };

      // 데이터베이스에 저장
      if (userId) {
        await this.prisma.recommendation.create({
          data: {
            userId,
            imageUrl,
            occasion: dto.occasion,
            tastes: dto.tastes,
            drinks: recommendedDrinks,
            fairyMessage: aiResult.fairyMessage,
          },
        });
      }

      return { recommendation };
    } catch (error) {
      console.error('AI recommendation failed, falling back to rule-based:', error);
      // AI 실패 시 기존 룰 기반 시스템 사용
    }

    // 폴백: 기존 룰 기반 추천 엔진
      detectedFoods = ['음식'];
    }
    // 폴백: 기존 룰 기반 추천 엔진
    console.log('Using rule-based recommendation engine');
    const recommendedDrinks = await this.recommendDrinks(
      detectedFoods,
      dto.occasion,
      dto.tastes,
    );

    // 페어리 메시지 생성 (상황별 맞춤)
    const fairyMessage = this.generateFairyMessage(
      dto.occasion,
      dto.tastes,
      detectedFoods,
      ''
    );

    const recommendation = {
      id: `rec_${Date.now()}`,
      drinks: recommendedDrinks,
      detectedFoods,
      fairyMessage,
      createdAt: new Date(),
    };

    // 데이터베이스에 저장
    if (userId) {
      await this.prisma.recommendation.create({
        data: {
          userId,
          imageUrl,
          occasion: dto.occasion,
          tastes: dto.tastes,
          drinks: recommendedDrinks,
          fairyMessage,
        },
      });
    }

    return { recommendation };
  }

  /**
   * AI 추천 결과에 음료 상세 정보 추가
   */
  private async enrichDrinkData(recommendations: any[]): Promise<any[]> {
    const drinkIds = recommendations.map(r => r.drinkId);
    const drinks = await this.prisma.drink.findMany({
      where: { id: { in: drinkIds } },
    });

    return recommendations.map(rec => {
      const drink = drinks.find(d => d.id === rec.drinkId);
      if (!drink) return null;

      return {
        id: drink.id,
        name: drink.name,
        type: drink.type,
        description: drink.description,
        tastingNotes: drink.tastingNotes,
        image: drink.image,
        price: drink.price,
        purchaseUrl: drink.purchaseUrl,
        // AI 추천 정보 추가
        aiReason: rec.reason,
        aiScore: rec.score,
        pairingNotes: rec.pairingNotes,
      };
    }).filter(Boolean);
  }

  /**
   * 상황별 페어리 메시지 생성
   */
  private generateFairyMessage(
    occasion: string,
    tastes: string[],
    foods: string[],
    pairingReason: string
  ): string {
    const messages = {
      date: [
        '특별한 순간을 더욱 빛나게 해줄 한 잔이에요 ✨',
        '로맨틱한 분위기에 완벽한 페어링입니다 💕',
        '이 음료와 함께라면 더 특별한 시간이 될 거예요',
      ],
      solo: [
        '나만의 시간을 위한 완벽한 선택이에요 🌙',
        '혼자만의 여유를 즐기기에 딱 좋은 한 잔입니다',
        '오늘 하루의 피로를 풀어줄 음료예요',
      ],
      friends: [
        '친구들과 함께 즐기기 좋은 선택이에요 🎉',
        '즐거운 시간을 더욱 풍성하게 만들어줄 거예요',
        '함께 나누면 더 맛있는 한 잔입니다',
      ],
      family: [
        '가족과 함께하는 식사에 어울리는 음료예요 🏠',
        '따뜻한 시간을 더욱 특별하게 만들어줄 거예요',
        '모두가 즐길 수 있는 완벽한 선택입니다',
      ],
      business: [
        '비즈니스 미팅에 적합한 세련된 선택이에요 💼',
        '프로페셔널한 분위기를 완성해줄 음료입니다',
        '좋은 인상을 남길 수 있는 페어링이에요',
      ],
      celebration: [
        '축하의 순간을 더욱 화려하게 만들어줄 거예요 🎊',
        '특별한 날을 기념하기에 완벽한 선택입니다',
        '행복한 순간과 함께할 최고의 한 잔이에요',
      ],
      all: [
        '어떤 상황에서도 즐길 수 있는 만능 페어링이에요',
        '언제 어디서나 좋은 선택입니다',
      ],
    };

    const occasionMessages = messages[occasion] || messages.all;
    const randomMessage = occasionMessages[Math.floor(Math.random() * occasionMessages.length)];

    // 페어링 이유가 있으면 추가
    if (pairingReason) {
      return `${randomMessage}\n\n${pairingReason}`;
    }

    return randomMessage;
  }

  /**
   * 추천 엔진: 음식 + 상황 + 취향 → 음료
   */
  private async recommendDrinks(foods: string[], occasion: string, tastes: string[]): Promise<any[]> {
    // 데이터베이스에서 모든 음료 조회
    const allDrinks = await this.prisma.drink.findMany();

    // 메뉴 정규화 및 페어링 룰 적용
    const normalizedMenus = normalizeMenuItems(foods);
    const pairingRules = findPairingRules(normalizedMenus);

    console.log('=== Recommendation Engine ===');
    console.log('Foods:', foods);
    console.log('Normalized menus:', normalizedMenus);
    console.log('Pairing rules:', pairingRules.length);
    console.log('Occasion:', occasion);
    console.log('Tastes:', tastes);

    // 1. 상황 필터링 (필수)
    let candidates = allDrinks.filter((drink) => {
      const occasions = drink.occasions as string[];
      if (occasion === 'all') return true;
      // 정확히 매칭되거나 범용(all)인 경우만
      return occasions.includes(occasion) || occasions.includes('all');
    });

    console.log('Candidates after occasion filter:', candidates.length);

    // 2. 취향 필터링 (선택 사항이지만 중요)
    if (tastes && tastes.length > 0) {
      const tasteFiltered = candidates.filter((drink) => {
        const drinkTastes = drink.tastes as string[];
        // 최소 1개 이상의 취향이 매칭되어야 함
        return tastes.some((taste) => drinkTastes.includes(taste));
      });

      // 취향 매칭되는 음료가 충분히 있으면 사용
      if (tasteFiltered.length >= 5) {
        candidates = tasteFiltered;
        console.log('Using taste-filtered candidates:', candidates.length);
      } else {
        console.log('Not enough taste matches, keeping all occasion matches');
      }
    }

    console.log('Final candidates:', candidates.length);

    // 후보가 너무 적으면 필터링 완화
    if (candidates.length < 3) {
      console.log('Too few candidates, relaxing filters...');
      candidates = allDrinks.filter((drink) => {
        const occasions = drink.occasions as string[];
        return occasions.includes('all');
      });

      // 그래도 없으면 전체 음료 사용
      if (candidates.length < 3) {
        console.log('Using all drinks as fallback');
        candidates = allDrinks;
      }
    }

    // 3. 점수 계산
    const scores = candidates.map((drink) => {
      const score = calculateDrinkScore(
        drink,
        pairingRules,
        occasion,
        tastes,
        DEFAULT_WEIGHTS
      );
      return { drink, score };
    });

    // 4. 상위 3개 선택
    const topScores = selectTopDrinks(
      scores.map(s => s.score),
      3
    );

    console.log('Top scores:', topScores.map(s => ({
      drinkId: s.drinkId,
      total: s.totalScore.toFixed(2),
      breakdown: {
        menu: s.breakdown.menuMatch.toFixed(1),
        situation: s.breakdown.situationMatch.toFixed(1),
        taste: s.breakdown.tasteMatch.toFixed(1),
      }
    })));

    // 5. 음료 정보 반환
    return topScores.map(topScore => {
      const drinkData = scores.find(s => s.score.drinkId === topScore.drinkId);
      if (!drinkData) return null;

      const { drink } = drinkData;
      return {
        id: drink.id,
        name: drink.name,
        type: drink.type,
        description: drink.description,
        tastingNotes: drink.tastingNotes,
        image: drink.image,
        price: drink.price,
      };
    }).filter(Boolean);
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
