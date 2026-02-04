"use client"

import { motion } from "framer-motion"
import { useI18n, type Language } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

interface LanguageToggleProps {
  className?: string
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { language, setLanguage } = useI18n()

  const options: { value: Language; label: string }[] = [
    { value: "en", label: "EN" },
    { value: "ko", label: "KO" },
  ]

  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 rounded-full bg-card/50 backdrop-blur-sm border border-gold/20",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setLanguage(option.value)}
          className={cn(
            "relative px-3 py-1.5 text-xs font-medium tracking-wider transition-colors duration-300",
            language === option.value
              ? "text-background"
              : "text-gold/60 hover:text-gold"
          )}
        >
          {language === option.value && (
            <motion.div
              layoutId="language-indicator"
              className="absolute inset-0 bg-gold rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span className="relative z-10">{option.label}</span>
        </button>
      ))}
    </div>
  )
}
