// app/utils/membershipUtils.ts
// 멤버십 권한 관련 유틸리티

export type MembershipType = 'FREE' | 'PREMIUM';

/**
 * 사용자가 추천을 사용할 수 있는지 확인
 * 프론트엔드에서는 UI 제어만 하고, 실제 권한 체크는 백엔드에서 수행
 */
export function canUseRecommendation(
  membership: MembershipType | null,
  isLoggedIn: boolean
): boolean {
  // 비로그인: 일일 한도 체크 (로컬스토리지)
  if (!isLoggedIn) {
    return canUseNonLoginRecommendation();
  }

  // FREE: 일일 한도 체크
  if (membership === 'FREE') {
    return canUseFreeRecommendation();
  }

  // PREMIUM: 무제한
  return true;
}

/**
 * 비로그인 사용자의 일일 한도 확인
 */
export function canUseNonLoginRecommendation(): boolean {
  const today = new Date().toDateString();
  const lastUsed = localStorage.getItem('lastNonLoginRecommendation');
  const lastUsedDate = localStorage.getItem('lastNonLoginRecommendationDate');

  // 다른 날짜면 사용 가능
  if (lastUsedDate !== today) {
    return true;
  }

  // 같은 날짜면 이미 사용함
  return false;
}

/**
 * FREE 사용자의 일일 한도 확인
 */
export function canUseFreeRecommendation(): boolean {
  const today = new Date().toDateString();
  const lastUsedDate = localStorage.getItem('lastFreeRecommendationDate');

  // 다른 날짜면 사용 가능
  if (lastUsedDate !== today) {
    return true;
  }

  // 같은 날짜면 이미 사용함
  return false;
}

/**
 * 비로그인 추천 사용 기록
 */
export function recordNonLoginRecommendation(): void {
  const today = new Date().toDateString();
  localStorage.setItem('lastNonLoginRecommendation', today);
  localStorage.setItem('lastNonLoginRecommendationDate', today);
}

/**
 * FREE 추천 사용 기록
 */
export function recordFreeRecommendation(): void {
  const today = new Date().toDateString();
  localStorage.setItem('lastFreeRecommendationDate', today);
}

/**
 * 사용자 상태에 따른 메시지 반환
 */
export function getRecommendationMessage(
  membership: MembershipType | null,
  isLoggedIn: boolean
): string {
  if (!isLoggedIn) {
    if (!canUseNonLoginRecommendation()) {
      return '비로그인 사용자는 하루 1회만 추천을 받을 수 있습니다. 로그인하세요.';
    }
    return '';
  }

  if (membership === 'FREE') {
    if (!canUseFreeRecommendation()) {
      return 'FREE 사용자는 하루 1회만 추천을 받을 수 있습니다. PREMIUM으로 업그레이드하세요.';
    }
    return '';
  }

  return '';
}
