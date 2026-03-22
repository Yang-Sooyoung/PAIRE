// app/subscription/constants/subscriptionPlans.ts

export type PlanInterval = 'WEEKLY' | 'MONTHLY' | 'ANNUALLY';
export type MembershipType = 'FREE' | 'PREMIUM';

export interface Plan {
  id: string;
  titleKo: string;
  titleEn: string;
  descriptionKo: string;
  descriptionEn: string;
  priceWeekly?: number;
  priceMonthly: number;
  priceYearly: number;
  priceMonthlyUSD: number;
  membership: MembershipType;
  interval: 'WEEKLY' | 'MONTHLY' | 'ANNUALLY';
  featuresKo: string[];
  featuresEn: string[];
  badge?: string;
  popular?: boolean;
  // 하위 호환
  title?: string;
  description?: string;
  features?: string[];
}

export const PLANS: Plan[] = [
  {
    id: 'premium-weekly',
    titleKo: 'PREMIUM 주간',
    titleEn: 'PREMIUM Weekly',
    descriptionKo: '1주일 무제한',
    descriptionEn: '7 days unlimited',
    priceWeekly: 4900,
    priceMonthly: 4900,
    priceYearly: 4900,
    priceMonthlyUSD: 3.99,
    membership: 'PREMIUM',
    interval: 'WEEKLY',
    badge: '🌟',
    featuresKo: [
      '7일간 무제한 추천',
      '상황별 맞춤 추천',
      '추천 히스토리 저장',
      '즐겨찾기 기능',
      '공유 기능',
    ],
    featuresEn: [
      'Unlimited recommendations for 7 days',
      'Personalized pairing suggestions',
      'Recommendation history',
      'Favorites',
      'Share feature',
    ],
  },
  {
    id: 'premium-monthly',
    titleKo: 'PREMIUM 월간',
    titleEn: 'PREMIUM Monthly',
    descriptionKo: '1개월 무제한',
    descriptionEn: '30 days unlimited',
    priceWeekly: 14900,
    priceMonthly: 14900,
    priceYearly: 14900,
    priceMonthlyUSD: 10.99,
    membership: 'PREMIUM',
    interval: 'MONTHLY',
    badge: '⭐',
    popular: true,
    featuresKo: [
      '30일간 무제한 추천',
      '상황별 맞춤 추천',
      '추천 히스토리 저장',
      '즐겨찾기 기능',
      '공유 기능',
      '스티커 수집',
    ],
    featuresEn: [
      'Unlimited recommendations for 30 days',
      'Personalized pairing suggestions',
      'Recommendation history',
      'Favorites',
      'Share feature',
      'Sticker collection',
    ],
  },
  {
    id: 'premium-yearly',
    titleKo: 'PREMIUM 연간',
    titleEn: 'PREMIUM Yearly',
    descriptionKo: '1년 무제한 (33% 할인)',
    descriptionEn: '365 days unlimited (33% OFF)',
    priceWeekly: 119000,
    priceMonthly: 119000,
    priceYearly: 119000,
    priceMonthlyUSD: 89.99,
    membership: 'PREMIUM',
    interval: 'ANNUALLY',
    badge: '✨',
    featuresKo: [
      '365일간 무제한 추천',
      '상황별 맞춤 추천',
      '추천 히스토리 저장',
      '즐겨찾기 기능',
      '공유 기능',
      '스티커 수집',
      '연간 33% 할인',
    ],
    featuresEn: [
      'Unlimited recommendations for 365 days',
      'Personalized pairing suggestions',
      'Recommendation history',
      'Favorites',
      'Share feature',
      'Sticker collection',
      '33% annual discount',
    ],
  },
];

export const PLAN_MAP = Object.fromEntries(
  PLANS.map((plan) => [plan.id, plan])
);
