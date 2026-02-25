"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Wine, Droplet, Sparkles, ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomDialog } from "@/components/ui/custom-dialog"
import { useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import { useUserStore } from "@/app/store/userStore"
import { addFavorite, removeFavorite, checkFavorite } from "@/app/api/favorite"

interface DrinkDetailScreenProps {
  drink: {
    id: string
    name: string
    type: string
    typeKey?: string
    description: string
    descriptionKey?: string
    tastingNotes: string[]
    image: string
    price: string
    purchaseUrl?: string
    foodPairings?: string[]
    occasions?: string[]
    tastes?: string[]
    aiReason?: string
    aiScore?: number
    pairingNotes?: string
  }
  foodContext?: {
    keywords: string[]
    category: string
  }
  userPreferences?: {
    occasion: string
    tastes: string[]
    priceRange?: string
  }
  onBack: () => void
}

export function DrinkDetailScreen({ drink, foodContext, userPreferences, onBack }: DrinkDetailScreenProps) {
  const { language, t } = useI18n()
  const isKorean = language === "ko"
  const { user } = useUserStore()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogConfig, setDialogConfig] = useState<{
    type: 'info' | 'success' | 'warning' | 'error' | 'confirm'
    title: string
    description: string
    onConfirm?: () => void
  }>({
    type: 'info',
    title: '',
    description: '',
  })

  // 즐겨찾기 상태 확인
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user && user.membership === 'PREMIUM') {
        // 최신 토큰 가져오기
        const currentToken = useUserStore.getState().token
        if (!currentToken) return
        
        try {
          const res = await checkFavorite(drink.id, currentToken)
          setIsWishlisted(res.isFavorite)
        } catch (err) {
          console.error('즐겨찾기 확인 실패:', err)
        }
      }
    }
    
    checkFavoriteStatus()
  }, [drink.id, user])

  // 즐겨찾기 토글
  const handleToggleFavorite = async () => {
    if (!user) {
      setDialogConfig({
        type: 'warning',
        title: isKorean ? '로그인 필요' : 'Login Required',
        description: isKorean ? '로그인이 필요합니다.' : 'Please login first.',
      })
      setShowDialog(true)
      return
    }

    // 최신 토큰 가져오기
    const currentToken = useUserStore.getState().token
    if (!currentToken) {
      setDialogConfig({
        type: 'warning',
        title: isKorean ? '로그인 필요' : 'Login Required',
        description: isKorean ? '로그인이 필요합니다.' : 'Please login first.',
      })
      setShowDialog(true)
      return
    }

    if (user.membership !== 'PREMIUM') {
      setDialogConfig({
        type: 'confirm',
        title: isKorean ? 'PREMIUM 전용 기능' : 'PREMIUM Feature',
        description: isKorean
          ? '즐겨찾기는 PREMIUM 멤버만 이용할 수 있습니다.\n업그레이드 하시겠어요?'
          : 'Favorites are available for PREMIUM members only.\nWould you like to upgrade?',
        onConfirm: () => {
          setShowDialog(false)
          window.location.href = '/subscription'
        }
      })
      setShowDialog(true)
      return
    }

    setIsLoadingFavorite(true)
    try {
      if (isWishlisted) {
        await removeFavorite(drink.id, currentToken)
        setIsWishlisted(false)
      } else {
        await addFavorite(drink.id, currentToken)
        setIsWishlisted(true)
      }
    } catch (error: any) {
      setDialogConfig({
        type: 'error',
        title: isKorean ? '오류' : 'Error',
        description: error.message || (isKorean ? '오류가 발생했습니다.' : 'An error occurred.'),
      })
      setShowDialog(true)
    } finally {
      setIsLoadingFavorite(false)
    }
  }

  // 음료 타입별 Flavor Profile 계산
  const calculateFlavorProfile = () => {
    const type = drink.type.toLowerCase()
    const tastes = drink.tastes || []
    
    // 기본값
    let sweetness = 50
    let acidity = 50
    let body = 50
    let tannin = 50
    
    // 타입별 기본 프로필
    if (type.includes('red wine')) {
      sweetness = 20
      acidity = 60
      body = 80
      tannin = 75
    } else if (type.includes('white wine')) {
      sweetness = 30
      acidity = 70
      body = 40
      tannin = 20
    } else if (type.includes('sparkling')) {
      sweetness = 40
      acidity = 80
      body = 30
      tannin = 10
    } else if (type.includes('whisky')) {
      sweetness = 25
      acidity = 30
      body = 90
      tannin = 60
    } else if (type.includes('cocktail')) {
      sweetness = 60
      acidity = 50
      body = 40
      tannin = 10
    } else if (type.includes('tea')) {
      sweetness = 20
      acidity = 40
      body = 30
      tannin = 50
    } else if (type.includes('non-alcoholic')) {
      sweetness = 50
      acidity = 40
      body = 20
      tannin = 5
    }
    
    // tastes 배열로 조정
    if (tastes.includes('sweet')) sweetness += 20
    if (tastes.includes('bitter')) {
      sweetness -= 15
      tannin += 15
    }
    if (tastes.includes('sour')) acidity += 20
    if (tastes.includes('light')) body -= 20
    if (tastes.includes('medium')) body = 50
    if (tastes.includes('heavy')) body += 20
    
    // 0-100 범위로 제한
    return {
      [t("detail.sweetness")]: Math.max(0, Math.min(100, sweetness)),
      [t("detail.acidity")]: Math.max(0, Math.min(100, acidity)),
      [t("detail.body")]: Math.max(0, Math.min(100, body)),
      [t("detail.tannin")]: Math.max(0, Math.min(100, tannin)),
    }
  }

  // Perfect For 아이콘 매핑
  const getPerfectForItems = () => {
    const occasions = drink.occasions || []
    const foodPairings = drink.foodPairings || []
    
    const items = []
    
    // occasions 기반
    if (occasions.includes('date')) {
      items.push({ icon: 'sparkles', label: isKorean ? '데이트' : 'Date Night' })
    }
    if (occasions.includes('gathering')) {
      items.push({ icon: 'wine', label: isKorean ? '모임' : 'Gatherings' })
    }
    if (occasions.includes('solo-drinking') || occasions.includes('solo-meal')) {
      items.push({ icon: 'droplet', label: isKorean ? '혼자' : 'Solo Time' })
    }
    if (occasions.includes('camping')) {
      items.push({ icon: 'sparkles', label: isKorean ? '캠핑' : 'Camping' })
    }
    
    // foodPairings 기반 (occasions가 부족할 경우)
    if (items.length < 3 && foodPairings.includes('meat')) {
      items.push({ icon: 'droplet', label: isKorean ? '고기 요리' : 'Meat Dishes' })
    }
    if (items.length < 3 && foodPairings.includes('seafood')) {
      items.push({ icon: 'wine', label: isKorean ? '해산물' : 'Seafood' })
    }
    if (items.length < 3 && foodPairings.includes('dessert')) {
      items.push({ icon: 'sparkles', label: isKorean ? '디저트' : 'Desserts' })
    }
    
    // 기본값 (데이터가 없을 경우)
    if (items.length === 0) {
      items.push(
        { icon: 'wine', label: t("detail.fineDining") },
        { icon: 'sparkles', label: t("detail.celebrations") },
        { icon: 'droplet', label: isKorean ? '특별한 순간' : 'Special Moments' }
      )
    }
    
    return items.slice(0, 3) // 최대 3개
  }

  // 페어리 노트 번역
  const translateFairyNote = (description: string) => {
    if (!description) return ""
    
    // 영어 모드이고 한글 텍스트인 경우
    if (!isKorean && /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(description)) {
      // 간단한 번역 매핑 (실제로는 백엔드에서 처리하는 것이 좋음)
      return "This drink pairs perfectly with your dish, creating a harmonious balance of flavors."
    }
    
    return description
  }

  const flavorProfile = calculateFlavorProfile()
  const perfectForItems = getPerfectForItems()

  const handlePurchase = () => {
    // 쿠팡 구매 링크가 있으면 해당 링크로, 없으면 검색으로 이동
    if (drink.purchaseUrl) {
      window.open(drink.purchaseUrl, '_blank')
    } else {
      const searchQuery = encodeURIComponent(drink.name)
      window.open(`https://www.coupang.com/np/search?q=${searchQuery}`, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Image */}
      <div className="relative h-80">
        <img
          src={drink.image || "/placeholder.svg"}
          alt={drink.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="bg-background/30 backdrop-blur-sm text-foreground hover:bg-background/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            disabled={isLoadingFavorite}
            className="bg-background/30 backdrop-blur-sm text-foreground hover:bg-background/50"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? "fill-gold text-gold" : ""}`} />
          </Button>
        </div>

        {/* Drink Type Badge */}
        <div className="absolute bottom-6 left-6">
          <span className={cn(
            "px-4 py-2 rounded-full bg-gold/20 backdrop-blur-sm text-gold text-sm font-medium border border-gold/30",
            isKorean && "font-[var(--font-noto-kr)] text-xs"
          )}>
            {drink.typeKey ? t(drink.typeKey) : drink.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-4 pb-32 overflow-y-auto">
        {/* Title & Price */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-foreground text-3xl font-bold mb-2">{drink.name}</h1>
          <p className="text-gold text-2xl font-semibold">{drink.price}</p>
        </motion.div>

        {/* Tasting Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h3 className={cn(
            "text-gold-light text-lg font-medium mb-3",
            isKorean && "font-[var(--font-noto-kr)] text-base"
          )}>
            {t("detail.tastingNotes")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {drink.tastingNotes.map((note) => (
              <span
                key={note}
                className="px-4 py-2 rounded-full bg-card border border-border text-foreground text-sm"
              >
                {note}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Flavor Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className={cn(
            "text-gold-light text-lg font-medium mb-4",
            isKorean && "font-[var(--font-noto-kr)] text-base"
          )}>
            {t("detail.flavorProfile")}
          </h3>
          <div className="space-y-4">
            {Object.entries(flavorProfile).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={cn(
                    "text-muted-foreground capitalize",
                    isKorean && "font-[var(--font-noto-kr)] text-xs"
                  )}>
                    {key}
                  </span>
                  <span className="text-gold-dim">{value}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-gold-dim to-gold rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Perfect For */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className={cn(
            "text-gold-light text-lg font-medium mb-4",
            isKorean && "font-[var(--font-noto-kr)] text-base"
          )}>
            {t("detail.perfectFor")}
          </h3>
          <div className="flex gap-4">
            {perfectForItems.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center">
                  {item.icon === 'wine' && <Wine className="w-6 h-6 text-gold" />}
                  {item.icon === 'sparkles' && <Sparkles className="w-6 h-6 text-gold" />}
                  {item.icon === 'droplet' && <Droplet className="w-6 h-6 text-gold" />}
                </div>
                <span className={cn(
                  "text-xs text-muted-foreground text-center",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Description / AI Pairing Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* AI 추천 이유 */}
          {drink.aiReason && (
            <div className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
                <h3 className={cn(
                  "text-gold text-lg font-medium",
                  isKorean && "font-[var(--font-noto-kr)] text-base"
                )}>
                  {isKorean ? '페어리의 추천 이유' : "Fairy's Recommendation"}
                </h3>
              </div>
              <p className={cn(
                "text-foreground leading-relaxed mb-3",
                isKorean && "font-[var(--font-noto-kr)] text-sm leading-relaxed"
              )}>
                {drink.aiReason}
              </p>
              {drink.aiScore && (
                <div className="flex items-center gap-2 pt-3 border-t border-gold/20">
                  <span className="text-gold text-sm">★</span>
                  <span className="text-gold text-sm font-medium">
                    {isKorean ? '추천 점수' : 'Match Score'}: {drink.aiScore}/100
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 페어링 노트 */}
          {drink.pairingNotes && (
            <div>
              <h3 className={cn(
                "text-gold-light text-lg font-medium mb-3",
                isKorean && "font-[var(--font-noto-kr)] text-base"
              )}>
                {isKorean ? '맛의 조화' : 'Flavor Harmony'}
              </h3>
              <p className={cn(
                "text-muted-foreground leading-relaxed",
                isKorean && "font-[var(--font-noto-kr)] text-sm leading-relaxed"
              )}>
                {drink.pairingNotes}
              </p>
            </div>
          )}

          {/* 기본 설명 */}
          <div>
            <h3 className={cn(
              "text-gold-light text-lg font-medium mb-3",
              isKorean && "font-[var(--font-noto-kr)] text-base"
            )}>
              {t("detail.fairyNote")}
            </h3>
            <p className={cn(
              "text-muted-foreground leading-relaxed",
              isKorean && "font-[var(--font-noto-kr)] text-sm leading-relaxed"
            )}>
              {translateFairyNote(drink.description)}
            </p>
          </div>

          {/* 음식 & 선호도 컨텍스트 */}
          {(foodContext || userPreferences) && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h4 className={cn(
                "text-foreground font-medium mb-3",
                isKorean && "font-[var(--font-noto-kr)] text-sm"
              )}>
                {isKorean ? '이 추천은 다음을 고려했어요' : 'This recommendation considers'}
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                {foodContext && (
                  <div className={cn(isKorean && "font-[var(--font-noto-kr)] text-xs")}>
                    • {isKorean ? '음식' : 'Food'}: {foodContext.keywords.join(', ')} ({foodContext.category})
                  </div>
                )}
                {userPreferences?.occasion && (
                  <div className={cn(isKorean && "font-[var(--font-noto-kr)] text-xs")}>
                    • {isKorean ? '상황' : 'Occasion'}: {userPreferences.occasion}
                  </div>
                )}
                {userPreferences?.tastes && userPreferences.tastes.length > 0 && (
                  <div className={cn(isKorean && "font-[var(--font-noto-kr)] text-xs")}>
                    • {isKorean ? '선호' : 'Preferences'}: {userPreferences.tastes.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleFavorite}
            disabled={isLoadingFavorite}
            className="h-14 w-14 border-gold/40 text-gold hover:bg-gold/10 shrink-0"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? "fill-gold" : ""}`} />
          </Button>
          <Button
            onClick={handlePurchase}
            className={cn(
              "flex-1 h-14 bg-gold hover:bg-gold-light text-background font-semibold text-lg",
              isKorean && "font-[var(--font-noto-kr)] text-base"
            )}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {isKorean ? '구매하기' : 'Buy Now'}
          </Button>
        </div>
      </div>

      {/* Custom Dialog */}
      <CustomDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        type={dialogConfig.type}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmText={dialogConfig.type === 'confirm' ? (isKorean ? '확인' : 'Confirm') : undefined}
        cancelText={dialogConfig.type === 'confirm' ? (isKorean ? '취소' : 'Cancel') : undefined}
        onConfirm={dialogConfig.onConfirm}
      />
    </div>
  )
}
