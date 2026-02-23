"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ChevronLeft, ChevronRight, ShoppingBag, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

interface RecommendationScreenProps {
  imageUrl: string
  preferences: { occasion: string; tastes: string[] }
  onSelect: (drink: Drink) => void
  onBack: () => void
  onRefresh: () => void
}

interface Drink {
  id: string
  name: string
  type: string
  typeKey: string
  description: string
  descriptionKey: string
  tastingNotes: string[]
  image: string
  price: string
}

const sampleDrinks: Drink[] = [
  {
    id: "1",
    name: "Château Margaux 2018",
    type: "Red Wine",
    typeKey: "drinks.redWine",
    description: "Your dish has deep, rich flavors. This elegant wine will gracefully carry those notes into a lingering finish.",
    descriptionKey: "drinks.desc1",
    tastingNotes: ["Blackcurrant", "Violet", "Cedar"],
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=500&fit=crop",
    price: "$89",
  },
  {
    id: "2",
    name: "Dom Pérignon 2013",
    type: "Champagne",
    typeKey: "drinks.champagne",
    description: "The subtle textures in your meal call for something that dances — light bubbles to lift every bite.",
    descriptionKey: "drinks.desc2",
    tastingNotes: ["Citrus", "Brioche", "Mineral"],
    image: "https://images.unsplash.com/photo-1594372365401-3b5ff14eaaed?w=400&h=500&fit=crop",
    price: "$245",
  },
  {
    id: "3",
    name: "Hibiki Harmony",
    type: "Japanese Whisky",
    typeKey: "drinks.whisky",
    description: "When flavors are this refined, a gentle whisky adds warmth without overwhelming the palate.",
    descriptionKey: "drinks.desc3",
    tastingNotes: ["Honey", "Orange Peel", "White Chocolate"],
    image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=500&fit=crop",
    price: "$75",
  },
]

export function RecommendationScreen({
  imageUrl,
  onSelect,
  onBack,
  onRefresh,
}: RecommendationScreenProps) {
  const { language, t } = useI18n()
  const isKorean = language === "ko"
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const currentDrink = sampleDrinks[currentIndex]

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prev) => {
      const next = prev + newDirection
      if (next < 0) return sampleDrinks.length - 1
      if (next >= sampleDrinks.length) return 0
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
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          className="text-gold hover:bg-gold/10"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>

      {/* Food Image */}
      <div className="px-6 mb-4">
        <div className="relative h-32 rounded-xl overflow-hidden">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt="Your dish"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
      </div>

      {/* Fairy Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 mb-6 flex items-start gap-3"
      >
        <img
          src="/images/paire-fairy.png"
          alt="PAIRÉ Fairy"
          className="w-12 h-12 rounded-full object-cover border-2 border-gold/30"
        />
        <div className="flex-1 bg-card rounded-2xl rounded-tl-none p-4 border border-border">
          <p className={cn(
            "text-foreground text-sm leading-relaxed",
            isKorean && "font-[var(--font-noto-kr)] text-xs leading-relaxed"
          )}>
            {t(currentDrink.descriptionKey)}
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
                {t(currentDrink.typeKey)}
              </p>
              <h2 className="text-foreground text-2xl font-semibold mb-3">
                {currentDrink.name}
              </h2>

              {/* Tasting Notes */}
              <div className="flex flex-wrap gap-2 mb-4">
                {currentDrink.tastingNotes.map((note) => (
                  <span
                    key={note}
                    className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium"
                  >
                    {note}
                  </span>
                ))}
              </div>

              <p className="text-gold text-2xl font-bold">{currentDrink.price}</p>
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
        {sampleDrinks.map((_, i) => (
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
    </div>
  )
}
