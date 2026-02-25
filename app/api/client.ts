import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '@/app/store/userStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://paire-back.up.railway.app/api';

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 자동 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useUserStore.getState().token || localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 API Request with token:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ API Request without token');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 시 토큰 갱신
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // originalRequest가 없으면 에러 반환
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // refresh 엔드포인트는 재시도하지 않음
    if (originalRequest.url?.includes('/auth/refresh')) {
      console.log('Refresh token failed, clearing auth state');
      // refresh 실패 시 로그아웃
      useUserStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // 401 에러이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('401 error detected, attempting token refresh');

      if (isRefreshing) {
        console.log('Token refresh already in progress, queuing request');
        // 이미 갱신 중이면 큐에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('Attempting to refresh token...');
        const newToken = await useUserStore.getState().refreshTokenIfNeeded();

        if (newToken) {
          console.log('Token refreshed successfully');
          // localStorage 업데이트
          localStorage.setItem('accessToken', newToken);

          processQueue(null, newToken);

          // 원래 요청에 새 토큰 설정
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          return apiClient(originalRequest);
        } else {
          console.log('Token refresh returned null');
          processQueue(new Error('Token refresh failed'), null);
          // 토큰 갱신 실패해도 바로 로그아웃하지 않음
          return Promise.reject(new Error('Authentication required'));
        }
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        processQueue(refreshError, null);
        // 갱신 실패해도 바로 로그아웃하지 않음
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
