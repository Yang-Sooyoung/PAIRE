'use client';

import { useEffect } from 'react';
import { isNative, requestCameraPermission } from '@/lib/capacitor';

export default function AppInit() {
  useEffect(() => {
    if (!isNative()) return;

    // 앱 시작 시 카메라 권한 요청
    requestCameraPermission();
  }, []);

  return null;
}
