import { Injectable } from '@nestjs/common';
import * as vision from '@google-cloud/vision';
import * as path from 'path';

@Injectable()
export class VisionService {
  private client: vision.ImageAnnotatorClient;

  constructor() {
    // service-account-key.json 경로 설정
    const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
                    path.join(process.cwd(), 'service-account-key.json');
    
    console.log('Vision API key path:', keyPath);
    
    this.client = new vision.ImageAnnotatorClient({
      keyFilename: keyPath,
    });
  }

  /**
   * 이미지에서 음식 라벨 감지
   */
  async detectFoodLabels(imageUrl: string): Promise<string[]> {
    try {
      const request = {
        image: { source: { imageUri: imageUrl } },
        features: [
          { type: 'LABEL_DETECTION' },
          { type: 'OBJECT_LOCALIZATION' },
        ],
        maxResults: 10,
      };

      const [result] = await this.client.annotateImage(request);
      const labels = result.labelAnnotations || [];

      // 음식 관련 라벨 필터링
      const foodLabels = labels
        .filter((label) => this.isFoodRelated(label.description))
        .map((label) => label.description)
        .slice(0, 5);

      return foodLabels.length > 0 ? foodLabels : ['음식'];
    } catch (error) {
      console.error('Vision API 오류:', error);
      return ['음식'];
    }
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
