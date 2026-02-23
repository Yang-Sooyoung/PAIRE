// app/api/auth.ts
// 클라이언트 사이드 API 호출 함수들

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * 회원가입
 */
export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || '회원가입 실패');
  }

  return res.json();
}

/**
 * 로그인
 */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || '로그인 실패');
  }

  return res.json();
}

/**
 * 토큰 갱신
 */
export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || '토큰 갱신 실패');
  }

  return res.json();
}

/**
 * 현재 사용자 정보 조회
 */
export async function getCurrentUser(accessToken: string) {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error('사용자 정보 조회 실패');
  }

  return res.json();
}
