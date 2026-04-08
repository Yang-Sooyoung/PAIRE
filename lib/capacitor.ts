import { Capacitor } from '@capacitor/core';

export const isNative = () => Capacitor.isNativePlatform();

// 카메라 권한 요청
export async function requestCameraPermission(): Promise<boolean> {
  if (!isNative()) return true;
  try {
    const { Camera } = await import('@capacitor/camera');
    const status = await Camera.requestPermissions({ permissions: ['camera'] });
    return status.camera === 'granted';
  } catch {
    return false;
  }
}

// OAuth 인앱 브라우저로 열기
export async function openOAuthBrowser(url: string): Promise<void> {
  if (!isNative()) {
    window.location.href = url;
    return;
  }
  const { Browser } = await import('@capacitor/browser');
  await Browser.open({ 
    url, 
    presentationStyle: 'fullscreen',
    toolbarColor: '#0d0d11',
  });
}

// 인앱 브라우저 닫기
export async function closeOAuthBrowser(): Promise<void> {
  if (!isNative()) return;
  const { Browser } = await import('@capacitor/browser');
  await Browser.close();
}
