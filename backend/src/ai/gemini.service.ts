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
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn('GOOGLE_GENERATIVE_AI_KEY or GEMINI_API_KEY not found in environment variables');
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
    if (!this.genAI) {
      this.logger.error('Gemini API not initialized - using fallback');
      return this.getFallbackRecommendation(drinks, foodAnalysis);
    }

    // 음료 필터링 및 제한
    const filteredDrinks = this.filterDrinks(drinks, foodAnalysis, occasion, tastes, priceRange).slice(0, 20);

    const prompt = this.buildPrompt(foodAnalysis, filteredDrinks, occasion, tastes, priceRange, language);

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const response = result.response;
      const text = response.text();

      // JSON 파싱
      const parsed = this.parseGeminiResponse(text);

      return parsed;
    } catch (error) {
      this.logger.error('Gemini API error:', error);
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
    let filteredDrinks = drinks;
    
    if (tastes && tastes.includes('non-alcoholic')) {
      filteredDrinks = drinks.filter((drink) => {
        const type = drink.type.toLowerCase();
        return type.includes('non-alcoholic') || type.includes('tea') || 
               type.includes('coffee') || type.includes('juice') ||
               type.includes('논알콜') || type.includes('차') || type.includes('커피');
      });
    } else if (tastes && tastes.includes('alcoholic')) {
      filteredDrinks = drinks.filter((drink) => {
        const type = drink.type.toLowerCase();
        return type.includes('wine') || type.includes('whisky') || 
               type.includes('cocktail') || type.includes('beer') ||
               type.includes('sake') || type.includes('와인') || 
               type.includes('위스키') || type.includes('칵테일') || 
               type.includes('맥주') || type.includes('사케');
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

    return filteredByPrice.map((drink) => {
      let score = 0;

      const foodPairings = drink.foodPairings || [];
      if (foodPairings.some((pairing: string) =>
        foodAnalysis.keywords.some((keyword) =>
          pairing.toLowerCase().includes(keyword.toLowerCase()),
        ),
      )) {
        score += 10;
      }

      if (foodPairings.some((pairing: string) =>
        pairing.toLowerCase().includes(foodAnalysis.category.toLowerCase()),
      )) {
        score += 5;
      }

      if (tastes && tastes.length > 0) {
        const tastingNotes = drink.tastingNotes || [];
        if (tastingNotes.some((note: string) =>
          tastes.some((taste) => note.toLowerCase().includes(taste.toLowerCase())),
        )) {
          score += 3;
        }
      }

      return { ...drink, matchScore: score };
    }).sort((a, b) => b.matchScore - a.matchScore);
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
    const hasExistingDrinks = drinks && drinks.length > 0;
    const isKorean = language === 'ko';

    if (!hasExistingDrinks) {
      const basePrompt = isKorean 
        ? `당신은 음료 페어링 전문가입니다. 다음 조건에 맞는 음료 3개를 추천하고 상세 정보를 JSON으로 생성하세요.

음식: ${foodAnalysis.keywords.join(', ')} (${foodAnalysis.category})
상황: ${occasion || '일반'}
선호: ${tastes?.join(', ') || '없음'}
${priceRange ? `예산: ${priceRange}` : ''}

반드시 이 JSON 구조로만 응답:
{
  "recommendations": [
    {
      "drinkId": "wine_001",
      "drinkName": "음료한글이름",
      "drinkNameEn": "English Name",
      "drinkType": "wine",
      "description": "설명",
      "tastingNotes": ["맛1", "맛2", "맛3"],
      "price": "₩50000",
      "image": "https://images.unsplash.com/photo-...",
      "reason": "추천이유",
      "score": 95,
      "pairingNotes": "페어링설명"
    }
  ],
  "fairyMessage": "페어리메시지"
}`
        : `You are a drink pairing expert. Recommend 3 drinks matching these conditions and respond ONLY in JSON:

Food: ${foodAnalysis.keywords.join(', ')} (${foodAnalysis.category})
Occasion: ${occasion || 'general'}
Preferences: ${tastes?.join(', ') || 'none'}
${priceRange ? `Budget: ${priceRange}` : ''}

Respond ONLY in this JSON structure:
{
  "recommendations": [
    {
      "drinkId": "wine_001",
      "drinkName": "Korean Name",
      "drinkNameEn": "English Name",
      "drinkType": "wine",
      "description": "description",
      "tastingNotes": ["taste1", "taste2", "taste3"],
      "price": "₩50000",
      "image": "https://images.unsplash.com/photo-...",
      "reason": "recommendation reason",
      "score": 95,
      "pairingNotes": "pairing notes"
    }
  ],
  "fairyMessage": "fairy message"
}`;

      return basePrompt;
    }

    // 기존 음료가 있으면 기존 방식 사용
    const drinkList = drinks
      .map((d, i) => `${i + 1}. ${d.id}|${d.name}|${d.type}|${d.price}`)
      .join('\n');

    const existingDrinkPrompt = isKorean
      ? `음식: ${foodAnalysis.keywords.join(', ')} (${foodAnalysis.category})
상황: ${occasion || '일반'}
선호: ${tastes?.join(', ') || '없음'}

음료목록:
${drinkList}

위 음료 중 3개 선택해서 추천. 반드시 JSON으로만 응답:
{
  "recommendations": [
    {
      "drinkId": "ID",
      "drinkName": "한글이름",
      "drinkNameEn": "영어이름",
      "drinkType": "타입",
      "reason": "추천이유",
      "score": 95,
      "pairingNotes": "페어링설명"
    }
  ],
  "fairyMessage": "페어리메시지"
}`
      : `Food: ${foodAnalysis.keywords.join(', ')} (${foodAnalysis.category})
Occasion: ${occasion || 'general'}
Preferences: ${tastes?.join(', ') || 'none'}

Drink list:
${drinkList}

Select 3 drinks from the list above. Respond ONLY in JSON:
{
  "recommendations": [
    {
      "drinkId": "ID",
      "drinkName": "Korean name",
      "drinkNameEn": "English name",
      "drinkType": "type",
      "reason": "recommendation reason",
      "score": 95,
      "pairingNotes": "pairing notes"
    }
  ],
  "fairyMessage": "fairy message"
}`;

    return existingDrinkPrompt;
  }

  /**
   * Gemini 응답 파싱
   */
  private parseGeminiResponse(text: string): Omit<RecommendationResult, 'fromCache'> {
    try {
      // JSON 블록 추출
      let jsonStr = text;
      
      // ```json ... ``` 형식 제거
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      // 첫 { 부터 마지막 } 까지만 추출
      const startIdx = jsonStr.indexOf('{');
      const endIdx = jsonStr.lastIndexOf('}');
      if (startIdx === -1 || endIdx === -1) {
        throw new Error('No JSON object found');
      }
      jsonStr = jsonStr.substring(startIdx, endIdx + 1);

      const parsed = JSON.parse(jsonStr);

      const recommendations = (parsed.recommendations || []).map((rec: any) => ({
        drinkId: rec.drinkId || '',
        drinkName: rec.drinkName || '',
        drinkNameEn: rec.drinkNameEn || '',
        drinkType: rec.drinkType || '',
        description: rec.description || '',
        tastingNotes: rec.tastingNotes || [],
        price: rec.price || '',
        image: rec.image || '',
        reason: rec.reason || '',
        score: rec.score || 80,
        pairingNotes: rec.pairingNotes || '',
      }));

      return {
        recommendations,
        fairyMessage: parsed.fairyMessage || '맛있는 페어링을 즐겨보세요!',
      };
    } catch (error) {
      this.logger.error('Failed to parse Gemini response:', error, 'Raw text:', text);
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
      description: drink.description || '',
      tastingNotes: drink.tastingNotes || [],
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
