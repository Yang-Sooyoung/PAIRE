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
  drinkNameEn?: string;
  drinkType: string;
  description?: string;
  tastingNotes?: string[];
  price?: string;
  image?: string;
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
      this.logger.log('Gemini AI initialized successfully');
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
    const cacheKey = this.generateCacheKey(foodAnalysis, occasion, tastes, priceRange, language);

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
   * Gemini로 음료 추천 생성
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

    // Gemini 클라이언트가 없으면 폴백
    if (!this.genAI) {
      this.logger.warn('Gemini client not initialized, using fallback');
      return this.getFallbackRecommendation(filteredDrinks, foodAnalysis);
    }

    const prompt = this.buildPrompt(foodAnalysis, filteredDrinks, occasion, tastes, priceRange, language);

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-3.8-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      this.logger.log('Gemini response received, parsing...');

      const parsed = this.parseGeminiResponse(text);
      return parsed;
    } catch (error) {
      this.logger.error('Gemini API error:', error);
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
    let filteredDrinks = drinks;

    // 논알콜 필터링 (최우선)
    if (tastes && tastes.includes('non-alcoholic')) {
      filteredDrinks = drinks.filter((drink) => {
        const type = drink.type.toLowerCase();
        return (
          type.includes('non-alcoholic') ||
          type.includes('tea') ||
          type.includes('coffee') ||
          type.includes('juice') ||
          type.includes('논알콜') ||
          type.includes('차') ||
          type.includes('커피')
        );
      });
    } else if (tastes && tastes.includes('alcoholic')) {
      filteredDrinks = drinks.filter((drink) => {
        const type = drink.type.toLowerCase();
        return (
          type.includes('wine') ||
          type.includes('whisky') ||
          type.includes('cocktail') ||
          type.includes('beer') ||
          type.includes('sake') ||
          type.includes('와인') ||
          type.includes('위스키') ||
          type.includes('칵테일') ||
          type.includes('맥주') ||
          type.includes('사케')
        );
      });
    }

    // 가격 범위 필터링
    let filteredByPrice = filteredDrinks;
    if (priceRange) {
      const priceRanges: Record<string, [number, number]> = {
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

        if (
          foodPairings.some((pairing: string) =>
            pairing.toLowerCase().includes(foodAnalysis.category.toLowerCase()),
          )
        ) {
          score += 5;
        }

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
   * 프롬프트 생성
   */
  private buildPrompt(
    foodAnalysis: FoodAnalysis,
    drinks: any[],
    occasion?: string,
    tastes?: string[],
    priceRange?: string,
    language?: string,
  ): string {
    const occasionMap: Record<string, string> = {
      date: '데이트',
      solo: '혼자',
      friends: '친구모임',
      family: '가족',
      business: '비즈니스',
      celebration: '축하',
      all: '일반',
    };

    const priceRangeMap: Record<string, string> = {
      budget: '₩10,000 이하',
      moderate: '₩10,000-30,000',
      premium: '₩30,000-50,000',
      luxury: '₩50,000 이상',
    };

    const hasExistingDrinks = drinks && drinks.length > 0;
    const isKorean = language === 'ko';

    const nonAlcoholicNote = tastes?.includes('non-alcoholic')
      ? (isKorean ? '**중요: 논알콜 음료만 추천**' : '**IMPORTANT: Only non-alcoholic drinks**')
      : '';
    const alcoholicNote = tastes?.includes('alcoholic')
      ? (isKorean ? '**중요: 알콜 음료만 추천**' : '**IMPORTANT: Only alcoholic drinks**')
      : '';

    if (!hasExistingDrinks) {
      if (isKorean) {
        return `당신은 음료 페어링 전문가입니다. 다음 조건에 맞는 음료 3개를 추천하고 상세 정보를 생성하세요.

음식: ${foodAnalysis.keywords.join(', ')} (${foodAnalysis.category})
상황: ${occasion ? occasionMap[occasion] || occasion : '일반'}
선호: ${tastes?.join(', ') || '없음'}
${priceRange ? `예산: ${priceRangeMap[priceRange] || priceRange}` : ''}
${nonAlcoholicNote}
${alcoholicNote}

각 음료마다 다음 정보를 한글로 생성하세요. 반드시 JSON만 반환하세요:
{
  "recommendations": [
    {
      "drinkId": "wine_001",
      "drinkName": "한글 이름 (예: 아페롤 스프리츠, 샤르도네)",
      "drinkNameEn": "English name",
      "drinkType": "wine | whisky | cocktail | beer | sake | tea | coffee | juice",
      "description": "음료 설명 2-3문장 (한글)",
      "tastingNotes": ["맛 표현1", "맛 표현2", "맛 표현3"],
      "price": "₩가격",
      "image": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=600&fit=crop",
      "reason": "추천 이유 3-4문장 (한글)",
      "score": 95,
      "pairingNotes": "페어링 설명 2-3문장 (한글)"
    }
  ],
  "fairyMessage": "페어리 메시지 5-7문장, 음식과 상황을 언급하며 따뜻하고 친근한 톤 (한글)"
}`;
      } else {
        return `You are a drink pairing expert. Recommend 3 drinks matching the conditions below. Return JSON only:

Food: ${foodAnalysis.keywords.join(', ')} (${foodAnalysis.category})
Occasion: ${occasion || 'general'}
Preferences: ${tastes?.join(', ') || 'none'}
${priceRange ? `Budget: ${priceRange}` : ''}
${nonAlcoholicNote}
${alcoholicNote}

{
  "recommendations": [
    {
      "drinkId": "wine_001",
      "drinkName": "Korean name",
      "drinkNameEn": "English name",
      "drinkType": "wine | whisky | cocktail | beer | sake | tea | coffee | juice",
      "description": "2-3 sentence description",
      "tastingNotes": ["note1", "note2", "note3"],
      "price": "₩price",
      "image": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=600&fit=crop",
      "reason": "3-4 sentence reason",
      "score": 95,
      "pairingNotes": "2-3 sentence pairing notes"
    }
  ],
  "fairyMessage": "5-7 sentence fairy message mentioning the food and occasion, warm friendly tone"
}`;
      }
    }

    // 기존 DB 음료가 있는 경우
    const drinkList = drinks
      .map((d, i) => `${i + 1}. ${d.id}|${d.name}|${d.type}|${d.price}|${(d.tastingNotes || []).slice(0, 3).join(',')}`)
      .join('\n');

    if (isKorean) {
      return `음식: ${foodAnalysis.keywords.join(', ')} (${foodAnalysis.category})
상황: ${occasion ? occasionMap[occasion] || occasion : '일반'}
선호: ${tastes?.join(', ') || '없음'}
${priceRange ? `예산: ${priceRangeMap[priceRange] || priceRange}` : ''}
${nonAlcoholicNote}
${alcoholicNote}

음료목록 (ID|이름|타입|가격|맛):
${drinkList}

위 음료 중 3개 추천. 반드시 JSON만 반환:
{
  "recommendations": [
    {
      "drinkId": "목록의 ID",
      "drinkName": "한글이름",
      "drinkNameEn": "영어이름",
      "drinkType": "타입",
      "description": "설명 2-3문장 (한글)",
      "tastingNotes": ["맛1", "맛2", "맛3"],
      "reason": "추천이유 3-4문장 (한글)",
      "score": 95,
      "pairingNotes": "페어링 설명 2-3문장 (한글)"
    }
  ],
  "fairyMessage": "페어리 메시지 5-7문장 (한글)"
}`;
    } else {
      return `Food: ${foodAnalysis.keywords.join(', ')} (${foodAnalysis.category})
Occasion: ${occasion || 'general'}
Preferences: ${tastes?.join(', ') || 'none'}
${priceRange ? `Budget: ${priceRange}` : ''}
${nonAlcoholicNote}
${alcoholicNote}

Drink list (ID|Name|Type|Price|Taste):
${drinkList}

Recommend 3 drinks from the list. Return JSON only:
{
  "recommendations": [
    {
      "drinkId": "ID from list",
      "drinkName": "Korean name",
      "drinkNameEn": "English name",
      "drinkType": "type",
      "description": "2-3 sentence description",
      "tastingNotes": ["note1", "note2", "note3"],
      "reason": "3-4 sentence reason",
      "score": 95,
      "pairingNotes": "2-3 sentence pairing notes"
    }
  ],
  "fairyMessage": "5-7 sentence fairy message (English)"
}`;
    }
  }

  /**
   * Gemini 응답 파싱
   */
  private parseGeminiResponse(text: string): Omit<RecommendationResult, 'fromCache'> {
    try {
      // Gemini가 가끔 ```json ... ``` 코드블록으로 감싸서 반환할 때 처리
      const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(cleaned);

      const rawRecommendations = parsed.recommendations || parsed.drinks || [];

      if (!Array.isArray(rawRecommendations) || rawRecommendations.length === 0) {
        this.logger.warn('Gemini response has no recommendations, using fallback');
        throw new Error('No recommendations in response');
      }

      const recommendations = rawRecommendations.map((rec: any) => ({
        drinkId: rec.drinkId || `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        drinkName: rec.drinkName || rec.name || '추천 음료',
        drinkNameEn: rec.drinkNameEn || rec.nameEn || rec.drinkName || rec.name || '',
        drinkType: rec.drinkType || rec.type || 'cocktail',
        description: rec.description || '',
        tastingNotes: Array.isArray(rec.tastingNotes) ? rec.tastingNotes : [],
        price: rec.price || '',
        image: rec.image || '',
        reason: rec.reason || '',
        score: rec.score || 80,
        pairingNotes: rec.pairingNotes || '',
      }));

      return {
        recommendations,
        fairyMessage: parsed.fairyMessage || parsed.message || '맛있는 페어링을 즐겨보세요!',
      };
    } catch (error) {
      this.logger.error('Failed to parse Gemini response:', error);
      this.logger.error('Raw response:', text);
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
    const recommended = drinks.slice(0, 3).map((drink) => ({
      drinkId: drink.id,
      drinkName: drink.name,
      drinkNameEn: drink.name,
      drinkType: drink.type,
      // description과 tastingNotes를 채워줘야 enrichDrinkData에서 AI 경로로 처리됨
      description: drink.description || `${drink.name}은(는) ${foodAnalysis.category} 요리와 잘 어울립니다.`,
      tastingNotes: drink.tastingNotes && drink.tastingNotes.length > 0 ? drink.tastingNotes : ['부드러운', '균형잡힌'],
      price: drink.price || '',
      image: drink.image || '',
      reason: `${drink.name}은(는) ${foodAnalysis.category} 요리와 잘 어울립니다.`,
      score: 80,
      pairingNotes: drink.description || '',
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
    language?: string,
  ): string {
    const data = {
      keywords: foodAnalysis.keywords.sort(),
      category: foodAnalysis.category,
      occasion: occasion || '',
      tastes: (tastes || []).sort(),
      priceRange: priceRange || '',
      language: language || 'en',
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
