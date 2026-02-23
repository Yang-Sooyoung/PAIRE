// app/subscription/constants/subscriptionPlans.ts

export type PlanInterval = 'MONTHLY' | 'ANNUALLY';
export type MembershipType = 'FREE' | 'PREMIUM';

export interface Plan {
  id: string;
  title: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  membership: MembershipType;
  interval: 'MONTHLY' | 'ANNUALLY';
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: 'premium-monthly',
    title: 'PREMIUM',
    description: '무제한 추천 + 전체 기능',
    priceMonthly: 9900,
    priceYearly: 99000,
    membership: 'PREMIUM',
    interval: 'MONTHLY',
    features: [
      '무제한 음료 추천',
      '상황별 맞춤 추천',
      '추천 히스토리 저장',
      '즐겨찾기 기능',
      '공유 기능',
    ],
  },
];

// ✅ ID로 빠르게 찾을 수 있게 변환
export const PLAN_MAP = Object.fromEntries(
    PLANS.map((plan) => [plan.id, plan])
);
