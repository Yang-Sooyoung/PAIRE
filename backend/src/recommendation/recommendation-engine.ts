// backend/src/recommendation/recommendation-engine.ts
// 추천 엔진 - 점수 계산 및 필터링

export interface RecommendationScore {
  drinkId: string;
  totalScore: number;
  breakdown: {
    menuMatch: number;
    situationMatch: number;
    tasteMatch: number;
    popularity: number;
  };
  reason: string;
}

export interface ScoringWeights {
  menuMatch: number;      // 0.5 - 음식 매칭이 가장 중요
  situationMatch: number; // 0.2 - 상황 매칭
  tasteMatch: number;     // 0.2 - 취향 매칭
  popularity: number;     // 0.1 - 인기도
}

// 기본 가중치
export const DEFAULT_WEIGHTS: ScoringWeights = {
  menuMatch: 0.5,
  situationMatch: 0.2,
  tasteMatch: 0.2,
  popularity: 0.1,
};

/**
 * 음료 점수 계산
 */
export function calculateDrinkScore(
  drink: any,
  pairingRules: any[],
  occasion: string,
  tastes: string[],
  weights: ScoringWeights = DEFAULT_WEIGHTS
): RecommendationScore {
  let menuMatchScore = 0;
  let situationMatchScore = 0;
  let tasteMatchScore = 0;
  let popularityScore = 0;
  let reason = '';

  // 1. 메뉴 매칭 점수 (페어링 룰 기반)
  if (pairingRules.length > 0) {
    for (const rule of pairingRules) {
      // 음료 타입 매칭
      if (rule.drinkTypes.includes(drink.type)) {
        menuMatchScore += 40;
        reason = rule.reason;
      }
      
      // 음료 맛 매칭
      const drinkTastes = drink.tastes as string[];
      const matchingTastes = drinkTastes.filter(taste => 
        rule.drinkTastes.includes(taste)
      );
      menuMatchScore += matchingTastes.length * 20;
    }
  }

  // 기본 음식 페어링 점수
  const foodPairings = drink.foodPairings as string[];
  if (foodPairings.includes('all')) {
    menuMatchScore += 10;
  }

  // 2. 상황 매칭 점수
  const drinkOccasions = drink.occasions as string[];
  if (occasion !== 'all') {
    if (drinkOccasions.includes(occasion)) {
      situationMatchScore = 100;
    } else if (drinkOccasions.includes('all')) {
      situationMatchScore = 50;
    }
  } else {
    situationMatchScore = 50;
  }

  // 3. 취향 매칭 점수
  if (tastes && tastes.length > 0) {
    const drinkTastes = drink.tastes as string[];
    const matchingTastes = drinkTastes.filter(taste => tastes.includes(taste));
    tasteMatchScore = (matchingTastes.length / tastes.length) * 100;
  } else {
    tasteMatchScore = 50; // 취향 선택 안 했으면 중립
  }

  // 4. 인기도 점수 (나중에 실제 데이터로 대체)
  popularityScore = 50; // 기본값

  // 최종 점수 계산 (가중 평균)
  const totalScore = 
    menuMatchScore * weights.menuMatch +
    situationMatchScore * weights.situationMatch +
    tasteMatchScore * weights.tasteMatch +
    popularityScore * weights.popularity;

  return {
    drinkId: drink.id,
    totalScore,
    breakdown: {
      menuMatch: menuMatchScore,
      situationMatch: situationMatchScore,
      tasteMatch: tasteMatchScore,
      popularity: popularityScore,
    },
    reason,
  };
}

/**
 * 추천 이유 생성 (알고리즘과 분리)
 */
export function generateRecommendationReason(
  score: RecommendationScore,
  drinkName: string
): string {
  const { breakdown } = score;
  
  const reasons: string[] = [];
  
  if (breakdown.menuMatch > 50) {
    reasons.push('음식과의 완벽한 조화');
  }
  
  if (breakdown.situationMatch > 80) {
    reasons.push('상황에 딱 맞는 선택');
  }
  
  if (breakdown.tasteMatch > 70) {
    reasons.push('취향 저격');
  }
  
  if (reasons.length === 0) {
    return `${drinkName}을(를) 추천합니다.`;
  }
  
  return reasons.join(', ') + '입니다.';
}

/**
 * 상위 N개 음료 선택
 */
export function selectTopDrinks(
  scores: RecommendationScore[],
  limit: number = 3
): RecommendationScore[] {
  return scores
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit);
}
