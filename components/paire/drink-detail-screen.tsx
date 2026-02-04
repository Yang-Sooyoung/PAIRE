"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Wine, Droplet, Sparkles, ShoppingCart, Heart, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

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
  }
  onBack: () => void
  onAddToCart: () => void
}

export function DrinkDetailScreen({ drink, onBack, onAddToCart }: DrinkDetailScreenProps) {
  const { language, t } = useI18n()
  const isKorean = language === "ko"
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  const flavorProfile = {
    [t("detail.sweetness")]: 30,
    [t("detail.acidity")]: 65,
    [t("detail.body")]: 80,
    [t("detail.tannin")]: 70,
  }

  const handleAddToCart = () => {
    setAddedToCart(true)
    onAddToCart()
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
            onClick={() => setIsWishlisted(!isWishlisted)}
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
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center">
                <Wine className="w-6 h-6 text-gold" />
              </div>
              <span className={cn(
                "text-xs text-muted-foreground",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {t("detail.fineDining")}
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-gold" />
              </div>
              <span className={cn(
                "text-xs text-muted-foreground",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {t("detail.celebrations")}
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center">
                <Droplet className="w-6 h-6 text-gold" />
              </div>
              <span className={cn(
                "text-xs text-muted-foreground",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {t("detail.redMeat")}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
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
            {drink.descriptionKey ? t(drink.descriptionKey) : drink.description}
          </p>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="h-14 w-14 border-gold/40 text-gold hover:bg-gold/10 shrink-0"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? "fill-gold" : ""}`} />
          </Button>
          <Button
            onClick={handleAddToCart}
            disabled={addedToCart}
            className={cn(
              "flex-1 h-14 bg-gold hover:bg-gold-light text-background font-semibold text-lg disabled:opacity-100",
              isKorean && "font-[var(--font-noto-kr)] text-base"
            )}
          >
            {addedToCart ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                {t("detail.addedToCart")}
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                {t("detail.addToCart")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
