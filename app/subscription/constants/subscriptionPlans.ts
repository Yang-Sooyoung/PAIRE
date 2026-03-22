// app/subscription/constants/subscriptionPlans.ts

export type PlanInterval = 'WEEKLY' | 'MONTHLY' | 'ANNUALLY';
export type MembershipType = 'FREE' | 'PREMIUM';

export interface Plan {
  id: string;
  title: string;
  description: string;
  priceWeekly?: number;
  priceMonthly: number;
  priceYearly: number;
  priceMonthlyUSD: number;  // USD 가격
  membership: MembershipType;
  interval: 'WEEKLY' | 'MONTHLY' | 'ANNUALLY';
  features: string[];
  badge?: string;
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'premium-weekly',
    title: 'PREMIUM 주간',
    description: '1주일 무제한',
    priceWeekly: 4900,
    priceMonthly: 4900,
    priceYearly: 4900,
    priceMonthlyUSD: 3.99,
    membership: 'PREMIUM',
    interval: 'WEEKLY',
    badge: '🌟',
    features: [
      '7일간 무제한 추천',
      '상황별 맞춤 추천',
      '추천 히스토리 저장',
      '즐겨찾기 기능',
      '공유 기능',
    ],
  },
  {
    id: 'premium-monthly',
    title: 'PREMIUM 월간',
    description: '1개월 무제한',
    priceWeekly: 14900,
    priceMonthly: 14900,
    priceYearly: 14900,
    priceMonthlyUSD: 10.99,
    membership: 'PREMIUM',
    interval: 'MONTHLY',
    badge: '⭐',
    popular: true,
    features: [
      '30일간 무제한 추천',
      '상황별 맞춤 추천',
      '추천 히스토리 저장',
      '즐겨찾기 기능',
      '공유 기능',
      '스티커 수집',
    ],
  },
  {
    id: 'premium-yearly',
    title: 'PREMIUM 연간',
    description: '1년 무제한 (33% 할인)',
    priceWeekly: 119000,
    priceMonthly: 119000,
    priceYearly: 119000,
    priceMonthlyUSD: 89.99,
    membership: 'PREMIUM',
    interval: 'ANNUALLY',
    badge: '✨',
    features: [
      '365일간 무제한 추천',
      '상황별 맞춤 추천',
      '추천 히스토리 저장',
      '즐겨찾기 기능',
      '공유 기능',
      '스티커 수집',
      '연간 33% 할인',
    ],
  },
];

// ✅ ID로 빠르게 찾을 수 있게 변환
export const PLAN_MAP = Object.fromEntries(
    PLANS.map((plan) => [plan.id, plan])
);
