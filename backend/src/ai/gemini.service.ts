import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
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
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not found in environment variables');
    } else {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
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
        recommendations: cached.recommendations as unknown as DrinkRecommendation[],
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
   * OpenAI로 음료 추천 생성
   */
  private async generateRecommendation(
    foodAnalysis: FoodAnalysis,
    drinks: any[],
    occasion?: string,
    tastes?: string[],
  ): Promise<Omit<RecommendationResult, 'fromCache'>> {
    const prompt = this.buildPrompt(foodAnalysis, drinks, occasion, tastes);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '당신은 음료 페어링 전문가 "페어리(Pairé)"입니다. 마법 같은 페어링으로 특별한 순간을 만들어주는 요정입니다.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const text = completion.choices[0]?.message?.content || '{}';

      // JSON 파싱
      const parsed = this.parseGeminiResponse(text);

      return parsed;
    } catch (error) {
      this.logger.error('OpenAI API error:', error);
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
          `${i + 1}. ID: ${d.id}
   - 이름: ${d.name}
   - 타입: ${d.type}
   - 설명: ${d.description}
   - 맛 특징: ${d.tastingNotes.join(', ')}
   - 어울리는 음식: ${d.foodPairings.join(', ')}
   - 가격: ${d.price}`,
      )
      .join('\n\n');

    const occasionMap = {
      date: '데이트',
      solo: '혼자만의 시간',
      friends: '친구들과의 모임',
      family: '가족 식사',
      business: '비즈니스 미팅',
      celebration: '축하 행사',
      all: '일반적인 상황',
    };

    const tasteMap = {
      sweet: '달콤한',
      bitter: '쌉싸름한',
      sour: '새콤한',
      light: '가벼운',
      medium: '중간',
      heavy: '묵직한',
    };

    return `당신은 음료 페어링 전문가 "페어리(Pairé)"입니다. 마법 같은 페어링으로 특별한 순간을 만들어주는 요정입니다.

**음식 분석 결과:**
- 감지된 키워드: ${foodAnalysis.keywords.join(', ')}
- 음식 카테고리: ${foodAnalysis.category}
- 요리 스타일: ${foodAnalysis.cuisine || '일반'}
- 음식 특징: ${foodAnalysis.characteristics.join(', ') || '일반적인 음식'}

**사용자 선택:**
- 상황: ${occasion ? occasionMap[occasion] || occasion : '일반적인 상황'}
- 선호하는 맛: ${tastes && tastes.length > 0 ? tastes.map(t => tasteMap[t] || t).join(', ') : '지정 안함'}

**추천 가능한 음료 목록:**
${drinkList}

**요청사항:**
1. 위 음료 목록에서 음식, 상황, 선호 맛을 고려하여 가장 잘 어울리는 음료 3개를 추천해주세요.
2. 각 음료마다:
   - 음식의 맛, 질감, 조리법과 음료의 특성이 어떻게 조화를 이루는지 구체적으로 설명
   - 선택한 상황에 왜 적합한지 설명
   - 선호 맛과 어떻게 연결되는지 설명
3. 페어리 브랜드 감성으로 전체 추천 메시지를 작성:
   - 친근하고 따뜻한 톤
   - 마법 같은 페어링의 특별함 강조
   - 5-7문장으로 충분히 길게 작성
   - 음식과 음료의 조화, 상황의 특별함을 모두 언급

**응답 형식 (JSON):**
{
  "recommendations": [
    {
      "drinkId": "음료 ID (위 목록의 ID 값 그대로)",
      "drinkName": "음료 이름 (한글)",
      "drinkNameEn": "음료 이름 (영어)",
      "drinkType": "음료 타입",
      "reason": "이 음료를 추천하는 이유 (3-4문장, 음식과의 구체적인 페어링 근거 + 상황 적합성)",
      "score": 95,
      "pairingNotes": "맛의 조화와 질감 매칭 설명 (2-3문장)"
    }
  ],
  "fairyMessage": "페어리의 추천 메시지 (5-7문장, 음식 분석 결과와 선택한 상황을 언급하며 마법 같은 페어링의 특별함을 전달하는 따뜻하고 친근한 톤)"
}

반드시 JSON 형식으로만 응답하세요.`;
  }

  /**
   * OpenAI 응답 파싱
   */
  private parseGeminiResponse(text: string): Omit<RecommendationResult, 'fromCache'> {
    try {
      // JSON 파싱 (OpenAI는 이미 JSON 형식으로 반환)
      const parsed = JSON.parse(text.trim());

      return {
        recommendations: parsed.recommendations || [],
        fairyMessage: parsed.fairyMessage || '맛있는 페어링을 즐겨보세요!',
      };
    } catch (error) {
      this.logger.error('Failed to parse OpenAI response:', error);
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
