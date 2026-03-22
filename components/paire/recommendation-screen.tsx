"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ChevronLeft, ChevronRight, ShoppingBag, RefreshCw, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import { shareViaWebAPI, copyToClipboard, generateShareText } from "@/lib/share"
import { LoadingFairy } from "./loading-fairy"

interface RecommendationScreenProps {
  imageUrl: string
  preferences: { occasion: string; tastes: string[] }
  drinks?: Drink[]
  fairyMessage?: string
  onSelect: (drink: Drink) => void
  onBack: () => void
  onRefresh: () => void
}

interface Drink {
  id: string
  name: string
  nameEn?: string
  type: string
  description: string
  tastingNotes: string[]
  image: string | null
  price: string
  purchaseUrl?: string
  aiReason?: string
  aiScore?: number
  pairingNotes?: string
}

// 음료 타입 번역
const drinkTypeTranslations: Record<string, { ko: string; en: string }> = {
  "sparkling": { ko: "스파클링 와인", en: "Sparkling Wine" },
  "red wine": { ko: "레드 와인", en: "Red Wine" },
  "white wine": { ko: "화이트 와인", en: "White Wine" },
  "whisky": { ko: "위스키", en: "Whisky" },
  "cocktail": { ko: "칵테일", en: "Cocktail" },
  "tea": { ko: "차", en: "Tea" },
  "non-alcoholic": { ko: "논알콜", en: "Non-Alcoholic" },
}

// 테이스팅 노트 번역
const tastingNoteTranslations: Record<string, { ko: string; en: string }> = {
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
}

export function RecommendationScreen({
  imageUrl,
  drinks,
  fairyMessage,
  onSelect,
  onBack,
  onRefresh,
}: RecommendationScreenProps) {
  const { language, t } = useI18n()
  const isKorean = language === "ko"
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [showShareToast, setShowShareToast] = useState(false)

  // 공유 기능
  const handleShare = async () => {
    if (!drinks || drinks.length === 0) return;

    const shareText = generateShareText(drinks, isKorean);
    const shareData = {
      title: 'PAIRÉ',
      text: shareText,
      url: window.location.origin,
    };

    // 웹 공유 API 시도
    const shared = await shareViaWebAPI(shareData);

    if (!shared) {
      // 웹 공유 API가 없으면 클립보드에 복사
      const copied = await copyToClipboard(`${shareText}\n\n${window.location.origin}`);
      if (copied) {
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
      }
    }
  };

  // 랜덤 fairy 이미지 선택 (새로고침할 때마다 변경)
  const fairyImage = useMemo(() => {
    const fairyImages = [
      "/images/pairy1.png",
      "/images/pairy2.png",
      "/images/pairy3.png",
      "/images/pairy4.png",
      "/images/pairy5.png",
    ]
    return fairyImages[Math.floor(Math.random() * fairyImages.length)]
  }, [fairyMessage]) // fairyMessage가 바뀔 때마다 새 이미지

  // 랜덤 페어리 메시지 (새로고침할 때마다 변경)
  const randomFairyMessage = useMemo(() => {
    const messages = [
      isKorean ? "이 음식과 완벽하게 어울리는 음료를 찾았어요! ✨" : "I found the perfect drink to pair with your dish! ✨",
      isKorean ? "오늘의 분위기에 딱 맞는 추천이에요 💫" : "This is the perfect recommendation for today's mood 💫",
      isKorean ? "당신의 취향을 고려해서 골랐어요 🌟" : "I chose this considering your preferences 🌟",
      isKorean ? "특별한 순간을 더 특별하게 만들어줄 거예요 ✨" : "This will make your special moment even more special ✨",
      isKorean ? "이 조합은 정말 환상적이에요! 🎉" : "This combination is absolutely fantastic! 🎉",
      isKorean ? "최고의 페어링을 찾았어요 🥂" : "I found the best pairing 🥂",
      isKorean ? "이 한 잔이 당신의 식사를 완성해줄 거예요 🍷" : "This drink will complete your meal 🍷",
      isKorean ? "요정의 직감으로 선택했어요! 💝" : "I chose this with my fairy intuition! 💝",
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }, [fairyMessage, isKorean]) // fairyMessage나 언어가 바뀔 때마다 새 메시지

  // 실제 데이터가 없으면 빈 배열 사용
  const displayDrinks = drinks && drinks.length > 0 ? drinks : []

  if (displayDrinks.length === 0) {
    return <LoadingFairy isKorean={isKorean} />
  }

  const currentDrink = displayDrinks[currentIndex]

  // 음료 타입 번역
  const translateDrinkType = (type: string) => {
    if (!type) return type
    const translation = drinkTypeTranslations[type.toLowerCase()]
    return translation ? translation[language] : type
  }

  // 테이스팅 노트 번역
  const translateTastingNote = (note: string) => {
    if (!note) return note
    const translation = tastingNoteTranslations[note.toLowerCase()]
    return translation ? translation[language] : note
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prev) => {
      const next = prev + newDirection
      if (next < 0) return displayDrinks.length - 1
      if (next >= displayDrinks.length) return 0
      return next
    })
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-gold hover:bg-gold/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className={cn(
          "text-gold font-semibold text-lg tracking-wide",
          isKorean && "font-[var(--font-noto-kr)] text-base tracking-normal"
        )}>
          {t("recommendation.title")}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="text-gold hover:bg-gold/10"
            title={isKorean ? '공유하기' : 'Share'}
          >
            <Share2 className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            className="text-gold hover:bg-gold/10"
            title={isKorean ? '새로고침' : 'Refresh'}
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Food Image - 크기 2~3배 증가 */}
      <div className="px-6 mb-4">
        <div className="relative h-96 rounded-xl overflow-hidden">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt="Your dish"
            className="w-full h-full object-cover bg-secondary"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        </div>
      </div>

      {/* Fairy Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 mb-6 flex items-start gap-3"
      >
        <img
          src={fairyImage}
          alt="PAIRÉ Fairy"
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 bg-card rounded-2xl rounded-tl-none p-4 border border-border">
          <p className={cn(
            "text-foreground text-sm leading-relaxed",
            isKorean && "font-[var(--font-noto-kr)] text-xs leading-relaxed"
          )}>
            {fairyMessage || randomFairyMessage}
          </p>
        </div>
      </motion.div>

      {/* Drink Card Carousel */}
      <div className="flex-1 px-6 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentDrink.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="bg-card rounded-2xl border border-border overflow-hidden"
          >
            {/* Drink Image */}
            <div className="relative h-48 bg-secondary">
              <img
                src={currentDrink.image || "/placeholder.svg"}
                alt={currentDrink.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>

            {/* Drink Info */}
            <div className="p-5">
              <p className={cn(
                "text-gold-dim text-sm font-medium tracking-wide mb-1",
                isKorean && "font-[var(--font-noto-kr)] text-xs tracking-normal"
              )}>
                {translateDrinkType(currentDrink.type)}
              </p>
              <h2 className="text-foreground text-2xl font-semibold mb-3">
                {isKorean ? currentDrink.name : (currentDrink.nameEn || currentDrink.name)}
              </h2>

              {/* AI 추천 이유 */}
              {currentDrink.aiReason && (
                <div className="mb-3 p-3 bg-gold/5 rounded-lg border border-gold/20">
                  <p className={cn(
                    "text-sm text-foreground leading-relaxed",
                    isKorean && "font-[var(--font-noto-kr)] text-xs"
                  )}>
                    {currentDrink.aiReason}
                  </p>
                </div>
              )}

              {/* Pairing Notes */}
              {currentDrink.pairingNotes && (
                <div className="mb-3">
                  <p className={cn(
                    "text-xs text-muted-foreground leading-relaxed",
                    isKorean && "font-[var(--font-noto-kr)]"
                  )}>
                    {currentDrink.pairingNotes}
                  </p>
                </div>
              )}

              {/* Tasting Notes */}
              <div className="flex flex-wrap gap-2 mb-4">
                {currentDrink.tastingNotes.map((note) => (
                  <span
                    key={note}
                    className={cn(
                      "px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium",
                      isKorean && "font-[var(--font-noto-kr)]"
                    )}
                  >
                    {translateTastingNote(note)}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-gold text-2xl font-bold">{currentDrink.price}</p>
                {currentDrink.aiScore && (
                  <div className="flex items-center gap-1">
                    <span className="text-gold text-sm">★</span>
                    <span className="text-gold text-sm font-medium">{currentDrink.aiScore}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={() => paginate(-1)}
          className="absolute left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => paginate(1)}
          className="absolute right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 py-4">
        {displayDrinks.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > currentIndex ? 1 : -1)
              setCurrentIndex(i)
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              i === currentIndex ? "bg-gold w-6" : "bg-gold/30"
            )}
          />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="p-6 pt-0 flex gap-3">
        <Button
          variant="outline"
          onClick={() => paginate(1)}
          className={cn(
            "flex-1 h-14 border-gold/40 text-gold hover:bg-gold/10",
            isKorean && "font-[var(--font-noto-kr)] text-sm"
          )}
        >
          {t("recommendation.seeOther")}
        </Button>
        <Button
          onClick={() => onSelect(currentDrink)}
          className={cn(
            "flex-1 h-14 bg-gold hover:bg-gold-light text-background font-semibold",
            isKorean && "font-[var(--font-noto-kr)] text-sm"
          )}
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          {t("recommendation.selectThis")}
        </Button>
      </div>

      {/* 공유 토스트 */}
      {showShareToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gold text-background px-6 py-3 rounded-full shadow-lg z-50"
        >
          <p className={cn(
            "font-medium",
            isKorean && "font-[var(--font-noto-kr)] text-sm"
          )}>
            {isKorean ? '클립보드에 복사되었습니다!' : 'Copied to clipboard!'}
          </p>
        </motion.div>
      )}
    </div>
  )
}
