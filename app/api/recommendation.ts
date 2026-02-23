// app/api/recommendation.ts
// 추천 API 호출 함수

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/recommendation/create`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || '추천 생성 실패');
  }

  return res.json();
}

/**
 * 추천 히스토리 조회
 */
export async function getRecommendationHistory(
  token: string,
  limit: number = 10,
  offset: number = 0
) {
  const res = await fetch(
    `${API_URL}/recommendation/history?limit=${limit}&offset=${offset}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('401: Unauthorized');
    }
    throw new Error('히스토리 조회 실패');
  }

  return res.json();
}

/**
 * 추천 상세 조회
 */
export async function getRecommendationDetail(id: string, token?: string) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/recommendation/${id}`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    throw new Error('추천 상세 조회 실패');
  }

  return res.json();
}
