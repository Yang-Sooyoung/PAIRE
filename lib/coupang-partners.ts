/**
 * 쿠팡 파트너스 연동
 * API 없이 제휴 링크로 작동
 */

// 쿠팡 파트너스 설정
const COUPANG_PARTNERS_CONFIG = {
  // 쿠팡 파트너스 가입 후 받는 ID
  partnerId: process.env.NEXT_PUBLIC_COUPANG_PARTNER_ID || 'YOUR_PARTNER_ID',
  
  // 서브 ID (추적용, 선택사항)
  subId: 'paire-app',
};

/**
 * 쿠팡 제휴 링크 생성
 * @param productName 상품명 (검색 키워드)
 * @param category 카테고리 (선택사항)
 */
export function generateCoupangLink(
  productName: string,
  category?: 'wine' | 'whiskey' | 'beer' | 'cocktail' | 'tea' | 'coffee'
): string {
  const { partnerId, subId } = COUPANG_PARTNERS_CONFIG;
  
  // 상품명 인코딩
  const encodedName = encodeURIComponent(productName);
  
  // 쿠팡 검색 URL + 제휴 파라미터
  const baseUrl = 'https://www.coupang.com/np/search';
  const params = new URLSearchParams({
    q: productName,
    channel: 'user',
    component: '',
    eventCategory: 'SRP',
    trcid: partnerId,
    traid: subId,
  });
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * 특정 상품 직접 링크 (상품 ID가 있는 경우)
 * @param productId 쿠팡 상품 ID
 */
export function generateCoupangProductLink(productId: string): string {
  const { partnerId, subId } = COUPANG_PARTNERS_CONFIG;
  
  return `https://www.coupang.com/vp/products/${productId}?itemId=${productId}&vendorItemId=${productId}&src=1042013&spec=10304982&addtag=400&ctag=AF${partnerId}&lptag=${subId}&itime=20240101000000`;
}

/**
 * 음료 타입별 추천 검색어
 */
export const DRINK_SEARCH_KEYWORDS: Record<string, string[]> = {
  'wine-red': ['레드와인', '까베르네 소비뇽', '메를로', '피노누아'],
  'wine-white': ['화이트와인', '샤르도네', '소비뇽 블랑', '리슬링'],
  'wine-sparkling': ['스파클링 와인', '샴페인', '프로세코', '카바'],
  'wine-rose': ['로제 와인', '핑크 와인'],
  'whiskey': ['위스키', '싱글몰트', '버번', '스카치'],
  'beer': ['맥주', '크래프트 비어', 'IPA', '라거'],
  'cocktail': ['칵테일', '진', '럼', '보드카', '데킬라'],
  'sake': ['사케', '정종', '일본주'],
  'soju': ['소주', '증류주'],
  'makgeolli': ['막걸리', '탁주'],
  'tea': ['차', '홍차', '녹차', '허브티'],
  'coffee': ['커피', '원두', '에스프레소', '드립커피'],
  'non-alcoholic': ['논알콜', '무알콜 와인', '제로 맥주'],
};

/**
 * 음료 정보에서 쿠팡 링크 생성
 */
export function addCoupangLinkToDrink(drink: {
  name: string;
  type: string;
  price?: string;
}) {
  // 음료 타입에서 검색 키워드 가져오기
  const keywords = DRINK_SEARCH_KEYWORDS[drink.type] || [drink.name];
  
  // 첫 번째 키워드 사용 (또는 음료 이름)
  const searchKeyword = keywords[0] || drink.name;
  
  return {
    ...drink,
    purchaseUrl: generateCoupangLink(searchKeyword),
    purchaseSource: 'coupang',
  };
}

/**
 * 추천 음료 목록에 쿠팡 링크 일괄 추가
 */
export function addCoupangLinksToRecommendations(drinks: any[]) {
  return drinks.map(drink => addCoupangLinkToDrink(drink));
}

/**
 * 쿠팡 파트너스 설정 가이드
 */
export const COUPANG_SETUP_GUIDE = {
  step1: {
    title: '쿠팡 파트너스 가입',
    url: 'https://partners.coupang.com',
    description: '쿠팡 파트너스 사이트에서 가입 신청',
  },
  step2: {
    title: '파트너 ID 발급',
    description: '승인 후 대시보드에서 파트너 ID 확인',
  },
  step3: {
    title: '환경 변수 설정',
    env: 'NEXT_PUBLIC_COUPANG_PARTNER_ID=your_partner_id',
    file: '.env.local',
  },
  step4: {
    title: '링크 생성 테스트',
    description: '추천 결과에 구매 링크가 표시되는지 확인',
  },
  commission: {
    rate: '3-5%',
    payment: '월 1회 정산',
    minimum: '10,000원 이상',
  },
};

/**
 * 쿠팡 파트너스 면책 조항 (필수)
 */
export const COUPANG_DISCLAIMER = {
  ko: '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.',
  en: 'This post is part of Coupang Partners activities, and we receive a certain amount of commission accordingly.',
};

/**
 * 추적 가능한 링크 생성 (분석용)
 */
export function generateTrackableCoupangLink(
  productName: string,
  userId?: string,
  recommendationId?: string
): string {
  const baseLink = generateCoupangLink(productName);
  
  // 서브 ID에 추적 정보 추가
  const trackingId = [
    'paire',
    userId ? `u${userId.slice(0, 8)}` : 'guest',
    recommendationId ? `r${recommendationId.slice(0, 8)}` : '',
  ].filter(Boolean).join('-');
  
  return baseLink.replace(/traid=[^&]*/, `traid=${trackingId}`);
}

/**
 * 음료 카테고리별 쿠팡 카테고리 매핑
 */
export const COUPANG_CATEGORY_MAP: Record<string, string> = {
  wine: '194276', // 와인 카테고리 ID
  whiskey: '194277', // 위스키 카테고리 ID
  beer: '194278', // 맥주 카테고리 ID
  sake: '194279', // 사케 카테고리 ID
  coffee: '194280', // 커피 카테고리 ID
  tea: '194281', // 차 카테고리 ID
};

/**
 * 가격대별 필터 추가
 */
export function generateCoupangLinkWithPriceFilter(
  productName: string,
  minPrice?: number,
  maxPrice?: number
): string {
  const baseLink = generateCoupangLink(productName);
  
  if (minPrice || maxPrice) {
    const url = new URL(baseLink);
    if (minPrice) url.searchParams.set('minPrice', minPrice.toString());
    if (maxPrice) url.searchParams.set('maxPrice', maxPrice.toString());
    return url.toString();
  }
  
  return baseLink;
}
