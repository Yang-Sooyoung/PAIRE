// 음료 타입 번역
export const drinkTypeTranslations: Record<string, { ko: string; en: string }> = {
  "sparkling": { ko: "스파클링 와인", en: "Sparkling Wine" },
  "red wine": { ko: "레드 와인", en: "Red Wine" },
  "white wine": { ko: "화이트 와인", en: "White Wine" },
  "whisky": { ko: "위스키", en: "Whisky" },
  "cocktail": { ko: "칵테일", en: "Cocktail" },
  "tea": { ko: "차", en: "Tea" },
  "non-alcoholic": { ko: "논알콜", en: "Non-Alcoholic" },
  "wine": { ko: "와인", en: "Wine" },
  "beer": { ko: "맥주", en: "Beer" },
  "sake": { ko: "사케", en: "Sake" },
  "champagne": { ko: "샴페인", en: "Champagne" },
}

// 테이스팅 노트 번역
export const tastingNoteTranslations: Record<string, { ko: string; en: string }> = {
  "fruity": { ko: "과일향", en: "Fruity" },
  "elegant": { ko: "우아한", en: "Elegant" },
  "light": { ko: "가벼운", en: "Light" },
  "bold": { ko: "진한", en: "Bold" },
  "complex": { ko: "복합적인", en: "Complex" },
  "smooth": { ko: "부드러운", en: "Smooth" },
  "crisp": { ko: "상쾌한", en: "Crisp" },
  "fresh": { ko: "신선한", en: "Fresh" },
  "rich": { ko: "풍부한", en: "Rich" },
  "spicy": { ko: "스파이시", en: "Spicy" },
  "sweet": { ko: "달콤한", en: "Sweet" },
  "floral": { ko: "꽃향", en: "Floral" },
  "medium": { ko: "중간", en: "Medium" },
  "heavy": { ko: "무거운", en: "Heavy" },
  "smoky": { ko: "스모키", en: "Smoky" },
  "tangy": { ko: "새콤한", en: "Tangy" },
  "herbal": { ko: "허브향", en: "Herbal" },
  "mineral": { ko: "미네랄", en: "Mineral" },
  "earthy": { ko: "흙내음", en: "Earthy" },
  "citrus": { ko: "시트러스", en: "Citrus" },
  "creamy": { ko: "크리미", en: "Creamy" },
  "tropical": { ko: "트로피컬", en: "Tropical" },
  "nutty": { ko: "고소한", en: "Nutty" },
  "roasted": { ko: "구운", en: "Roasted" },
  "delicate": { ko: "섬세한", en: "Delicate" },
  "malty": { ko: "몰티", en: "Malty" },
  "bright": { ko: "밝은", en: "Bright" },
  "umami": { ko: "감칠맛", en: "Umami" },
  "toasted": { ko: "토스티", en: "Toasted" },
  "savory": { ko: "짭짤한", en: "Savory" },
  "tart": { ko: "새콤달콤", en: "Tart" },
  "soothing": { ko: "편안한", en: "Soothing" },
  "cooling": { ko: "시원한", en: "Cooling" },
  "warming": { ko: "따뜻한", en: "Warming" },
  "grassy": { ko: "풀향", en: "Grassy" },
  "clean": { ko: "깔끔한", en: "Clean" },
  "natural": { ko: "자연스러운", en: "Natural" },
  "healthy": { ko: "건강한", en: "Healthy" },
  "refreshing": { ko: "상쾌한", en: "Refreshing" },
  "mild": { ko: "순한", en: "Mild" },
  "unique": { ko: "독특한", en: "Unique" },
  "dry": { ko: "드라이", en: "Dry" },
  "full-bodied": { ko: "풀바디", en: "Full-bodied" },
  "bitter": { ko: "쌉싸름한", en: "Bitter" },
  "astringent": { ko: "떫은", en: "Astringent" },
  "woody": { ko: "우디", en: "Woody" },
  "vanilla": { ko: "바닐라", en: "Vanilla" },
  "chocolate": { ko: "초콜릿", en: "Chocolate" },
  "caramel": { ko: "카라멜", en: "Caramel" },
  "pepper": { ko: "후추", en: "Pepper" },
  "oak": { ko: "오크", en: "Oak" },
}

export function translateDrinkType(type: string, language: 'ko' | 'en'): string {
  if (!type) return type
  const translation = drinkTypeTranslations[type.toLowerCase()]
  return translation ? translation[language] : type
}

export function translateTastingNote(note: string, language: 'ko' | 'en'): string {
  if (!note) return note
  const translation = tastingNoteTranslations[note.toLowerCase()]
  return translation ? translation[language] : note
}

// occasion 번역
export const occasionTranslations: Record<string, { ko: string; en: string }> = {
  "date": { ko: "데이트", en: "Date Night" },
  "solo": { ko: "혼자", en: "Solo Time" },
  "solo-drinking": { ko: "혼술", en: "Solo Drinking" },
  "solo-meal": { ko: "혼밥", en: "Solo Meal" },
  "friends": { ko: "친구 모임", en: "Friends Gathering" },
  "gathering": { ko: "모임", en: "Gathering" },
  "family": { ko: "가족", en: "Family" },
  "business": { ko: "비즈니스", en: "Business" },
  "celebration": { ko: "축하", en: "Celebration" },
  "camping": { ko: "캠핑", en: "Camping" },
  "all": { ko: "일반", en: "General" },
  // 한글 키도 지원 (DB에 한글로 저장된 경우)
  "데이트": { ko: "데이트", en: "Date Night" },
  "혼자": { ko: "혼자", en: "Solo Time" },
  "혼술": { ko: "혼술", en: "Solo Drinking" },
  "혼밥": { ko: "혼밥", en: "Solo Meal" },
  "친구 모임": { ko: "친구 모임", en: "Friends Gathering" },
  "친구모임": { ko: "친구 모임", en: "Friends Gathering" },
  "모임": { ko: "모임", en: "Gathering" },
  "가족": { ko: "가족", en: "Family" },
  "비즈니스": { ko: "비즈니스", en: "Business" },
  "축하": { ko: "축하", en: "Celebration" },
  "캠핑": { ko: "캠핑", en: "Camping" },
  "일반": { ko: "일반", en: "General" },
}

export function translateOccasion(occasion: string, language: 'ko' | 'en'): string {
  if (!occasion) return occasion
  const translation = occasionTranslations[occasion]
  return translation ? translation[language] : occasion
}

// 취향(taste) 번역
export const tasteTranslations: Record<string, { ko: string; en: string }> = {
  "sweet": { ko: "달콤한", en: "Sweet" },
  "bitter": { ko: "쓴", en: "Bitter" },
  "sour": { ko: "새콤한", en: "Sour" },
  "light": { ko: "가벼운", en: "Light" },
  "medium": { ko: "중간", en: "Medium" },
  "heavy": { ko: "진한", en: "Heavy" },
  "alcoholic": { ko: "알코올", en: "Alcoholic" },
  "non-alcoholic": { ko: "논알콜", en: "Non-Alcoholic" },
  "dry": { ko: "드라이", en: "Dry" },
  "bold": { ko: "풍부한", en: "Bold" },
  "coffee": { ko: "커피", en: "Coffee" },
  // 한글 키도 지원
  "달콤한": { ko: "달콤한", en: "Sweet" },
  "가벼운": { ko: "가벼운", en: "Light" },
  "진한": { ko: "진한", en: "Heavy" },
  "드라이": { ko: "드라이", en: "Dry" },
  "알코올": { ko: "알코올", en: "Alcoholic" },
  "논알콜": { ko: "논알콜", en: "Non-Alcoholic" },
}

export function translateTaste(taste: string, language: 'ko' | 'en'): string {
  if (!taste) return taste
  const translation = tasteTranslations[taste.toLowerCase()] || tasteTranslations[taste]
  return translation ? translation[language] : taste
}

/**
 * 음료 이름 표시: 한글 모드면 name, 영어 모드면 nameEn 또는 한글 감지 시 name 그대로
 */
export function getDrinkDisplayName(name: string, nameEn: string | undefined, isKorean: boolean): string {
  if (isKorean) return name
  if (nameEn && !/[가-힣]/.test(nameEn)) return nameEn
  // nameEn이 없거나 한글이면 name 사용 (한글이어도 그대로 - 고유명사)
  return name
}

// 가격 표시: 한국어 모드는 원화 그대로, 영어 모드는 USD 변환
// DB에 "₩15,000" 또는 "15000" 형태로 저장됨
// 환율: 1 USD ≈ 1,400 KRW (고정 근사값)
const KRW_TO_USD_RATE = 1400;

export function formatDrinkPrice(price: string, language: 'ko' | 'en'): string {
  if (!price) return price;
  if (language === 'ko') return price;

  // 이미 $ 표시면 그대로
  if (price.startsWith('$')) return price;

  // 숫자만 추출
  const numericValue = parseInt(price.replace(/[^0-9]/g, ''), 10);
  if (isNaN(numericValue) || numericValue === 0) return price;

  // KRW → USD 변환
  const usdValue = numericValue / KRW_TO_USD_RATE;
  return `$${usdValue.toFixed(2)}`;
}

/**
 * 지역 기반 가격 포맷 (IP 국가 기준)
 * KR → 원화, 그 외 → USD
 */
export function formatDrinkPriceByRegion(price: string, isKorea: boolean): string {
  if (!price) return price;
  if (isKorea) return price;

  if (price.startsWith('$')) return price;

  const numericValue = parseInt(price.replace(/[^0-9]/g, ''), 10);
  if (isNaN(numericValue) || numericValue === 0) return price;

  const usdValue = numericValue / KRW_TO_USD_RATE;
  return `$${usdValue.toFixed(2)}`;
}
