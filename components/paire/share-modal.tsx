"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, Share2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShareCard } from "./share-card"
import { shareCardImage, downloadCardImage } from "@/lib/share-image"
import { cn } from "@/lib/utils"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  drink: {
    name: string
    nameEn?: string
    type: string
    description: string
    tastingNotes: string[]
    image: string | null
    price: string
    aiReason?: string
    aiScore?: number
  }
  foodImageUrl?: string
  isKorean: boolean
  isKoreaRegion?: boolean | null
}

export function ShareModal({ isOpen, onClose, drink, foodImageUrl, isKorean, isKoreaRegion }: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle")
  const [toastMsg, setToastMsg] = useState("")

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setStatus("done")
    setTimeout(() => setStatus("idle"), 2500)
  }

  const handleShare = async () => {
    if (!cardRef.current || status === "loading") return
    setStatus("loading")
    const fallback = isKorean
      ? `PAIRÉ 추천: ${drink.name}\n나만의 음료 페어링을 받아보세요! 🍷`
      : `PAIRÉ recommends: ${drink.nameEn || drink.name}\nGet your personalized pairing! 🍷`

    const result = await shareCardImage(cardRef.current, fallback, fallback)
    if (result === "shared") showToast(isKorean ? "공유 완료!" : "Shared!")
    else if (result === "clipboard") showToast(isKorean ? "이미지가 클립보드에 복사됐어요!" : "Image copied to clipboard!")
    else if (result === "downloaded") showToast(isKorean ? "이미지 저장됨!" : "Image saved!")
    else setStatus("idle")
  }

  const handleDownload = async () => {
    if (!cardRef.current || status === "loading") return
    setStatus("loading")
    const ok = await downloadCardImage(
      cardRef.current,
      `paire-${(drink.nameEn || drink.name).replace(/\s+/g, "-").toLowerCase()}.png`
    )
    if (ok) showToast(isKorean ? "이미지 저장됨!" : "Image saved!")
    else setStatus("idle")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-5">
              <h2 className={cn(
                "text-lg font-semibold text-foreground",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {isKorean ? "공유 카드" : "Share Card"}
              </h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 카드 미리보기 - 실제 크기로 숨겨서 캡처, 축소본은 미리보기용 */}
            <div className="flex justify-center mb-6 overflow-hidden">
              {/* 캡처용 원본 (화면 밖) */}
              <div
                style={{
                  position: "fixed",
                  left: -9999,
                  top: -9999,
                  zIndex: -1,
                  pointerEvents: "none",
                }}
              >
                <ShareCard
                  ref={cardRef}
                  drink={drink}
                  foodImageUrl={foodImageUrl}
                  isKorean={isKorean}
                  isKoreaRegion={isKoreaRegion}
                />
              </div>
              {/* 미리보기용 축소본 */}
              <div style={{ transform: "scale(0.82)", transformOrigin: "top center", height: 420 }}>
                <ShareCard
                  drink={drink}
                  foodImageUrl={foodImageUrl}
                  isKorean={isKorean}
                  isKoreaRegion={isKoreaRegion}
                />
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                disabled={status === "loading"}
                variant="outline"
                className={cn(
                  "flex-1 h-12 border-gold/40 text-gold hover:bg-gold/10",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
              >
                {status === "loading" ? (
                  <span className="animate-spin mr-2">⏳</span>
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {isKorean ? "이미지 저장" : "Save Image"}
              </Button>
              <Button
                onClick={handleShare}
                disabled={status === "loading"}
                className={cn(
                  "flex-1 h-12 bg-gold hover:bg-gold-light text-background font-semibold",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
              >
                {status === "done" ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Share2 className="w-4 h-4 mr-2" />
                )}
                {status === "done" ? toastMsg : (isKorean ? "공유하기" : "Share")}
              </Button>
            </div>

            <p className={cn(
              "text-xs text-center text-muted-foreground mt-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? "모바일: 앱으로 바로 공유 · 데스크탑: 이미지 클립보드 복사"
                : "Mobile: share to apps · Desktop: copy image to clipboard"}
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
