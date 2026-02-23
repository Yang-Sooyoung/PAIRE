'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { getCurrentUser } from '@/app/api/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken, setRefreshToken } = useUserStore();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');

      if (!accessToken || !refreshToken) {
        router.push('/login');
        return;
      }

      try {
        // 토큰 저장
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        setToken(accessToken);
        setRefreshToken(refreshToken);

        // 사용자 정보 가져오기
        const userData = await getCurrentUser(accessToken);
        setUser(userData);

        // 메인 페이지로 이동
        router.push('/');
      } catch (error) {
        console.error('OAuth callback error:', error);
        router.push('/login');
      }
    };

    handleCallback();
  }, [searchParams, router, setUser, setToken, setRefreshToken]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-foreground text-2xl font-light mb-4">PAIRÉ</div>
        <div className="text-muted-foreground">로그인 중...</div>
      </div>
    </div>
  );
}
