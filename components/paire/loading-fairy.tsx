"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LoadingFairyProps {
  isKorean?: boolean
  title?: string
  subtitle?: string
  className?: string
  showLogo?: boolean
}

export function LoadingFairy({ 
  isKorean = false, 
  title,
  subtitle,
  className,
  showLogo = true
}: LoadingFairyProps) {
  // 랜덤 fairy 이미지 선택
  const fairyImage = useMemo(() => {
    const fairyImages = [
      "/images/pairy1.png",
      "/images/pairy2.png",
      "/images/pairy3.png",
      "/images/pairy4.png",
      "/images/pairy5.png",
    ]
    return fairyImages[Math.floor(Math.random() * fairyImages.length)]
  }, [])

  const defaultTitle = isKorean ? '추천을 생성하는 중입니다...' : 'Creating recommendations...'
  const defaultSubtitle = isKorean ? '잠시만 기다려주세요.' : 'Please wait a moment.'

  return (
    <div className={cn("min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4", className)}>
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10"
      >
        {/* 로고 */}
        {showLogo && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-light text-foreground tracking-widest mb-2">PAIRÉ</h1>
            <div className="h-px w-24 bg-gold/30 mx-auto" />
          </motion.div>
        )}

        {/* Fairy 이미지 - 검은색 배경 추가 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-6"
        >
          <div className="bg-black rounded-full p-4 inline-block shadow-xl">
            <img
              src={fairyImage}
              alt="PAIRÉ Fairy"
              className="w-24 h-24 rounded-full object-cover border-2 border-gold/30"
            />
          </div>
        </motion.div>

        {/* 로딩 메시지 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className={cn(
            "text-foreground text-xl mb-2",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {title || defaultTitle}
          </p>
          <p className={cn(
            "text-muted-foreground",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {subtitle || defaultSubtitle}
          </p>
        </motion.div>

        {/* 로딩 애니메이션 */}
        <motion.div
          className="flex justify-center gap-2 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-gold"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
