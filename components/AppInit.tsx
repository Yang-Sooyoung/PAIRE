'use client';

import { useEffect } from 'react';
import { isNative, requestCameraPermission } from '@/lib/capacitor';
import { useI18n } from '@/lib/i18n/context';
import { useUserStore } from '@/app/store/userStore';
import { getCurrentUser } from '@/app/api/auth';
import { useRouter } from 'next/navigation';

export default function AppInit() {
  const { setLanguage } = useI18n();
  const { setUser, setToken, setRefreshToken } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!isNative()) return;

    // 카메라 권한 요청
    requestCameraPermission();

    // 딥링크 리스너 - OAuth 콜백 처리
    const setupDeepLink = async () => {
      try {
        const { App } = await import('@capacitor/app');
        const { Browser } = await import('@capacitor/browser');

        App.addListener('appUrlOpen', async (event) => {
          const url = event.url;
          // paire://auth?accessToken=...&refreshToken=... 처리
          if (url.startsWith('paire://auth')) {
            // 인앱 브라우저 먼저 닫기
            await Browser.close();

            const urlObj = new URL(url.replace('paire://auth', 'https://dummy.com/auth'));
            const accessToken = urlObj.searchParams.get('accessToken');
            const refreshToken = urlObj.searchParams.get('refreshToken');

            if (accessToken && refreshToken) {
              try {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                setToken(accessToken);
                setRefreshToken(refreshToken);
                const userData = await getCurrentUser(accessToken);
                setUser(userData);
                router.replace('/');
              } catch (e) {
                console.error('OAuth token error:', e);
                router.replace('/login');
              }
            } else {
              router.replace('/login');
            }
          }
        });
      } catch (e) {
        console.error('DeepLink setup error:', e);
      }
    };

    setupDeepLink();

    // 첫 실행 여부 확인 (이미 언어 설정이 있으면 스킵)
    const savedLanguage = localStorage.getItem('paire-language');
    if (savedLanguage) return;

    // 첫 실행: IP로 지역 감지 후 언어 자동 설정
    const detectAndSetLanguage = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(4000),
        });
        const data = await res.json();
        const country = data.country_code;
        if (country === 'KR') {
          setLanguage('ko');
        } else {
          setLanguage('en');
        }
      } catch {
        const deviceLang = navigator.language || '';
        if (deviceLang.startsWith('ko')) {
          setLanguage('ko');
        } else {
          setLanguage('en');
        }
      }
    };

    detectAndSetLanguage();
  }, []);

  return null;
}
