"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/app/store/userStore"
import { createRecommendation } from "@/app/api/recommendation"
import { HomeScreen } from "@/components/paire/home-screen"
import { CaptureScreen } from "@/components/paire/capture-screen"
import { LoadingScreen } from "@/components/paire/loading-screen"
import { PreferenceScreen } from "@/components/paire/preference-screen"
import { RecommendationScreen } from "@/components/paire/recommendation-screen"
import { DrinkDetailScreen } from "@/components/paire/drink-detail-screen"
import { MenuInputScreen } from "@/components/paire/menu-input-screen"
import { Settings, LogOut } from "lucide-react"

type Screen =
  | "home"
  | "capture"
  | "loading"
  | "preference"
  | "recommendation"
  | "detail"
  | "menu-input"

interface Drink {
  id: string
  name: string
  type: string
  description: string
  tastingNotes: string[]
  image: string
  price: string
}

export default function PairePage() {
  const router = useRouter()
  const { user, token } = useUserStore()
  const [screen, setScreen] = useState<Screen>("home")
  const [capturedImage, setCapturedImage] = useState<string>("")
  const [preferences, setPreferences] = useState<{ occasion: string; tastes: string[] }>({
    occasion: "",
    tastes: [],
  })
  const [recommendedDrinks, setRecommendedDrinks] = useState<Drink[]>([])
  const [fairyMessage, setFairyMessage] = useState<string>("")
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null)
  const [menuText, setMenuText] = useState<string>("")
  const [isReady, setIsReady] = useState(false)
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false)

  // 초기화 완료 후 준비
  useEffect(() => {
    setIsReady(true)
  }, [])

  const handleCaptureFood = () => {
    setScreen("capture")
  }

  const handleMenuInput = () => {
    setScreen("menu-input")
  }

  const handleCapture = (imageUrl: string) => {
    setCapturedImage(imageUrl)
    setScreen("preference") // 바로 취향 선택으로
  }

  const handlePreferenceSubmit = async (prefs: { occasion: string; tastes: string[] }) => {
    setPreferences(prefs)
    
    // 비로그인 사용자 체크 - localStorage에서 사용 횟수 확인
    if (!user) {
      const guestUsageCount = parseInt(localStorage.getItem('guestRecommendationCount') || '0')
      
      if (guestUsageCount >= 1) {
        // 비로그인 사용자는 1회만 가능
        const confirmSignup = confirm(
          '비회원은 1회만 무료로 이용 가능합니다.\n회원가입하시면 매일 1회 무료로 이용할 수 있어요!\n\n회원가입 하시겠어요?'
        )
        
        if (confirmSignup) {
          router.push('/signup')
        }
        return
      }
    }
    
    setScreen("loading") // 로딩 화면 표시
    setIsLoadingRecommendation(true)

    try {
      // 이미지 URL 처리 (placeholder 이미지는 null로 전달)
      const imageUrl = capturedImage && !capturedImage.includes('paire-fairy')
        ? capturedImage
        : undefined

      // 백엔드 API 호출
      const response = await createRecommendation(
        {
          imageUrl,
          occasion: prefs.occasion,
          tastes: prefs.tastes,
        },
        token || undefined
      )

      setRecommendedDrinks(response.recommendation.drinks)
      setFairyMessage(response.recommendation.fairyMessage)
      setScreen("recommendation")
      
      // 비로그인 사용자의 경우 사용 횟수 증가
      if (!user) {
        const currentCount = parseInt(localStorage.getItem('guestRecommendationCount') || '0')
        localStorage.setItem('guestRecommendationCount', String(currentCount + 1))
      }
    } catch (error: any) {
      console.error('추천 생성 실패:', error)

      // 사용자 친화적 에러 메시지
      let errorMessage = '추천을 생성하는데 실패했습니다.'
      let showUpgradeOption = false
      
      if (error.message.includes('일일 추천 한도') || error.message.includes('limit')) {
        if (user && user.membership === 'FREE') {
          errorMessage = '오늘의 무료 추천을 모두 사용했습니다.\nPREMIUM으로 업그레이드하시면 무제한으로 이용할 수 있어요!'
          showUpgradeOption = true
        } else {
          errorMessage = '오늘의 무료 추천을 모두 사용했습니다.'
        }
      } else if (error.message.includes('로그인')) {
        errorMessage = '로그인이 필요한 서비스입니다.'
      }

      if (showUpgradeOption) {
        const confirmUpgrade = confirm(errorMessage + '\n\n업그레이드 페이지로 이동하시겠어요?')
        if (confirmUpgrade) {
          router.push('/subscription')
        }
      } else {
        alert(errorMessage)
      }
      
      setScreen("preference")
    } finally {
      setIsLoadingRecommendation(false)
    }
  }

  const handleSelectDrink = (drink: Drink) => {
    setSelectedDrink(drink)
    setScreen("detail")
  }

  const handleMenuSubmit = (menu: string) => {
    setMenuText(menu)
    setCapturedImage("/images/paire-fairy.png")
    setScreen("preference")
  }

  const handleAddToCart = () => {
    alert("Added to cart! (Demo)")
  }

  const handleRefresh = async () => {
    // 새로운 추천 가져오기
    if (preferences.occasion && preferences.tastes.length > 0) {
      await handlePreferenceSubmit(preferences)
    }
  }

  const goHome = () => {
    setScreen("home")
    setCapturedImage("")
    setMenuText("")
    setPreferences({ occasion: "", tastes: [] })
    setRecommendedDrinks([])
    setFairyMessage("")
    setSelectedDrink(null)
  }

  const handleLogout = () => {
    const { logout } = useUserStore.getState()
    logout()
    router.push("/login")
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-foreground text-2xl font-light mb-4">PAIRÉ</div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* 헤더 (로그인 상태일 때만) */}
      {user && screen === "home" && (
        <div className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-light text-foreground">PAIRÉ</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/user-info")}
                className="text-gold hover:text-gold-light transition"
                title="내 정보"
              >
                👤
              </button>
              <button
                onClick={() => router.push("/settings")}
                className="text-gold hover:text-gold-light transition"
                title="설정"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="text-gold hover:text-gold-light transition"
                title="로그아웃"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {screen === "home" && (
        <HomeScreen
          onCaptureFood={handleCaptureFood}
          onMenuInput={handleMenuInput}
          user={user}
          onLoginClick={() => router.push("/login")}
          onSignupClick={() => router.push("/signup")}
        />
      )}

      {screen === "capture" && (
        <CaptureScreen
          onCapture={handleCapture}
          onBack={goHome}
        />
      )}

      {screen === "loading" && (
        <LoadingScreen
          imageUrl={capturedImage}
          onComplete={() => { }} // API 호출 완료 시 자동으로 화면 전환
        />
      )}

      {screen === "preference" && (
        <PreferenceScreen
          onSubmit={handlePreferenceSubmit}
          onBack={() => menuText ? setScreen("menu-input") : setScreen("capture")}
          isLoading={isLoadingRecommendation}
        />
      )}

      {screen === "recommendation" && (
        <RecommendationScreen
          imageUrl={capturedImage}
          preferences={preferences}
          drinks={recommendedDrinks}
          fairyMessage={fairyMessage}
          onSelect={handleSelectDrink}
          onBack={() => setScreen("preference")}
          onRefresh={handleRefresh}
        />
      )}

      {screen === "detail" && selectedDrink && (
        <DrinkDetailScreen
          drink={selectedDrink}
          onBack={() => setScreen("recommendation")}
          onAddToCart={handleAddToCart}
        />
      )}

      {screen === "menu-input" && (
        <MenuInputScreen
          onSubmit={handleMenuSubmit}
          onBack={goHome}
        />
      )}
    </main>
  )
}
