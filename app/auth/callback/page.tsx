'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { getCurrentUser } from '@/app/api/auth';
import { closeOAuthBrowser } from '@/lib/capacitor';

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
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        setToken(accessToken);
        setRefreshToken(refreshToken);

        const userData = await getCurrentUser(accessToken);
        setUser(userData);

        // 인앱 브라우저 닫기 (네이티브 앱인 경우)
        await closeOAuthBrowser();

        router.push('/');
      } catch (error) {
        console.error('OAuth callback error:', error);
        await closeOAuthBrowser();
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
