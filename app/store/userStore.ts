// app/store/userStore.ts
import { create } from 'zustand';
import { getCurrentUser, refreshToken as refreshTokenAPI } from '@/app/api/auth';

export interface User {
  id: string;
  email: string;
  username: string;
  nickname?: string;
  roles: string[];
  membership: 'FREE' | 'PREMIUM';
}

interface UserState {
  user: User | null
  token: string | null
  refreshToken: string | null
  loading: boolean
  initialized: boolean
  refreshing: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setRefreshToken: (refreshToken: string | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  initializeUser: () => Promise<void>
  refreshTokenIfNeeded: () => Promise<string | null>
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  initialized: false,
  refreshing: false,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setRefreshToken: (token) => set({ refreshToken: token }),
  setLoading: (loading) => set({ loading }),

  refreshTokenIfNeeded: async () => {
    const state = get();

    // 이미 갱신 중이면 완료될 때까지 대기
    if (state.refreshing) {
      console.log('Token refresh already in progress, waiting...');
      // 최대 5초 대기
      for (let i = 0; i < 50; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const currentState = get();
        if (!currentState.refreshing) {
          return currentState.token;
        }
      }
      console.log('Token refresh timeout');
      return null;
    }

    const storedRefreshToken = state.refreshToken || localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      console.log('No refresh token available');
      return null;
    }

    try {
      set({ refreshing: true });
      console.log('Refreshing token...');

      const response = await refreshTokenAPI(storedRefreshToken);

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      set({
        user: response.user,
        token: response.accessToken,
        refreshToken: response.refreshToken,
        refreshing: false,
      });

      console.log('Token refreshed successfully');
      return response.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      set({ refreshing: false });

      // 갱신 실패 - 로그아웃하지 않고 null만 반환
      return null;
    }
  },

  initializeUser: async () => {
    try {
      set({ loading: true });

      // 로컬스토리지에서 토큰 복구
      const storedToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (!storedToken) {
        set({ initialized: true, loading: false });
        return;
      }

      // 토큰 설정
      set({
        token: storedToken,
        refreshToken: storedRefreshToken,
      });
      
      console.log('🔑 Token loaded from localStorage:', storedToken ? storedToken.substring(0, 20) + '...' : 'NONE');

      // 토큰으로 사용자 정보 조회
      try {
        const userData = await getCurrentUser();
        set({
          user: userData,
          initialized: true,
          loading: false,
        });
      } catch (error: any) {
        console.error('Failed to get user data, attempting token refresh...', error);

        // 401이면 refresh token으로 갱신 시도
        if (error?.response?.status === 401 || error?.message?.includes('401')) {
          if (storedRefreshToken) {
            try {
              const response = await refreshTokenAPI(storedRefreshToken);
              localStorage.setItem('accessToken', response.accessToken);
              localStorage.setItem('refreshToken', response.refreshToken);
              set({
                user: response.user,
                token: response.accessToken,
                refreshToken: response.refreshToken,
                initialized: true,
                loading: false,
              });
              console.log('✅ Token refreshed during initialization');
              return;
            } catch (refreshError) {
              console.error('Token refresh failed during initialization:', refreshError);
            }
          }
        }

        // refresh도 실패하면 로그아웃
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ 
          user: null,
          token: null,
          refreshToken: null,
          initialized: true, 
          loading: false 
        });
      }
    } catch (error) {
      console.error('Failed to initialize user:', error);
      set({ initialized: true, loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({
      user: null,
      token: null,
      refreshToken: null,
    });
  },
}));
