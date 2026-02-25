import { Injectable } from '@nestjs/common';
import * as vision from '@google-cloud/vision';
import * as path from 'path';

export interface FoodAnalysis {
  keywords: string[];
  category: string;
  cuisine?: string;
  characteristics: string[];
}

@Injectable()
export class VisionService {
  private client: vision.ImageAnnotatorClient;

  constructor() {
    // Railway 환경에서는 환경 변수로 credentials 설정
    if (process.env.GOOGLE_CREDENTIALS_JSON) {
      try {
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        this.client = new vision.ImageAnnotatorClient({
          credentials,
        });
        console.log('Vision API initialized with JSON credentials');
      } catch (error) {
        console.error('Failed to parse GOOGLE_CREDENTIALS_JSON:', error);
        // Fallback to file
        this.initializeWithFile();
      }
    } else {
      this.initializeWithFile();
    }
  }

  private initializeWithFile() {
    const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      path.join(process.cwd(), 'service-account-key.json');

    console.log('Vision API key path:', keyPath);

    this.client = new vision.ImageAnnotatorClient({
      keyFilename: keyPath,
    });
  }

  /**
   * 이미지에서 음식 상세 분석
   */
  async analyzeFoodImage(imageUrl: string): Promise<FoodAnalysis> {
    try {
      const request = {
        image: { source: { imageUri: imageUrl } },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 20 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
          { type: 'IMAGE_PROPERTIES' },
        ],
      };

      const [result] = await this.client.annotateImage(request);
      const labels = result.labelAnnotations || [];
      const objects = result.localizedObjectAnnotations || [];

      // 키워드 추출
      const keywords = this.extractKeywords(labels, objects);

      // 카테고리 분류
      const category = this.categorizeFood(keywords);

      // 요리 스타일 추론
      const cuisine = this.detectCuisine(keywords);

      // 특징 추출 (조리법, 질감 등)
      const characteristics = this.extractCharacteristics(keywords);

      return {
        keywords,
        category,
        cuisine,
        characteristics,
      };
    } catch (error) {
      console.error('Vision API 오류:', error);
      // 폴백
      return {
        keywords: ['음식'],
        category: 'general',
        characteristics: [],
      };
    }
  }

  /**
   * 키워드 추출
   */
  private extractKeywords(labels: any[], objects: any[]): string[] {
    const allLabels = [
      ...labels.map((l) => l.description.toLowerCase()),
      ...objects.map((o) => o.name.toLowerCase()),
    ];

    // 음식 관련 키워드만 필터링
    const foodKeywords = allLabels.filter((label) => this.isFoodRelated(label));

    // 중복 제거 및 상위 10개
    return [...new Set(foodKeywords)].slice(0, 10);
  }

  /**
   * 음식 카테고리 분류
   */
  private categorizeFood(keywords: string[]): string {
    const categories = {
      meat: ['meat', 'beef', 'pork', 'chicken', 'lamb', 'steak', '고기', '소고기', '돼지고기', '닭고기'],
      seafood: ['fish', 'seafood', 'salmon', 'tuna', 'shrimp', 'crab', '생선', '해산물', '연어', '새우'],
      pasta: ['pasta', 'spaghetti', 'noodle', 'linguine', '파스타', '면', '국수'],
      pizza: ['pizza', '피자'],
      salad: ['salad', 'vegetable', '샐러드', '채소'],
      soup: ['soup', 'stew', 'broth', '국', '찌개', '스프'],
      dessert: ['dessert', 'cake', 'ice cream', 'sweet', '디저트', '케이크', '아이스크림'],
      cheese: ['cheese', 'charcuterie', '치즈'],
      fried: ['fried', 'tempura', 'crispy', '튀김', '바삭'],
      grilled: ['grilled', 'bbq', 'barbecue', '구이', '바비큐'],
    };

    for (const [category, terms] of Object.entries(categories)) {
      if (keywords.some((kw) => terms.some((term) => kw.includes(term)))) {
        return category;
      }
    }

    return 'general';
  }

  /**
   * 요리 스타일 감지
   */
  private detectCuisine(keywords: string[]): string | undefined {
    const cuisines = {
      italian: ['pasta', 'pizza', 'risotto', 'italian', '파스타', '피자', '이탈리안'],
      korean: ['kimchi', 'korean', 'bibimbap', '김치', '한식', '비빔밥'],
      japanese: ['sushi', 'sashimi', 'ramen', 'japanese', '초밥', '회', '라멘', '일식'],
      chinese: ['chinese', 'dim sum', 'wonton', '중식', '딤섬'],
      french: ['french', 'escargot', 'foie gras', '프렌치'],
      american: ['burger', 'steak', 'bbq', '버거', '스테이크'],
    };

    for (const [cuisine, terms] of Object.entries(cuisines)) {
      if (keywords.some((kw) => terms.some((term) => kw.includes(term)))) {
        return cuisine;
      }
    }

    return undefined;
  }

  /**
   * 음식 특징 추출
   */
  private extractCharacteristics(keywords: string[]): string[] {
    const characteristics: string[] = [];

    const charMap = {
      grilled: ['grilled', 'roasted', 'charred', '구이', '로스트'],
      fried: ['fried', 'crispy', 'tempura', '튀김', '바삭'],
      creamy: ['cream', 'creamy', 'rich', '크림', '부드러운'],
      spicy: ['spicy', 'hot', 'chili', '매운', '고추'],
      sweet: ['sweet', 'dessert', 'sugar', '달콤', '디저트'],
      savory: ['savory', 'umami', 'salty', '짭짤', '감칠맛'],
      light: ['light', 'fresh', 'salad', '가벼운', '신선한'],
      heavy: ['heavy', 'rich', 'hearty', '무거운', '진한'],
    };

    for (const [char, terms] of Object.entries(charMap)) {
      if (keywords.some((kw) => terms.some((term) => kw.includes(term)))) {
        characteristics.push(char);
      }
    }

    return characteristics;
  }

  /**
   * 이미지에서 음식 라벨 감지 (기존 호환성)
   */
  async detectFoodLabels(imageUrl: string): Promise<string[]> {
    const analysis = await this.analyzeFoodImage(imageUrl);
    return analysis.keywords;
  }

  /**
   * 음식 관련 라벨 판별
   */
  private isFoodRelated(label: string): boolean {
    const foodKeywords = [
      '음식', 'food', '요리', 'dish', '밥', 'rice', '면', 'noodle',
      '고기', 'meat', '생선', 'fish', '채소', 'vegetable', '과일', 'fruit',
      '치즈', 'cheese', '버터', 'butter', '소스', 'sauce', '스프', 'soup',
      '샐러드', 'salad', '디저트', 'dessert', '케이크', 'cake', '빵', 'bread',
      '피자', 'pizza', '파스타', 'pasta', '스테이크', 'steak', '해산물', 'seafood',
      '카레', 'curry', '국', 'soup', '찌개', 'stew', '구이', 'grilled',
      '튀김', 'fried', '볶음', 'stir-fried', '조림', 'braised', '구이', 'roasted',
      'ingredient', 'cuisine', 'tableware', 'plate', 'bowl',
    ];

    const lowerLabel = label.toLowerCase();
    return foodKeywords.some((keyword) => lowerLabel.includes(keyword));
  }

  /**
   * 이미지 URL 유효성 검사
   */
  async validateImageUrl(imageUrl: string): Promise<boolean> {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}
