"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

interface MenuInputScreenProps {
  onSubmit: (menu: string) => void
  onBack: () => void
}

export function MenuInputScreen({ onSubmit, onBack }: MenuInputScreenProps) {
  const { language, t } = useI18n()
  const isKorean = language === "ko"
  const [menuText, setMenuText] = useState("")

  const suggestions = [
    { key: "steak", label: t("menuInput.items.steak") },
    { key: "pasta", label: t("menuInput.items.pasta") },
    { key: "sushi", label: t("menuInput.items.sushi") },
    { key: "kbbq", label: t("menuInput.items.kbbq") },
    { key: "thai", label: t("menuInput.items.thai") },
    { key: "soup", label: t("menuInput.items.soup") },
  ]

  const handleSubmit = () => {
    if (menuText.trim()) {
      onSubmit(menuText.trim())
    }
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
          {t("menuInput.title")}
        </h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 pb-32">
        {/* Fairy Illustration */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <img
            src="/images/paire-fairy.png"
            alt="PAIRÉ Fairy"
            className="w-24 h-auto opacity-80"
          />
        </motion.div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <label className={cn(
            "block text-gold-light text-lg font-medium mb-3",
            isKorean && "font-[var(--font-noto-kr)] text-base"
          )}>
            {t("menuInput.label")}
          </label>
          <textarea
            value={menuText}
            onChange={(e) => setMenuText(e.target.value)}
            placeholder={t("menuInput.placeholder")}
            className={cn(
              "w-full h-32 p-4 rounded-xl bg-card border-2 border-border text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none resize-none transition-colors",
              isKorean && "font-[var(--font-noto-kr)] text-sm placeholder:text-sm"
            )}
          />
        </motion.div>

        {/* Quick Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className={cn(
            "text-muted-foreground text-sm mb-3",
            isKorean && "font-[var(--font-noto-kr)] text-xs"
          )}>
            {t("menuInput.suggestions")}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.key}
                onClick={() => setMenuText(suggestion.label)}
                className={cn(
                  "px-4 py-2 rounded-full bg-card border border-border text-foreground text-sm hover:border-gold/50 hover:bg-gold/5 transition-colors",
                  isKorean && "font-[var(--font-noto-kr)] text-xs"
                )}
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
        <Button
          onClick={handleSubmit}
          disabled={!menuText.trim()}
          className={cn(
            "w-full h-14 bg-gold hover:bg-gold-light text-background font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed",
            isKorean && "font-[var(--font-noto-kr)] text-base"
          )}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {t("menuInput.submit")}
        </Button>
      </div>
    </div>
  )
}
