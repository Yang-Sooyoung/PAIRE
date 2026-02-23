// 크레딧 패키지 정의
export const CREDIT_PACKAGES = {
  CREDIT_5: {
    id: 'CREDIT_5',
    credits: 5,
    price: 5000,
    nameKo: '크레딧 5회',
    nameEn: '5 Credits',
    descKo: '추천 5회 이용권',
    descEn: '5 Recommendations',
    badge: '🌟',
  },
  CREDIT_10: {
    id: 'CREDIT_10',
    credits: 10,
    price: 9000,
    nameKo: '크레딧 10회',
    nameEn: '10 Credits',
    descKo: '추천 10회 이용권 (10% 할인)',
    descEn: '10 Recommendations (10% off)',
    badge: '⭐',
    discount: 10,
  },
  CREDIT_30: {
    id: 'CREDIT_30',
    credits: 30,
    price: 24000,
    nameKo: '크레딧 30회',
    nameEn: '30 Credits',
    descKo: '추천 30회 이용권 (20% 할인)',
    descEn: '30 Recommendations (20% off)',
    badge: '✨',
    discount: 20,
    popular: true,
  },
} as const;

export type CreditPackageType = keyof typeof CREDIT_PACKAGES;
