"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

interface LoadingScreenProps {
  imageUrl: string
  onComplete: () => void
}

export function LoadingScreen({ imageUrl, onComplete }: LoadingScreenProps) {
  const { language, t } = useI18n()
  const isKorean = language === "ko"
  const [messageIndex, setMessageIndex] = useState(0)

  const loadingMessages = [
    t("loading.message1"),
    t("loading.message2"),
    t("loading.message3"),
  ]

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev < loadingMessages.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 1500)

    const completeTimeout = setTimeout(() => {
      onComplete()
    }, 4500)

    return () => {
      clearInterval(messageInterval)
      clearTimeout(completeTimeout)
    }
  }, [onComplete, loadingMessages.length])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Blurred background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl scale-110"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />

      {/* Magical particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-gold rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              y: [0, -50],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Fairy silhouette animation */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative mb-8"
        >
          {/* Glow effect */}
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-gold/30 rounded-full blur-3xl w-48 h-48 -translate-x-1/4 -translate-y-1/4"
          />
          
          <img
            src="/images/pairy_main.png"
            alt="PAIRÉ Fairy"
            className="w-36 h-auto relative z-10 opacity-80"
          />
        </motion.div>

        {/* Loading messages */}
        <div className="h-16 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className={cn(
                "text-gold-light text-lg font-light tracking-wide",
                isKorean && "font-[var(--font-noto-kr)] text-base tracking-normal"
              )}
            >
              {loadingMessages[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-gold"
              animate={{
                opacity: messageIndex >= i ? 1 : 0.3,
                scale: messageIndex === i ? 1.2 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
