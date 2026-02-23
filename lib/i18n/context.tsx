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
      loading: "Loading...",
      email: "Email",
      password: "Password",
      name: "Name",
      nickname: "Nickname",
    },
    auth: {
      login: "Log In",
      signup: "Sign Up",
      loggingIn: "Logging in...",
      signingUp: "Processing...",
      logout: "Log Out",
      loginTitle: "Log In",
      signupTitle: "Create Account",
      profileSetup: "Profile Setup",
      emailPlaceholder: "your@email.com",
      passwordPlaceholder: "••••••••",
      namePlaceholder: "John Doe",
      nicknamePlaceholder: "PAIRÉ's Friend",
      nicknameOptional: "Nickname (Optional)",
      loginError: "Login failed. Please check your email or password.",
      signupSuccess: "Sign up complete. Logging in...",
      signupError: "Sign up failed. Please try again.",
      or: "OR",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      next: "Next",
      complete: "Complete Sign Up",
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
    userInfo: {
      title: "My Info",
      membership: "Membership",
      accountInfo: "Account Information",
      userId: "User ID",
      role: "Role",
      startRecommendation: "Start Recommendation",
      manageSubscription: "Manage Subscription",
      subscribe: "Subscribe",
      settings: "Settings",
      upgrade: "Upgrade",
      loginRequired: "Login Required",
      goToLogin: "Go to Login",
    },
    settings: {
      title: "Settings",
      accountInfo: "Account Information",
      termsAndPolicies: "Terms & Policies",
      customerSupport: "Customer Support",
      dangerZone: "Danger Zone",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      payment: "Payment/Refund Policy",
      contact: "Contact Us",
      deleteAccount: "Delete Account",
      deleteConfirmTitle: "Delete your account?",
      deleteConfirmDesc: "This action cannot be undone. All data will be permanently deleted.",
      deleteItems: {
        account: "Account information",
        history: "Recommendation history",
        subscription: "Subscription info",
        data: "All personal data",
      },
      cancel: "Cancel",
      delete: "Delete",
      version: "PAIRÉ v1.0.0",
      copyright: "© 2026 PAIRÉ. All rights reserved.",
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
      loading: "로딩 중...",
      email: "이메일",
      password: "비밀번호",
      name: "이름",
      nickname: "닉네임",
    },
    auth: {
      login: "로그인",
      signup: "회원가입",
      loggingIn: "로그인 중...",
      signingUp: "처리 중...",
      logout: "로그아웃",
      loginTitle: "로그인",
      signupTitle: "계정 만들기",
      profileSetup: "프로필 설정",
      emailPlaceholder: "your@email.com",
      passwordPlaceholder: "••••••••",
      namePlaceholder: "홍길동",
      nicknamePlaceholder: "페어레의 친구",
      nicknameOptional: "닉네임 (선택)",
      loginError: "로그인 실패. 이메일 또는 비밀번호를 확인하세요.",
      signupSuccess: "회원가입이 완료되었습니다. 로그인 중...",
      signupError: "회원가입 실패. 다시 시도해주세요.",
      or: "또는",
      noAccount: "계정이 없으신가요?",
      hasAccount: "이미 계정이 있으신가요?",
      next: "다음",
      complete: "회원가입 완료",
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
    userInfo: {
      title: "내 정보",
      membership: "멤버십",
      accountInfo: "계정 정보",
      userId: "사용자 ID",
      role: "권한",
      startRecommendation: "추천 시작",
      manageSubscription: "구독 관리",
      subscribe: "구독하기",
      settings: "설정",
      upgrade: "업그레이드",
      loginRequired: "로그인이 필요합니다",
      goToLogin: "로그인 페이지로 이동",
    },
    settings: {
      title: "설정",
      accountInfo: "계정 정보",
      termsAndPolicies: "약관 & 정책",
      customerSupport: "고객 지원",
      dangerZone: "위험 영역",
      terms: "이용약관",
      privacy: "개인정보처리방침",
      payment: "결제/환불 정책",
      contact: "문의하기",
      deleteAccount: "계정 삭제",
      deleteConfirmTitle: "계정을 삭제하시겠어요?",
      deleteConfirmDesc: "이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.",
      deleteItems: {
        account: "계정 정보",
        history: "추천 기록",
        subscription: "구독 정보",
        data: "모든 개인 데이터",
      },
      cancel: "취소",
      delete: "삭제",
      version: "PAIRÉ v1.0.0",
      copyright: "© 2026 PAIRÉ. All rights reserved.",
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
