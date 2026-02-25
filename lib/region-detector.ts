// 국가 및 지역 감지 유틸리티 (Capacitor 지원)
export type CountryCode = 'KR' | 'US' | 'OTHER';
export type PaymentProvider = 'toss' | 'stripe';
export type ShoppingPlatform = 'coupang' | 'vivino' | 'amazon';

interface RegionConfig {
  country: CountryCode;
  paymentProvider: PaymentProvider;
  shoppingPlatform: ShoppingPlatform;
  currency: string;
  currencySymbol: string;
}

/**
 * Capacitor 앱 여부 감지
 */
export function isCapacitorApp(): boolean {
  if (typeof window === 'undefined') return false;
  // @ts-ignore
  return !!(window.Capacitor);
}

/**
 * 사용자의 국가 코드 감지 (동기)
 */
export function detectCountry(): CountryCode {
  if (typeof window === 'undefined') return 'OTHER';

  // localStorage에 저장된 국가
  const savedCountry = localStorage.getItem('paire-country');
  if (savedCountry === 'KR' || savedCountry === 'US' || savedCountry === 'OTHER') {
    return savedCountry as CountryCode;
  }

  // 브라우저 언어 설정으로 추정
  const language = navigator.language || navigator.languages?.[0] || '';
  if (language.startsWith('ko')) return 'KR';
  if (language.startsWith('en-US')) return 'US';

  // Intl API로 타임존 기반 추정
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone.includes('Seoul') || timeZone.includes('Asia/Seoul')) return 'KR';
    if (timeZone.includes('America/New_York') || timeZone.includes('America/Los_Angeles')) return 'US';
  } catch (e) {
    console.error('Failed to detect timezone:', e);
  }

  // 기본값: 언어 설정 기반
  const currentLanguage = localStorage.getItem('paire-language') || 'en';
  return currentLanguage === 'ko' ? 'KR' : 'OTHER';
}

/**
 * Capacitor Device 정보로 국가 감지 (비동기)
 */
export async function detectCountryWithDevice(): Promise<CountryCode> {
  if (typeof window === 'undefined') return 'OTHER';

  // localStorage 우선
  const savedCountry = localStorage.getItem('paire-country');
  if (savedCountry === 'KR' || savedCountry === 'US' || savedCountry === 'OTHER') {
    return savedCountry as CountryCode;
  }

  // Capacitor 앱인 경우 Device 정보 사용
  if (isCapacitorApp()) {
    try {
      // @ts-ignore
      const { Device } = window.Capacitor.Plugins;
      const languageCode = await Device.getLanguageCode();
      
      console.log('Capacitor Language:', languageCode);
      
      if (languageCode.value?.startsWith('ko')) return 'KR';
      if (languageCode.value?.startsWith('en-US')) return 'US';
    } catch (e) {
      console.error('Failed to get Capacitor device info:', e);
    }
  }

  // 동기 방식으로 폴백
  return detectCountry();
}

/**
 * 국가 코드 저장
 */
export function saveCountry(country: CountryCode) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('paire-country', country);
  }
}

/**
 * 국가별 설정 가져오기
 */
export function getRegionConfig(country?: CountryCode): RegionConfig {
  const detectedCountry = country || detectCountry();

  switch (detectedCountry) {
    case 'KR':
      return {
        country: 'KR',
        paymentProvider: 'toss',
        shoppingPlatform: 'coupang',
        currency: 'KRW',
        currencySymbol: '₩',
      };
    case 'US':
      return {
        country: 'US',
        paymentProvider: 'stripe',
        shoppingPlatform: 'amazon',
        currency: 'USD',
        currencySymbol: '$',
      };
    default:
      return {
        country: 'OTHER',
        paymentProvider: 'stripe',
        shoppingPlatform: 'vivino',
        currency: 'USD',
        currencySymbol: '$',
      };
  }
}

/**
 * 결제 제공자 가져오기
 */
export function getPaymentProvider(country?: CountryCode): PaymentProvider {
  return getRegionConfig(country).paymentProvider;
}

/**
 * 쇼핑 플랫폼 가져오기
 */
export function getShoppingPlatform(country?: CountryCode): ShoppingPlatform {
  return getRegionConfig(country).shoppingPlatform;
}

/**
 * 통화 정보 가져오기
 */
export function getCurrencyInfo(country?: CountryCode) {
  const config = getRegionConfig(country);
  return {
    currency: config.currency,
    symbol: config.currencySymbol,
  };
}

/**
 * 가격 포맷팅
 */
export function formatPrice(price: number, country?: CountryCode): string {
  const config = getRegionConfig(country);
  
  if (config.country === 'KR') {
    return `${config.currencySymbol}${price.toLocaleString('ko-KR')}`;
  }
  
  return `${config.currencySymbol}${price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * 쇼핑 링크 생성
 */
export function generateShoppingLink(
  drinkName: string,
  drinkType: string,
  country?: CountryCode
): string {
  const platform = getShoppingPlatform(country);
  const searchQuery = encodeURIComponent(`${drinkName} ${drinkType}`);

  switch (platform) {
    case 'coupang':
      return `https://www.coupang.com/np/search?q=${searchQuery}`;
    case 'amazon':
      return `https://www.amazon.com/s?k=${searchQuery}`;
    case 'vivino':
      return `https://www.vivino.com/search/wines?q=${searchQuery}`;
    default:
      return `https://www.vivino.com/search/wines?q=${searchQuery}`;
  }
}

/**
 * 모바일 앱 여부 감지 (Capacitor 또는 React Native)
 */
export function isMobileApp(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Capacitor 감지
  // @ts-ignore
  if (window.Capacitor) return true;
  
  // React Native WebView 감지 (폴백)
  // @ts-ignore
  return !!(window.ReactNativeWebView || window.isReactNativeWebView);
}

/**
 * Capacitor Browser로 외부 링크 열기
 */
export async function openExternalLink(url: string) {
  if (typeof window === 'undefined') return;
  
  // Capacitor 앱인 경우
  if (isCapacitorApp()) {
    try {
      // @ts-ignore
      const { Browser } = window.Capacitor.Plugins;
      await Browser.open({ url });
      return;
    } catch (e) {
      console.error('Failed to open with Capacitor Browser:', e);
    }
  }
  
  // 일반 브라우저
  window.open(url, '_blank');
}

/**
 * 모바일 앱에 메시지 전송 (결제 완료 등)
 */
export function postMessageToApp(message: any) {
  if (typeof window === 'undefined') return;
  
  // Capacitor는 직접 플러그인 호출하므로 불필요
  // React Native WebView 폴백
  // @ts-ignore
  if (window.ReactNativeWebView?.postMessage) {
    // @ts-ignore
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }
}
