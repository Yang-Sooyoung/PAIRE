"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Heart, Users, Tent, Home, User, Wine, Leaf, Droplets, Sparkles, Coffee, GlassWater, Martini, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import { LoadingFairy } from "./loading-fairy"

interface PreferenceScreenProps {
  onSubmit: (preferences: { occasion: string; tastes: string[]; priceRange?: string }) => void
  onBack: () => void
  isLoading?: boolean
}

const occasionIcons = {
  date: Heart,
  solo: User,
  gathering: Users,
  camping: Tent,
  home: Home,
}

const tasteIcons = {
  alcoholic: Wine,
  nonAlcoholic: Leaf,
  sweet: Sparkles,
  dry: Droplets,
  light: GlassWater,
  bold: Martini,
  coffee: Coffee,
}

export function PreferenceScreen({ onSubmit, onBack, isLoading }: PreferenceScreenProps) {
  const { language, t } = useI18n()
  const isKorean = language === "ko"
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null)
  const [selectedTastes, setSelectedTastes] = useState<string[]>([])
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null)

  const occasions = [
    { id: "date", label: t("preference.occasions.date"), icon: occasionIcons.date },
    { id: "solo", label: t("preference.occasions.solo"), icon: occasionIcons.solo },
    { id: "gathering", label: t("preference.occasions.gathering"), icon: occasionIcons.gathering },
    { id: "camping", label: t("preference.occasions.camping"), icon: occasionIcons.camping },
    { id: "home", label: t("preference.occasions.home"), icon: occasionIcons.home },
  ]

  const tastes = [
    { id: "alcoholic", label: t("preference.tastes.alcoholic"), icon: tasteIcons.alcoholic },
    { id: "non-alcoholic", label: t("preference.tastes.nonAlcoholic"), icon: tasteIcons.nonAlcoholic },
    { id: "sweet", label: t("preference.tastes.sweet"), icon: tasteIcons.sweet },
    { id: "dry", label: t("preference.tastes.dry"), icon: tasteIcons.dry },
    { id: "light", label: t("preference.tastes.light"), icon: tasteIcons.light },
    { id: "bold", label: t("preference.tastes.bold"), icon: tasteIcons.bold },
    { id: "coffee", label: t("preference.tastes.coffee"), icon: tasteIcons.coffee },
  ]

  const priceRanges = [
    { id: "budget", label: isKorean ? "₩10,000 이하" : "Under ₩10,000", range: [0, 10000] },
    { id: "moderate", label: isKorean ? "₩10,000 - ₩30,000" : "₩10,000 - ₩30,000", range: [10000, 30000] },
    { id: "premium", label: isKorean ? "₩30,000 - ₩50,000" : "₩30,000 - ₩50,000", range: [30000, 50000] },
    { id: "luxury", label: isKorean ? "₩50,000 이상" : "Over ₩50,000", range: [50000, 999999] },
  ]

  const toggleTaste = (tasteId: string) => {
    setSelectedTastes((prev) =>
      prev.includes(tasteId)
        ? prev.filter((t) => t !== tasteId)
        : [...prev, tasteId]
    )
  }

  const handleSubmit = () => {
    if (selectedOccasion) {
      onSubmit({ 
        occasion: selectedOccasion, 
        tastes: selectedTastes,
        priceRange: selectedPriceRange || undefined
      })
    }
  }

  // 로딩 중일 때 LoadingFairy 표시
  if (isLoading) {
    return <LoadingFairy isKorean={isKorean} />
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
          {t("preference.title")}
        </h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {/* Occasion Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className={cn(
            "text-gold-light text-xl font-medium mb-4",
            isKorean && "font-[var(--font-noto-kr)] text-lg"
          )}>
            {t("preference.occasionTitle")}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {occasions.map((occasion) => {
              const Icon = occasion.icon
              const isSelected = selectedOccasion === occasion.id
              return (
                <motion.button
                  key={occasion.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedOccasion(occasion.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300",
                    isSelected
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border bg-card text-muted-foreground hover:border-gold/50"
                  )}
                >
                  <Icon className={cn("w-6 h-6 mb-2", isSelected ? "text-gold" : "text-gold-dim")} />
                  <span className={cn(
                    "text-sm font-medium",
                    isKorean && "font-[var(--font-noto-kr)] text-xs"
                  )}>
                    {occasion.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Taste Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className={cn(
            "text-gold-light text-xl font-medium mb-4",
            isKorean && "font-[var(--font-noto-kr)] text-lg"
          )}>
            {t("preference.tasteTitle")}
          </h2>
          <div className="flex flex-wrap gap-3">
            {tastes.map((taste) => {
              const Icon = taste.icon
              const isSelected = selectedTastes.includes(taste.id)
              return (
                <motion.button
                  key={taste.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleTaste(taste.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-full border-2 transition-all duration-300",
                    isSelected
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border bg-card text-muted-foreground hover:border-gold/50"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isSelected ? "text-gold" : "text-gold-dim")} />
                  <span className={cn(
                    "text-sm font-medium",
                    isKorean && "font-[var(--font-noto-kr)] text-xs"
                  )}>
                    {taste.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Price Range */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className={cn(
            "text-gold-light text-xl font-medium mb-4",
            isKorean && "font-[var(--font-noto-kr)] text-lg"
          )}>
            {isKorean ? "가격 범위" : "Price Range"}
            <span className="text-muted-foreground text-sm ml-2">
              {isKorean ? "(선택사항)" : "(Optional)"}
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {priceRanges.map((price) => {
              const isSelected = selectedPriceRange === price.id
              return (
                <motion.button
                  key={price.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPriceRange(isSelected ? null : price.id)}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-300",
                    isSelected
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border bg-card text-muted-foreground hover:border-gold/50"
                  )}
                >
                  <DollarSign className={cn("w-4 h-4", isSelected ? "text-gold" : "text-gold-dim")} />
                  <span className={cn(
                    "text-sm font-medium",
                    isKorean && "font-[var(--font-noto-kr)] text-xs"
                  )}>
                    {price.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
        <Button
          onClick={handleSubmit}
          disabled={!selectedOccasion || isLoading}
          className={cn(
            "w-full h-14 bg-gold hover:bg-gold-light text-background font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed",
            isKorean && "font-[var(--font-noto-kr)] text-base"
          )}
        >
          {isLoading ? t("preference.loading") || "추천 생성 중..." : t("preference.submit")}
        </Button>
      </div>
    </div>
  )
}
