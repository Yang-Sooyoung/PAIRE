// backend/src/recommendation/menu-normalizer.ts
// 메뉴 정규화 및 매핑 로직

export interface MenuCategory {
  category: string;
  subcategory?: string;
  keywords: string[];
}

// 메뉴 카테고리 매핑 테이블
export const MENU_CATEGORIES: MenuCategory[] = [
  // 육류
  { category: 'meat', subcategory: 'beef', keywords: ['소고기', '스테이크', 'beef', 'steak', '등심', '안심', '갈비', 'rib'] },
  { category: 'meat', subcategory: 'pork', keywords: ['돼지고기', '삼겹살', 'pork', '목살', '항정살'] },
  { category: 'meat', subcategory: 'chicken', keywords: ['닭', '치킨', 'chicken', '닭고기'] },
  { category: 'meat', subcategory: 'lamb', keywords: ['양고기', 'lamb', '양갈비'] },
  
  // 해산물
  { category: 'seafood', subcategory: 'fish', keywords: ['생선', 'fish', '연어', 'salmon', '참치', 'tuna', '광어', '우럭'] },
  { category: 'seafood', subcategory: 'shellfish', keywords: ['조개', 'shellfish', '굴', 'oyster', '홍합', 'mussel', '새우', 'shrimp', '랍스터', 'lobster'] },
  { category: 'seafood', subcategory: 'sushi', keywords: ['초밥', 'sushi', '회', 'sashimi'] },
  
  // 파스타
  { category: 'pasta', subcategory: 'cream', keywords: ['크림파스타', 'cream pasta', '까르보나라', 'carbonara', '알프레도', 'alfredo'] },
  { category: 'pasta', subcategory: 'tomato', keywords: ['토마토파스타', 'tomato pasta', '아라비아타', 'arrabbiata', '마리나라', 'marinara'] },
  { category: 'pasta', subcategory: 'oil', keywords: ['오일파스타', 'oil pasta', '알리오올리오', 'aglio olio', '페페론치노', 'peperoncino'] },
  
  // 피자
  { category: 'pizza', keywords: ['피자', 'pizza', '마르게리타', 'margherita', '페퍼로니', 'pepperoni'] },
  
  // 아시안
  { category: 'asian', subcategory: 'chinese', keywords: ['중식', 'chinese', '짜장면', '짬뽕', '탕수육', '마라탕'] },
  { category: 'asian', subcategory: 'japanese', keywords: ['일식', 'japanese', '라멘', 'ramen', '우동', 'udon', '돈까스', 'tonkatsu'] },
  { category: 'asian', subcategory: 'thai', keywords: ['태국', 'thai', '팟타이', 'pad thai', '똠얌꿍', 'tom yum'] },
  { category: 'asian', subcategory: 'vietnamese', keywords: ['베트남', 'vietnamese', '쌀국수', 'pho'] },
  
  // 한식
  { category: 'korean', subcategory: 'bbq', keywords: ['한식', 'korean', '불고기', 'bulgogi', '갈비', 'kalbi', '삼겹살'] },
  { category: 'korean', subcategory: 'stew', keywords: ['찌개', 'stew', '김치찌개', '된장찌개', '순두부'] },
  { category: 'korean', subcategory: 'soup', keywords: ['국', 'soup', '설렁탕', '갈비탕', '삼계탕'] },
  
  // 디저트
  { category: 'dessert', subcategory: 'cake', keywords: ['케이크', 'cake', '티라미수', 'tiramisu', '치즈케이크', 'cheesecake'] },
  { category: 'dessert', subcategory: 'chocolate', keywords: ['초콜릿', 'chocolate', '브라우니', 'brownie'] },
  { category: 'dessert', subcategory: 'fruit', keywords: ['과일', 'fruit', '타르트', 'tart', '파이', 'pie'] },
  { category: 'dessert', subcategory: 'ice-cream', keywords: ['아이스크림', 'ice cream', '젤라또', 'gelato'] },
  
  // 샐러드
  { category: 'salad', keywords: ['샐러드', 'salad', '시저', 'caesar', '그린', 'green'] },
  
  // 치즈
  { category: 'cheese', keywords: ['치즈', 'cheese', '치즈플레이트', 'cheese plate'] },
  
  // 빵
  { category: 'bread', keywords: ['빵', 'bread', '바게트', 'baguette', '크루아상', 'croissant'] },
];

// 음료 추천 룰
export interface PairingRule {
  foodCategory: string;
  foodSubcategory?: string;
  drinkTypes: string[];
  drinkTastes: string[];
  reason: string;
}

export const PAIRING_RULES: PairingRule[] = [
  // 육류 페어링
  {
    foodCategory: 'meat',
    foodSubcategory: 'beef',
    drinkTypes: ['wine-red', 'whiskey', 'beer-dark'],
    drinkTastes: ['bold', 'rich'],
    reason: '소고기의 풍부한 맛과 지방이 레드 와인의 타닌, 위스키의 깊은 맛과 조화를 이룹니다.'
  },
  {
    foodCategory: 'meat',
    foodSubcategory: 'pork',
    drinkTypes: ['wine-white', 'beer', 'soju'],
    drinkTastes: ['crisp', 'light'],
    reason: '돼지고기의 고소한 맛에는 상큼한 화이트 와인이나 시원한 맥주가 잘 어울립니다.'
  },
  {
    foodCategory: 'meat',
    foodSubcategory: 'chicken',
    drinkTypes: ['wine-white', 'beer', 'sparkling'],
    drinkTastes: ['light', 'crisp'],
    reason: '담백한 닭고기에는 가벼운 화이트 와인이나 스파클링이 좋습니다.'
  },
  
  // 해산물 페어링
  {
    foodCategory: 'seafood',
    drinkTypes: ['wine-white', 'sparkling', 'sake'],
    drinkTastes: ['crisp', 'mineral', 'light'],
    reason: '해산물의 신선함과 미네랄 느낌이 화이트 와인, 스파클링과 완벽한 조화를 이룹니다.'
  },
  
  // 파스타 페어링
  {
    foodCategory: 'pasta',
    foodSubcategory: 'cream',
    drinkTypes: ['wine-white', 'sparkling'],
    drinkTastes: ['rich', 'buttery'],
    reason: '크림 소스의 부드러움에는 산미가 있는 화이트 와인이 균형을 맞춰줍니다.'
  },
  {
    foodCategory: 'pasta',
    foodSubcategory: 'tomato',
    drinkTypes: ['wine-red', 'wine-rose'],
    drinkTastes: ['fruity', 'acidic'],
    reason: '토마토의 산미와 레드 와인의 과일 향이 서로를 돋보이게 합니다.'
  },
  {
    foodCategory: 'pasta',
    foodSubcategory: 'oil',
    drinkTypes: ['wine-white', 'beer'],
    drinkTastes: ['light', 'crisp'],
    reason: '오일 베이스의 깔끔한 맛에는 가벼운 화이트 와인이 잘 어울립니다.'
  },
  
  // 피자 페어링
  {
    foodCategory: 'pizza',
    drinkTypes: ['wine-red', 'beer', 'cola'],
    drinkTastes: ['fruity', 'crisp'],
    reason: '피자의 치즈와 토마토 소스에는 과일 향이 풍부한 레드 와인이나 시원한 맥주가 좋습니다.'
  },
  
  // 아시안 페어링
  {
    foodCategory: 'asian',
    foodSubcategory: 'chinese',
    drinkTypes: ['beer', 'soju', 'wine-white'],
    drinkTastes: ['crisp', 'light'],
    reason: '중식의 강한 맛에는 깔끔한 맥주나 소주가 입을 개운하게 해줍니다.'
  },
  {
    foodCategory: 'asian',
    foodSubcategory: 'japanese',
    drinkTypes: ['sake', 'beer', 'wine-white'],
    drinkTastes: ['umami', 'clean'],
    reason: '일식의 섬세한 맛에는 사케나 가벼운 맥주가 조화롭습니다.'
  },
  {
    foodCategory: 'asian',
    foodSubcategory: 'thai',
    drinkTypes: ['beer', 'wine-white', 'cocktail'],
    drinkTastes: ['sweet', 'spicy'],
    reason: '태국 음식의 매콤달콤한 맛에는 시원한 맥주나 과일 향 와인이 좋습니다.'
  },
  
  // 한식 페어링
  {
    foodCategory: 'korean',
    drinkTypes: ['soju', 'beer', 'makgeolli'],
    drinkTastes: ['clean', 'crisp'],
    reason: '한식의 깊은 맛에는 소주나 맥주가 전통적으로 잘 어울립니다.'
  },
  
  // 디저트 페어링
  {
    foodCategory: 'dessert',
    foodSubcategory: 'chocolate',
    drinkTypes: ['wine-dessert', 'coffee', 'whiskey'],
    drinkTastes: ['sweet', 'rich'],
    reason: '초콜릿의 진한 맛에는 디저트 와인이나 위스키가 풍미를 더해줍니다.'
  },
  {
    foodCategory: 'dessert',
    drinkTypes: ['wine-dessert', 'coffee', 'tea', 'non-alcoholic'],
    drinkTastes: ['sweet', 'light'],
    reason: '디저트에는 달콤한 디저트 와인이나 커피, 차가 여운을 남깁니다.'
  },
  
  // 치즈 페어링
  {
    foodCategory: 'cheese',
    drinkTypes: ['wine-red', 'wine-white', 'beer'],
    drinkTastes: ['rich', 'complex'],
    reason: '치즈의 풍부한 맛에는 와인이 클래식한 페어링입니다.'
  },
];

/**
 * 감지된 음식 라벨을 카테고리로 정규화
 */
export function normalizeMenuItems(detectedLabels: string[]): MenuCategory[] {
  const normalized: MenuCategory[] = [];
  
  for (const label of detectedLabels) {
    const lowerLabel = label.toLowerCase();
    
    for (const menuCategory of MENU_CATEGORIES) {
      const matched = menuCategory.keywords.some(keyword => 
        lowerLabel.includes(keyword.toLowerCase())
      );
      
      if (matched) {
        // 중복 방지
        if (!normalized.find(n => 
          n.category === menuCategory.category && 
          n.subcategory === menuCategory.subcategory
        )) {
          normalized.push(menuCategory);
        }
      }
    }
  }
  
  return normalized;
}

/**
 * 정규화된 메뉴에서 페어링 룰 찾기
 */
export function findPairingRules(normalizedMenus: MenuCategory[]): PairingRule[] {
  const rules: PairingRule[] = [];
  
  for (const menu of normalizedMenus) {
    // 서브카테고리 매칭 우선
    if (menu.subcategory) {
      const rule = PAIRING_RULES.find(r => 
        r.foodCategory === menu.category && 
        r.foodSubcategory === menu.subcategory
      );
      if (rule) {
        rules.push(rule);
        continue;
      }
    }
    
    // 카테고리 매칭
    const rule = PAIRING_RULES.find(r => 
      r.foodCategory === menu.category && 
      !r.foodSubcategory
    );
    if (rule) {
      rules.push(rule);
    }
  }
  
  return rules;
}

/**
 * 페어링 이유 생성
 */
export function generatePairingReason(
  normalizedMenus: MenuCategory[],
  rules: PairingRule[]
): string {
  if (rules.length === 0) {
    return '선택하신 음식과 잘 어울리는 음료를 추천해드립니다.';
  }
  
  // 첫 번째 룰의 이유 사용
  return rules[0].reason;
}
