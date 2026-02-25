"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Camera, BookOpen, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"
import { LanguageToggle } from "./language-toggle"
import { cn } from "@/lib/utils"

interface HomeScreenProps {
  onCaptureFood: () => void
  onMenuInput: () => void
  user?: any
  onLoginClick?: () => void
  onSignupClick?: () => void
}

export function HomeScreen({ 
  onCaptureFood, 
  onMenuInput,
  user,
  onLoginClick,
  onSignupClick
}: HomeScreenProps) {
  const { language, t } = useI18n()
  const isKorean = language === "ko"
  const [credits, setCredits] = useState(0)

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) return

      try {
        const token = localStorage.getItem('accessToken')
        if (!token) return

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
        const response = await fetch(`${API_URL}/credit/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setCredits(data.credits || 0)
        }
      } catch (error) {
        console.error('Failed to fetch credits:', error)
      }
    }

    fetchCredits()
  }, [user])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Language Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageToggle />
      </div>

      {/* Credits Display - Top Center (로그인 사용자만) */}
      {user && credits > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full backdrop-blur-sm">
            <Coins className="w-4 h-4 text-gold" />
            <span className="text-gold font-semibold">{credits}</span>
            <span className={cn(
              "text-gold-dim text-sm",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '크레딧' : 'Credits'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Login/Signup buttons - Top Left (비로그인 사용자만) */}
      {!user && (
        <div className="absolute top-6 left-6 z-20 flex gap-2">
          <Button
              onClick={onLoginClick}
              variant="outline"
              className={cn(
                "border-gold/40 text-gold hover:bg-gold/10 hover:border-gold",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
          >
            {t("auth.login")}
          </Button>
          <Button
              onClick={onSignupClick}
              className={cn(
                "bg-gold hover:bg-gold-light text-background",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
          >
            {t("auth.signup")}
          </Button>
        </div>
      )}

      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      {/* Sparkle particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center text-center max-w-md"
      >
        {/* Fairy mascot image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-8"
        >
          <img
            src="/images/pairy_main.png"
            alt="PAIRÉ Fairy Sommelier"
            className="w-72 h-auto drop-shadow-2xl"
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className={cn(
            "text-lg text-gold-light/80 mb-12 font-light tracking-wide",
            isKorean && "font-[var(--font-noto-kr)] text-base tracking-normal"
          )}
        >
          {t("home.tagline")}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col gap-4 w-full max-w-xs"
        >
          <Button
            onClick={onCaptureFood}
            className={cn(
              "w-full h-14 bg-gold hover:bg-gold-light text-background font-semibold text-lg tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-gold/20",
              isKorean && "font-[var(--font-noto-kr)] text-base tracking-normal"
            )}
          >
            <Camera className="w-5 h-5 mr-3" />
            {t("home.captureBtn")}
          </Button>
          
          <Button
            onClick={onMenuInput}
            variant="outline"
            className={cn(
              "w-full h-14 border-gold/40 text-gold hover:bg-gold/10 hover:border-gold font-medium text-lg tracking-wide transition-all duration-300 bg-transparent",
              isKorean && "font-[var(--font-noto-kr)] text-base tracking-normal"
            )}
          >
            <BookOpen className="w-5 h-5 mr-3" />
            {t("home.menuBtn")}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
