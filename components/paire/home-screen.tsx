"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Camera, BookOpen, Coins, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

interface HomeScreenProps {
  onCaptureFood: () => void
  onMenuInput: () => void
  user?: any
  onLoginClick?: () => void
  onSignupClick?: () => void
  hasHeader?: boolean
}

export function HomeScreen({ 
  onCaptureFood, 
  onMenuInput,
  user,
  onLoginClick,
  onSignupClick,
  hasHeader = false,
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

  const isPremium = user?.membership === 'PREMIUM'

  return (
    <div
      className="bg-background flex flex-col items-center relative overflow-y-auto overflow-x-hidden"
      style={{
        minHeight: '100dvh',
        paddingTop: hasHeader ? '16px' : '24px',
        paddingBottom: '24px',
        paddingLeft: '24px',
        paddingRight: '24px',
        justifyContent: 'center',
      }}
    >
      {/* 로그인 사용자 - 우상단 멤버십 + 크레딧 뱃지 (헤더가 없을 때만) */}
      {user && false && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-5 z-10 flex items-center gap-2"
          style={{ top: 'calc(env(safe-area-inset-top, 24px) + 12px)' }}
        >
          {isPremium ? (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-gold/15 border border-gold/40 rounded-full backdrop-blur-sm">
              <Crown className="w-3 h-3 text-gold" />
              <span className="text-gold text-xs font-semibold tracking-wide">PREMIUM</span>
            </div>
          ) : credits > 0 ? (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-gold/10 border border-gold/30 rounded-full backdrop-blur-sm">
              <Coins className="w-3 h-3 text-gold" />
              <span className="text-gold text-xs font-semibold">{credits}</span>
              <span className={cn("text-gold/60 text-xs", isKorean && "font-[var(--font-noto-kr)]")}>
                {isKorean ? '크레딧' : 'cr'}
              </span>
            </div>
          ) : null}
        </motion.div>
      )}

      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-gold/3 rounded-full blur-3xl" />
      </div>

      {/* Sparkle particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-gold rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center text-center w-full"
        style={{ maxWidth: '360px' }}
      >
        {/* Fairy mascot image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-3"
        >
          <img
            src="/images/pairy_main.png"
            alt="PAIRÉ Fairy Sommelier"
            className="drop-shadow-2xl"
            style={{ width: '200px', height: 'auto' }}
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className={cn(
            "text-gold-light/80 font-light tracking-wide mb-5",
            isKorean && "font-[var(--font-noto-kr)] tracking-normal"
          )}
          style={{ fontSize: '13px', lineHeight: '1.6' }}
        >
          {t("home.tagline")}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col gap-3 w-full"
        >
          <Button
            onClick={onCaptureFood}
            className={cn(
              "w-full bg-gold hover:bg-gold-light text-background font-semibold tracking-wide transition-all duration-300",
              isKorean && "font-[var(--font-noto-kr)] tracking-normal"
            )}
            style={{ height: '48px', fontSize: '15px' }}
          >
            <Camera className="w-4 h-4 mr-2 shrink-0" />
            {t("home.captureBtn")}
          </Button>

          <Button
            onClick={onMenuInput}
            variant="outline"
            className={cn(
              "w-full border-gold/40 text-gold hover:bg-gold/10 hover:border-gold font-medium tracking-wide transition-all duration-300 bg-transparent",
              isKorean && "font-[var(--font-noto-kr)] tracking-normal"
            )}
            style={{ height: '48px', fontSize: '15px' }}
          >
            <BookOpen className="w-4 h-4 mr-2 shrink-0" />
            {t("home.menuBtn")}
          </Button>

          {/* 비로그인 - 로그인/회원가입 */}
          {!user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex gap-2 pt-1"
            >
              <Button
                onClick={onLoginClick}
                variant="outline"
                className={cn(
                  "flex-1 border-gold/30 text-gold/80 hover:bg-gold/10 hover:border-gold hover:text-gold",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
                style={{ height: '44px', fontSize: '14px' }}
              >
                {t("auth.login")}
              </Button>
              <Button
                onClick={onSignupClick}
                className={cn(
                  "flex-1 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/40",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
                style={{ height: '44px', fontSize: '14px' }}
              >
                {t("auth.signup")}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
