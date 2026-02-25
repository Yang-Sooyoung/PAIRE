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
    priceRange?: string,
    language?: string,
  ): Promise<RecommendationResult> {
    // 캐시 키 생성
    const cacheKey = this.generateCacheKey(foodAnalysis, occasion, tastes, priceRange);

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
      priceRange,
      language,
    );

    // 캐시 저장
    await this.saveToCache(cacheKey, foodAnalysis, occasion, tastes, priceRange, result);

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
    priceRange?: string,
    language?: string,
  ): Promise<Omit<RecommendationResult, 'fromCache'>> {
    // 음료 필터링 및 제한 (최대 20개만 사용하여 토큰 절약)
    const filteredDrinks = this.filterDrinks(drinks, foodAnalysis, occasion, tastes, priceRange).slice(0, 20);

    const prompt = this.buildPrompt(foodAnalysis, filteredDrinks, occasion, tastes, priceRange, language);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '음료 페어링 전문가로서 JSON 형식으로만 응답하세요.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500, // 응답 토큰 제한 (비용 절감)
        response_format: { type: 'json_object' },
      });

      const text = completion.choices[0]?.message?.content || '{}';

      // JSON 파싱
      const parsed = this.parseGeminiResponse(text);

      return parsed;
    } catch (error) {
      this.logger.error('OpenAI API error:', error);
      // 폴백: 기본 추천
      return this.getFallbackRecommendation(filteredDrinks, foodAnalysis);
    }
  }

  /**
   * 음료 필터링 (관련성 높은 음료만 선택)
   */
  private filterDrinks(
    drinks: any[],
    foodAnalysis: FoodAnalysis,
    occasion?: string,
    tastes?: string[],
    priceRange?: string,
  ): any[] {
    // 논알콜 필터링 (최우선)
    let filteredDrinks = drinks;
    if (tastes && tastes.includes('non-alcoholic')) {
      filteredDrinks = drinks.filter((drink) => {
        const type = drink.type.toLowerCase();
        const isNonAlcoholic = 
          type.includes('non-alcoholic') || 
          type.includes('tea') || 
          type.includes('coffee') ||
          type.includes('juice') ||
          type.includes('논알콜') ||
          type.includes('차') ||
          type.includes('커피');
        return isNonAlcoholic;
      });
    } else if (tastes && tastes.includes('alcoholic')) {
      // 알콜만 필터링
      filteredDrinks = drinks.filter((drink) => {
        const type = drink.type.toLowerCase();
        const isAlcoholic = 
          type.includes('wine') || 
          type.includes('whisky') || 
          type.includes('cocktail') ||
          type.includes('beer') ||
          type.includes('sake') ||
          type.includes('와인') ||
          type.includes('위스키') ||
          type.includes('칵테일') ||
          type.includes('맥주') ||
          type.includes('사케');
        return isAlcoholic;
      });
    }

    // 가격 범위 필터링
    let filteredByPrice = filteredDrinks;
    if (priceRange) {
      const priceRanges = {
        budget: [0, 10000],
        moderate: [10000, 30000],
        premium: [30000, 50000],
        luxury: [50000, 999999],
      };
      const [min, max] = priceRanges[priceRange] || [0, 999999];
      filteredByPrice = filteredDrinks.filter((drink) => {
        const price = parseInt(drink.price.replace(/[^0-9]/g, '')) || 0;
        return price >= min && price <= max;
      });
    }

    // 음식 카테고리와 키워드를 기반으로 점수 계산
    return filteredByPrice
      .map((drink) => {
        let score = 0;

        // 음식 페어링 매칭
        const foodPairings = drink.foodPairings || [];
        if (
          foodPairings.some((pairing: string) =>
            foodAnalysis.keywords.some((keyword) =>
              pairing.toLowerCase().includes(keyword.toLowerCase()),
            ),
          )
        ) {
          score += 10;
        }

        // 카테고리 매칭
        if (
          foodPairings.some((pairing: string) =>
            pairing.toLowerCase().includes(foodAnalysis.category.toLowerCase()),
          )
        ) {
          score += 5;
        }

        // 맛 선호도 매칭
        if (tastes && tastes.length > 0) {
          const tastingNotes = drink.tastingNotes || [];
          if (
            tastingNotes.some((note: string) =>
              tastes.some((taste) => note.toLowerCase().includes(taste.toLowerCase())),
            )
          ) {
            score += 3;
          }
        }

        return { ...drink, matchScore: score };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * 프롬프트 생성 (GPT가 음료 정보를 생성하도록)
   */
  private buildPrompt(
    foodAnalysis: FoodAnalysis,
    drinks: any[],
    occasion?: string,
    tastes?: string[],
    priceRange?: string,
    language?: string,
  ): string {
    const occasionMap = {
      date: '데이트',
      solo: '혼자',
      friends: '친구모임',
      family: '가족',
      business: '비즈니스',
      celebration: '축하',
      all: '일반',
    };

    const priceRangeMap = {
      budget: '₩10,000 이하',
      moderate: '₩10,000-30,000',
      premium: '₩30,000-50,000',
      luxury: '₩50,000 이상',
    };

    // 음료 DB가 비어있으면 GPT가 직접 생성
    const hasExistingDrinks = drinks && drinks.length > 0;
    const isKorean = language === 'ko';

    if (!hasExistingDrinks) {
      if (isKorean) {
        return `당신은 음료 페어링 전문가입니다. 다음 조건에 맞는 음료 3개를 추천하고 상세 정보를 생성하세요.

음식: ${foodAnalysis.keywords.join(', ')} (${foodAnalysis.category})
상황: ${occasion ? occasionMap[occasion] || occasion : '일반'}
선호: ${tastes?.join(', ') || '없음'}
${priceRange ? `예산: ${priceRangeMap[priceRange] || priceRange}` : ''}
${tastes?.includes('non-alcoholic') ? '**중요: 논알콜 음료만 추천**' : ''}
${tastes?.includes('alcoholic') ? '**중요: 알콜 음료만 추천**' : ''}

각 음료마다 다음 정보를 한글로 생성하세요:
- 실제 존재하는 음료 이름 (한글, 영어)
- 음료 타입 (wine, whisky, cocktail, tea, coffee, juice 등)
- 상세 설명 (한글)
- 테이스팅 노트 (3-5개, 한글)
- 예상 가격
- 이미지 URL (Unsplash 검색 URL 형식)
- 추천 이유 (음식과의 페어링 근거 3-4문장, 한글)
- 페어링 노트 (맛의 조화 설명 2-3문장, 한글)

JSON 형식:
{
  "recommendations": [
    {
      "drinkId": "생성된 고유 ID (예: wine_001)",
      "drinkName": "한글 이름",
      "drinkNameEn": "영어 이름",
      "drinkType": "타입",
      "description": "음료 설명 (한글)",
      "tastingNotes": ["맛1", "맛2", "맛3"],
      "price": "₩가격",
      "image": "https://images.unsplash.com/photo-...",
      "reason": "추천 이유 (3-4문장, 한글)",
      "score": 95,
      "pairingNotes": "페어링 설명 (2-3문장, 한글)"
    }
  ],
  "fairyMessage": "페어리 메시지 (5-7문장, 음식 분석과 상황을 언급하며 따뜻하고 친근한 톤, 한글)"
}`;
      } else {
        return `You are a drink pairing expert. Recommend 3 drinks that match the following conditions and generate detailed information.

Food: ${foodAnalysis.keywords.join(', ')} (${foodAnalysis.category})
Occasion: ${occasion || 'general'}
Preferences: ${tastes?.join(', ') || 'none'}
${priceRange ? `Budget: ${priceRange}` : ''}
${tastes?.includes('non-alcoholic') ? '**IMPORTANT: Only non-alcoholic drinks**' : ''}
${tastes?.includes('alcoholic') ? '**IMPORTANT: Only alcoholic drinks**' : ''}

Generate the following information for each drink in English:
- Real drink name (Korean, English)
- Drink type (wine, whisky, cocktail, tea, coffee, juice, etc.)
- Detailed description (English)
- Tasting notes (3-5, English)
- Estimated price
- Image URL (Unsplash search URL format)
- Recommendation reason (3-4 sentences about food pairing, English)
- Pairing notes (2-3 sentences about flavor harmony, English)

JSON format:
{
  "recommendations": [
    {
      "drinkId": "generated unique ID (e.g., wine_001)",
      "drinkName": "Korean name",
      "drinkNameEn": "English name",
      "drinkType": "type",
      "description": "drink description (English)",
      "tastingNotes": ["taste1", "taste2", "taste3"],
      "price": "₩price",
      "image": "https://images.unsplash.com/photo-...",
      "reason": "recommendation reason (3-4 sentences, English)",
      "score": 95,
      "pairingNotes": "pairing description (2-3 sentences, English)"
    }
  ],
  "fairyMessage": "Fairy message (5-7 sentences, mentioning food analysis and occasion with warm and friendly tone, English)"
}`;
      }
    }

    // 기존 음료가 있으면 기존 방식 사용
    const drinkList = drinks
      .map((d, i) => `${i + 1}. ${d.id}|${d.name}|${d.type}|${d.price}|${d.tastingNotes.slice(0, 3).join(',')}`)
      .join('\n');

    if (isKorean) {
      return `음식: ${foodAnalysis.keywords.join(', ')} (${foodAnalysis.category})
상황: ${occasion ? occasionMap[occasion] || occasion : '일반'}
선호: ${tastes?.join(', ') || '없음'}
${priceRange ? `예산: ${priceRangeMap[priceRange] || priceRange}` : ''}
${tastes?.includes('non-alcoholic') ? '**중요: 논알콜 음료만 추천**' : ''}
${tastes?.includes('alcoholic') ? '**중요: 알콜 음료만 추천**' : ''}

음료목록 (ID|이름|타입|가격|맛):
${drinkList}

위 음료 중 3개 추천. 모든 설명은 한글로 작성. JSON 형식:
{
  "recommendations": [
    {
      "drinkId": "ID",
      "drinkName": "한글이름",
      "drinkNameEn": "영어이름",
      "drinkType": "타입",
      "reason": "추천이유 (3-4문장, 한글)",
      "score": 95,
      "pairingNotes": "페어링 설명 (2-3문장, 한글)"
    }
  ],
  "fairyMessage": "페어리 메시지 (5-7문장, 따뜻하고 친근한 톤, 한글)"
}`;
    } else {
      return `Food: ${foodAnalysis.keywords.join(', ')} (${foodAnalysis.category})
Occasion: ${occasion || 'general'}
Preferences: ${tastes?.join(', ') || 'none'}
${priceRange ? `Budget: ${priceRange}` : ''}
${tastes?.includes('non-alcoholic') ? '**IMPORTANT: Only non-alcoholic drinks**' : ''}
${tastes?.includes('alcoholic') ? '**IMPORTANT: Only alcoholic drinks**' : ''}

Drink list (ID|Name|Type|Price|Taste):
${drinkList}

Recommend 3 drinks from the list above. All descriptions in English. JSON format:
{
  "recommendations": [
    {
      "drinkId": "ID",
      "drinkName": "Korean name",
      "drinkNameEn": "English name",
      "drinkType": "type",
      "reason": "recommendation reason (3-4 sentences, English)",
      "score": 95,
      "pairingNotes": "pairing description (2-3 sentences, English)"
    }
  ],
  "fairyMessage": "Fairy message (5-7 sentences, warm and friendly tone, English)"
}`;
    }
  }

  /**
   * OpenAI 응답 파싱
   */
  private parseGeminiResponse(text: string): Omit<RecommendationResult, 'fromCache'> {
    try {
      // JSON 파싱 (OpenAI는 이미 JSON 형식으로 반환)
      const parsed = JSON.parse(text.trim());

      // recommendations에 음료 상세 정보가 포함되어 있는지 확인
      const recommendations = (parsed.recommendations || []).map((rec: any) => ({
        drinkId: rec.drinkId,
        drinkName: rec.drinkName,
        drinkNameEn: rec.drinkNameEn,
        drinkType: rec.drinkType,
        description: rec.description || '',
        tastingNotes: rec.tastingNotes || [],
        price: rec.price || '',
        image: rec.image || '',
        reason: rec.reason,
        score: rec.score,
        pairingNotes: rec.pairingNotes,
      }));

      return {
        recommendations,
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
    priceRange?: string,
  ): string {
    const data = {
      keywords: foodAnalysis.keywords.sort(),
      category: foodAnalysis.category,
      occasion: occasion || '',
      tastes: (tastes || []).sort(),
      priceRange: priceRange || '',
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
    priceRange: string | undefined,
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
