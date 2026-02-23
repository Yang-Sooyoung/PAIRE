"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Language = "en" | "ko"

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    const saved = localStorage.getItem("paire-language") as Language
    if (saved && (saved === "en" || saved === "ko")) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("paire-language", lang)
  }

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: unknown = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        return key
      }
    }
    
    return typeof value === "string" ? value : key
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

const translations = {
  en: {
    common: {
      back: "Back",
    },
    home: {
      tagline: "Invite a fairy to your table",
      captureBtn: "Capture Your Dish",
      menuBtn: "Enter Menu",
    },
    capture: {
      title: "Capture Dish",
      placeholder: "Capture your dish",
      hint: "Make sure the food is clearly visible",
      hintLong: "Make sure the food is clearly visible in the frame",
      retake: "Retake",
      usePhoto: "Use Photo",
      selectPhoto: "Select Photo",
    },
    loading: {
      message1: "The fairy is examining your table...",
      message2: "Sensing the flavors and aromas...",
      message3: "Selecting the perfect pairing...",
    },
    preference: {
      title: "Set the Mood",
      occasionTitle: "What's the occasion?",
      tasteTitle: "Any preferences?",
      submit: "Get My Pairing",
      occasions: {
        date: "Date Night",
        solo: "Solo Time",
        gathering: "Gathering",
        camping: "Camping",
        home: "Home Party",
      },
      tastes: {
        alcoholic: "Alcoholic",
        nonAlcoholic: "Non-Alcoholic",
        sweet: "Sweet",
        dry: "Dry",
        light: "Light",
        bold: "Bold",
        coffee: "Coffee",
      },
    },
    recommendation: {
      title: "Fairy's Pick",
      seeOther: "See Other Picks",
      selectThis: "Select This",
    },
    detail: {
      tastingNotes: "Tasting Notes",
      flavorProfile: "Flavor Profile",
      perfectFor: "Perfect For",
      fairyNote: "Fairy's Note",
      addToCart: "Add to Cart",
      addedToCart: "Added to Cart",
      fineDining: "Fine Dining",
      celebrations: "Celebrations",
      redMeat: "Red Meat",
      sweetness: "Sweetness",
      acidity: "Acidity",
      body: "Body",
      tannin: "Tannin",
    },
    menuInput: {
      title: "Enter Menu",
      label: "What's on your table tonight?",
      placeholder: "e.g., Grilled salmon with lemon butter sauce",
      suggestions: "Quick suggestions",
      submit: "Find My Pairing",
      items: {
        steak: "Grilled Ribeye Steak",
        pasta: "Creamy Pasta Carbonara",
        sushi: "Sushi Omakase",
        kbbq: "Korean BBQ",
        thai: "Thai Green Curry",
        soup: "French Onion Soup",
      },
    },
    drinks: {
      redWine: "Red Wine",
      champagne: "Champagne",
      whisky: "Japanese Whisky",
      desc1: "Your dish has deep, rich flavors. This elegant wine will gracefully carry those notes into a lingering finish.",
      desc2: "The subtle textures in your meal call for something that dances — light bubbles to lift every bite.",
      desc3: "When flavors are this refined, a gentle whisky adds warmth without overwhelming the palate.",
    },
  },
  ko: {
    common: {
      back: "뒤로",
    },
    home: {
      tagline: "오늘 밤, 요정이 테이블에 찾아옵니다",
      captureBtn: "요리 촬영하기",
      menuBtn: "메뉴 직접 입력",
    },
    capture: {
      title: "요리 촬영",
      placeholder: "요리를 담아주세요",
      hint: "음식이 잘 보이도록 촬영해 주세요",
      hintLong: "화면 안에 음식이 잘 보이도록 담아주세요",
      retake: "다시 찍기",
      usePhoto: "이 사진 사용",
      selectPhoto: "사진 선택",
    },
    loading: {
      message1: "요정이 테이블을 살펴보고 있어요...",
      message2: "풍미와 향을 느끼고 있어요...",
      message3: "완벽한 페어링을 고르고 있어요...",
    },
    preference: {
      title: "분위기 설정",
      occasionTitle: "오늘은 어떤 자리인가요?",
      tasteTitle: "선호하시는 스타일이 있나요?",
      submit: "페어링 추천받기",
      occasions: {
        date: "데이트",
        solo: "혼술",
        gathering: "모임",
        camping: "캠핑",
        home: "홈파티",
      },
      tastes: {
        alcoholic: "알코올",
        nonAlcoholic: "논알코올",
        sweet: "달콤한",
        dry: "드라이",
        light: "가벼운",
        bold: "진한",
        coffee: "커피",
      },
    },
    recommendation: {
      title: "요정의 추천",
      seeOther: "다른 추천 보기",
      selectThis: "이걸로 할게요",
    },
    detail: {
      tastingNotes: "테이스팅 노트",
      flavorProfile: "맛 프로필",
      perfectFor: "이런 자리에 어울려요",
      fairyNote: "요정의 한마디",
      addToCart: "장바구니 담기",
      addedToCart: "담았어요",
      fineDining: "파인다이닝",
      celebrations: "기념일",
      redMeat: "붉은 고기",
      sweetness: "당도",
      acidity: "산도",
      body: "바디감",
      tannin: "타닌",
    },
    menuInput: {
      title: "메뉴 입력",
      label: "오늘 테이블 위엔 어떤 요리가 있나요?",
      placeholder: "예: 레몬 버터 소스를 곁들인 연어 구이",
      suggestions: "빠른 선택",
      submit: "페어링 찾기",
      items: {
        steak: "립아이 스테이크",
        pasta: "까르보나라",
        sushi: "오마카세",
        kbbq: "삼겹살",
        thai: "태국식 그린 커리",
        soup: "프렌치 어니언 수프",
      },
    },
    drinks: {
      redWine: "레드 와인",
      champagne: "샴페인",
      whisky: "재패니즈 위스키",
      desc1: "요리의 깊고 풍부한 맛에 우아하게 어울리며, 여운을 길게 남겨줄 와인이에요.",
      desc2: "섬세한 요리엔 가볍게 춤추는 거품이 필요해요. 한 입 한 입을 더 특별하게 만들어 줄 거예요.",
      desc3: "이토록 정갈한 풍미엔 따뜻함을 더해줄 부드러운 위스키가 어울려요.",
    },
  },
} as const
