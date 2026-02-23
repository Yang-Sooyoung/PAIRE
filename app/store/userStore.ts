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

interface UserStore {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  initializeUser: () => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  initialized: false,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setRefreshToken: (token) => set({ refreshToken: token }),
  setLoading: (loading) => set({ loading }),

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

      // 토큰으로 사용자 정보 조회
      try {
        const userData = await getCurrentUser(storedToken);
        set({
          user: userData,
          token: storedToken,
          refreshToken: storedRefreshToken,
          initialized: true,
          loading: false,
        });
      } catch (error) {
        // 토큰 만료 시 갱신 시도
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
          } catch (refreshError) {
            // 갱신 실패 시 로그아웃
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            set({ initialized: true, loading: false });
          }
        } else {
          set({ initialized: true, loading: false });
        }
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
