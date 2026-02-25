// app/api/auth.ts
// 클라이언트 사이드 API 호출 함수들
import apiClient from './client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://paire-back.up.railway.app/api';

export interface SignupPayload {
  email: string;
  password: string;
  username: string;
  nickname: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    nickname?: string;
    roles: string[];
    membership: 'FREE' | 'PREMIUM';
    credits?: number;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * 회원가입
 */
export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const response = await apiClient.post('/auth/signup', payload);
  return response.data;
}

/**
 * 로그인
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiClient.post('/auth/login', payload);
  return response.data;
}

/**
 * 토큰 갱신
 */
export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  const response = await apiClient.post('/auth/refresh', { refreshToken });
  return response.data;
}

/**
 * 현재 사용자 정보 조회
 */
export async function getCurrentUser(accessToken?: string) {
  const response = await apiClient.get('/auth/me', {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
  return response.data;
}
