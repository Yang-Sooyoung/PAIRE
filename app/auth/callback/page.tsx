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
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setToken(accessToken);
        setRefreshToken(refreshToken);

        const userData = await getCurrentUser(accessToken);
        setUser(userData);
      } catch (error) {
        console.error('OAuth callback error:', error);
      }

      // 네이티브 앱이면 인앱 브라우저 닫기
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          const { Browser } = await import('@capacitor/browser');
          await Browser.close();
        }
      } catch (e) {
        // 웹 환경에서는 무시
      }

      router.push('/');
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="text-foreground text-2xl font-light mb-4">PAIRÉ</div>
        <div className="text-muted-foreground">Signing in...</div>
      </div>
    </div>
  );
}
