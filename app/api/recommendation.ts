// app/api/recommendation.ts
// 추천 API 호출 함수
import apiClient from './client';

export interface CreateRecommendationPayload {
  imageUrl?: string;
  occasion: string;
  tastes: string[];
  priceRange?: string;
}

export interface Drink {
  id: string;
  name: string;
  type: string;
  description: string;
  tastingNotes: string[];
  image: string | null;
  price: string;
  purchaseUrl?: string;
  aiReason?: string;
  aiScore?: number;
  pairingNotes?: string;
}

export interface RecommendationResponse {
  recommendation: {
    id: string;
    drinks: Drink[];
    detectedFoods: string[];
    fairyMessage: string;
    createdAt: string;
  };
}

/**
 * 추천 생성
 */
export async function createRecommendation(
  payload: CreateRecommendationPayload
): Promise<RecommendationResponse> {
  const response = await apiClient.post('/recommendation/create', payload);
  return response.data;
}

/**
 * 추천 히스토리 조회
 */
export async function getRecommendationHistory(
  limit: number = 10,
  offset: number = 0
) {
  const response = await apiClient.get('/recommendation/history', {
    params: { limit, offset },
  });
  return response.data;
}

/**
 * 추천 상세 조회
 */
export async function getRecommendationDetail(id: string) {
  const response = await apiClient.get(`/recommendation/${id}`);
  return response.data;
}
