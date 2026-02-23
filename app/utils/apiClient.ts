// app/utils/apiClient.ts
// API 호출 시 에러 처리 및 토큰 갱신을 담당하는 클라이언트

import { useUserStore } from '@/app/store/userStore';
import { refreshToken as refreshTokenAPI } from '@/app/api/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * API 호출 함수 (토큰 자동 갱신 포함)
 */
export async function apiCall<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  try {
    // 토큰 추가
    if (!skipAuth) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        fetchOptions.headers = {
          ...fetchOptions.headers,
          'Authorization': `Bearer ${token}`,
        };
      }
    }

    // 기본 헤더 설정
    fetchOptions.headers = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

    // 401 Unauthorized - 토큰 갱신 시도
    if (response.status === 401 && !skipAuth) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const newTokens = await refreshTokenAPI(refreshToken);
          localStorage.setItem('accessToken', newTokens.accessToken);
          localStorage.setItem('refreshToken', newTokens.refreshToken);

          // 스토어 업데이트
          const store = useUserStore.getState();
          store.setToken(newTokens.accessToken);
          store.setRefreshToken(newTokens.refreshToken);

          // 재시도
          return apiCall<T>(endpoint, { ...options, skipAuth: false });
        } catch (error) {
          // 토큰 갱신 실패 - 로그아웃
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          const store = useUserStore.getState();
          store.logout();
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        }
      }
    }

    // 에러 응답 처리
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `API 오류: ${response.status}`;
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // 네트워크 에러
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('네트워크 연결을 확인해주세요.');
    }

    throw error;
  }
}

/**
 * GET 요청
 */
export function apiGet<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'GET',
  });
}

/**
 * POST 요청
 */
export function apiPost<T>(
  endpoint: string,
  body?: any,
  options?: FetchOptions
): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT 요청
 */
export function apiPut<T>(
  endpoint: string,
  body?: any,
  options?: FetchOptions
): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE 요청
 */
export function apiDelete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  return apiCall<T>(endpoint, {
    ...options,
    method: 'DELETE',
  });
}
