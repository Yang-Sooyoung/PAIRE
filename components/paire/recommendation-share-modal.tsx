"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, Share2, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RecommendationShareCard } from "./recommendation-share-card"
import { shareCardImage, downloadCardImage } from "@/lib/share-image"
import { cn } from "@/lib/utils"

interface RecommendationShareModalProps {
  isOpen: boolean
  onClose: () => void
  detail: {
    occasion: string
    tastes: string[]
    drinks: Array<{
      id: string
      name: string
      nameEn?: string
      type: string
      image: string
      price: string
      tastingNotes: string[]
    }>
    detectedFoods: string[]
    fairyMessage: string
    imageUrl?: string
    createdAt: string
  }
  isKorean: boolean
  occasionLabel: string
}

export function RecommendationShareModal({
  isOpen, onClose, detail, isKorean, occasionLabel
}: RecommendationShareModalProps) {
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
    const text = isKorean
      ? `PAIRÉ가 추천한 음료들을 확인해보세요! 🧚✨`
      : `Check out PAIRÉ's drink recommendations! 🧚✨`
    const result = await shareCardImage(cardRef.current, text, text)
    if (result === "shared") showToast(isKorean ? "공유 완료!" : "Shared!")
    else if (result === "clipboard") showToast(isKorean ? "클립보드에 복사됐어요!" : "Copied!")
    else if (result === "downloaded") showToast(isKorean ? "이미지 저장됨!" : "Saved!")
    else showToast(isKorean ? "실패했습니다" : "Failed")
  }

  const handleDownload = async () => {
    if (!cardRef.current || status === "loading") return
    setStatus("loading")
    const ok = await downloadCardImage(cardRef.current, `paire-recommendation-${Date.now()}.png`)
    if (ok) showToast(isKorean ? "이미지 저장됨!" : "Image saved!")
    else showToast(isKorean ? "저장 실패" : "Save failed")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl p-5 max-h-[92vh] flex flex-col"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className={cn("text-lg font-semibold text-foreground", isKorean && "font-[var(--font-noto-kr)]")}>
                {isKorean ? "추천 공유 카드" : "Share Recommendation"}
              </h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 카드 미리보기 */}
            <div className="flex-1 overflow-y-auto mb-4 -mx-5 px-5">
              <div className="flex justify-center py-2">
                <RecommendationShareCard
                  ref={cardRef}
                  detail={detail}
                  isKorean={isKorean}
                  occasionLabel={occasionLabel}
                />
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 flex-shrink-0">
              <Button
                onClick={handleDownload}
                disabled={status === "loading"}
                variant="outline"
                className={cn("flex-1 h-12 border-gold/40 text-gold hover:bg-gold/10", isKorean && "font-[var(--font-noto-kr)]")}
              >
                {status === "loading" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {isKorean ? "이미지 저장" : "Save Image"}
              </Button>
              <Button
                onClick={handleShare}
                disabled={status === "loading"}
                className={cn("flex-1 h-12 bg-gold hover:bg-gold-light text-background font-semibold", isKorean && "font-[var(--font-noto-kr)]")}
              >
                {status === "loading" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :
                  status === "done" ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                {status === "done" ? toastMsg : (isKorean ? "공유하기" : "Share")}
              </Button>
            </div>

            <p className={cn("text-xs text-center text-muted-foreground mt-2 flex-shrink-0", isKorean && "font-[var(--font-noto-kr)]")}>
              {isKorean ? "모바일: 앱으로 바로 공유 · 데스크탑: 이미지 클립보드 복사" : "Mobile: share to apps · Desktop: copy image to clipboard"}
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
