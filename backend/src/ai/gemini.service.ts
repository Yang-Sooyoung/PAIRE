import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '@/prisma/prisma.service';
import * as crypto from 'crypto';

interface FoodAnalysis {
  keywords: string[];
  category: string;
  cuisine?: string;
  characteristics: string[];
}

interface DrinkRecommendation {
  drinkId: string;
  drinkName: string;
  drinkType: string;
  reason: string;
  score: number;
  pairingNotes: string;
}

interface RecommendationResult {
  recommendations: DrinkRecommendation[];
  fairyMessage: string;
  fromCache: boolean;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not found in environment variables');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  /**
   * Vision 분석 결과를 기반으로 음료 추천
   */
  async recommendDrinks(
    foodAnalysis: FoodAnalysis,
    occasion?: string,
    tastes?: string[],
  ): Promise<RecommendationResult> {
    // 캐시 키 생성
    const cacheKey = this.generateCacheKey(foodAnalysis, occasion, tastes);

    // 캐시 확인
    const cached = await this.getCachedRecommendation(cacheKey);
    if (cached) {
      this.logger.log(`Cache hit for key: ${cacheKey}`);
      return {
        recommendations: cached.recommendations as DrinkRecommendation[],
        fairyMessage: cached.fairyMessage,
        fromCache: true,
      };
    }

    this.logger.log(`Cache miss for key: ${cacheKey}, generating new recommendation`);

    // DB에서 모든 음료 가져오기
    const drinks = await this.prisma.drink.findMany();

    // Gemini로 추천 생성
    const result = await this.generateRecommendation(
      foodAnalysis,
      drinks,
      occasion,
      tastes,
    );

    // 캐시 저장
    await this.saveToCache(cacheKey, foodAnalysis, occasion, tastes, result);

    return {
      ...result,
      fromCache: false,
    };
  }

  /**
   * Gemini AI로 음료 추천 생성
   */
  private async generateRecommendation(
    foodAnalysis: FoodAnalysis,
    drinks: any[],
    occasion?: string,
    tastes?: string[],
  ): Promise<Omit<RecommendationResult, 'fromCache'>> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = this.buildPrompt(foodAnalysis, drinks, occasion, tastes);

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // JSON 파싱
      const parsed = this.parseGeminiResponse(text);

      return parsed;
    } catch (error) {
      this.logger.error('Gemini API error:', error);
      // 폴백: 기본 추천
      return this.getFallbackRecommendation(drinks, foodAnalysis);
    }
  }

  /**
   * Gemini 프롬프트 생성
   */
  private buildPrompt(
    foodAnalysis: FoodAnalysis,
    drinks: any[],
    occasion?: string,
    tastes?: string[],
  ): string {
    const drinkList = drinks
      .map(
        (d, i) =>
          `${i + 1}. ${d.name} (${d.type})
   - 설명: ${d.description}
   - 맛 특징: ${d.tastingNotes.join(', ')}
   - 어울리는 음식: ${d.foodPairings.join(', ')}
   - 가격: ${d.price}`,
      )
      .join('\n\n');

    return `당신은 음료 페어링 전문가 "페어리"입니다. 사용자의 음식 사진을 분석한 결과를 바탕으로 최적의 음료를 추천해주세요.

**음식 분석 결과:**
- 키워드: ${foodAnalysis.keywords.join(', ')}
- 카테고리: ${foodAnalysis.category}
- 요리 스타일: ${foodAnalysis.cuisine || '알 수 없음'}
- 특징: ${foodAnalysis.characteristics.join(', ')}

**상황:**
${occasion ? `- 상황: ${occasion}` : '- 상황: 지정되지 않음'}
${tastes && tastes.length > 0 ? `- 선호 맛: ${tastes.join(', ')}` : ''}

**추천 가능한 음료 목록:**
${drinkList}

**요청사항:**
1. 위 음료 목록에서 이 음식과 가장 잘 어울리는 음료 3개를 추천해주세요.
2. 각 음료마다 추천 이유를 상세히 설명해주세요 (음식의 맛, 질감, 조리법과 음료의 특성을 연결).
3. 페어리 캐릭터로서 친근하고 전문적인 톤으로 전체 추천 메시지를 작성해주세요.

**응답 형식 (JSON):**
\`\`\`json
{
  "recommendations": [
    {
      "drinkId": "음료 ID (drinks 배열의 id 값)",
      "drinkName": "음료 이름",
      "drinkType": "음료 타입",
      "reason": "추천 이유 (2-3문장, 음식과의 구체적인 페어링 근거)",
      "score": 95,
      "pairingNotes": "페어링 노트 (맛의 조화, 질감 매칭 등)"
    }
  ],
  "fairyMessage": "페어리의 전체 추천 메시지 (친근하고 전문적인 톤, 3-4문장)"
}
\`\`\`

JSON만 응답해주세요.`;
  }

  /**
   * Gemini 응답 파싱
   */
  private parseGeminiResponse(text: string): Omit<RecommendationResult, 'fromCache'> {
    try {
      // JSON 코드 블록 제거
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;

      const parsed = JSON.parse(jsonText.trim());

      return {
        recommendations: parsed.recommendations || [],
        fairyMessage: parsed.fairyMessage || '맛있는 페어링을 즐겨보세요!',
      };
    } catch (error) {
      this.logger.error('Failed to parse Gemini response:', error);
      throw error;
    }
  }

  /**
   * 폴백 추천 (Gemini 실패 시)
   */
  private getFallbackRecommendation(
    drinks: any[],
    foodAnalysis: FoodAnalysis,
  ): Omit<RecommendationResult, 'fromCache'> {
    // 간단한 매칭 로직
    const recommended = drinks.slice(0, 3).map((drink) => ({
      drinkId: drink.id,
      drinkName: drink.name,
      drinkType: drink.type,
      reason: `${drink.name}은(는) ${foodAnalysis.category} 요리와 잘 어울립니다.`,
      score: 80,
      pairingNotes: drink.description,
    }));

    return {
      recommendations: recommended,
      fairyMessage: '이 음식과 잘 어울리는 음료를 추천해드려요!',
    };
  }

  /**
   * 캐시 키 생성
   */
  private generateCacheKey(
    foodAnalysis: FoodAnalysis,
    occasion?: string,
    tastes?: string[],
  ): string {
    const data = {
      keywords: foodAnalysis.keywords.sort(),
      category: foodAnalysis.category,
      occasion: occasion || '',
      tastes: (tastes || []).sort(),
    };

    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  /**
   * 캐시에서 추천 가져오기
   */
  private async getCachedRecommendation(cacheKey: string) {
    const cached = await this.prisma.aiRecommendationCache.findUnique({
      where: { cacheKey },
    });

    if (cached) {
      // 히트 카운트 증가
      await this.prisma.aiRecommendationCache.update({
        where: { id: cached.id },
        data: {
          hitCount: { increment: 1 },
          lastUsedAt: new Date(),
        },
      });
    }

    return cached;
  }

  /**
   * 캐시에 저장
   */
  private async saveToCache(
    cacheKey: string,
    foodAnalysis: FoodAnalysis,
    occasion: string | undefined,
    tastes: string[] | undefined,
    result: Omit<RecommendationResult, 'fromCache'>,
  ) {
    try {
      await this.prisma.aiRecommendationCache.create({
        data: {
          cacheKey,
          foodKeywords: foodAnalysis.keywords,
          foodCategory: foodAnalysis.category,
          occasion: occasion || null,
          tastes: tastes || [],
          recommendations: result.recommendations as any,
          fairyMessage: result.fairyMessage,
        },
      });
    } catch (error) {
      this.logger.error('Failed to save cache:', error);
    }
  }
}
