'use client';

import { useEffect } from 'react';
import { isNative, requestCameraPermission } from '@/lib/capacitor';
import { useI18n } from '@/lib/i18n/context';

export default function AppInit() {
  const { setLanguage } = useI18n();

  useEffect(() => {
    if (!isNative()) return;

    // 카메라 권한 요청
    requestCameraPermission();

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
        // 실패 시 기기 언어로 폴백
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
