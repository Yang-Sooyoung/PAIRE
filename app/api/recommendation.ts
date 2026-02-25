// app/api/recommendation.ts
// 추천 API 호출 함수
import apiClient from './client';

export interface CreateRecommendationPayload {
  imageUrl?: string;
  occasion: string;
  tastes: string[];
}

export interface Drink {
  id: string;
  name: string;
  type: string;
  description: string;
  tastingNotes: string[];
  image: string;
  price: string;
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
  payload: CreateRecommendationPayload,
  token?: string
): Promise<RecommendationResponse> {
  const response = await apiClient.post('/recommendation/create', payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
}

/**
 * 추천 히스토리 조회
 */
export async function getRecommendationHistory(
  token?: string,
  limit: number = 10,
  offset: number = 0
) {
  const response = await apiClient.get('/recommendation/history', {
    params: { limit, offset },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
}

/**
 * 추천 상세 조회
 */
export async function getRecommendationDetail(id: string, token?: string) {
  const response = await apiClient.get(`/recommendation/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return response.data;
}
