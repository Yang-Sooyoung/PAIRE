"use client"

import React from "react"

import { useRef, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Camera, X, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

interface CaptureScreenProps {
  onCapture: (imageUrl: string) => void
  onBack: () => void
}

export function CaptureScreen({ onCapture, onBack }: CaptureScreenProps) {
  const { language, t } = useI18n()
  const isKorean = language === "ko"
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setPreview(result)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleConfirm = () => {
    if (preview) {
      onCapture(preview)
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
          <X className="w-6 h-6" />
        </Button>
        <h1 className={cn(
          "text-gold font-semibold text-lg tracking-wide",
          isKorean && "font-[var(--font-noto-kr)] text-base tracking-normal"
        )}>
          {t("capture.title")}
        </h1>
        <div className="w-10" />
      </div>

      {/* Camera/Preview Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-gold/30 bg-secondary/50"
        >
          {preview ? (
            <img
              src={preview || "/placeholder.svg"}
              alt="Food preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                <Camera className="w-10 h-10 text-gold" />
              </div>
              <p className={cn(
                "text-gold-light/70 text-lg mb-2",
                isKorean && "font-[var(--font-noto-kr)] text-base"
              )}>
                {t("capture.placeholder")}
              </p>
              <p className={cn(
                "text-muted-foreground text-sm",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {t("capture.hint")}
              </p>
            </div>
          )}

          {/* Corner guides */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-gold/50 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-gold/50 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-gold/50 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-gold/50 rounded-br-lg" />
        </motion.div>

        <p className={cn(
          "text-muted-foreground text-center mt-6 mb-8 max-w-xs",
          isKorean && "font-[var(--font-noto-kr)] text-sm"
        )}>
          {t("capture.hintLong")}
        </p>
      </div>

      {/* Bottom Actions */}
      <div className="p-6 pb-10">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {preview ? (
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setPreview(null)}
              className={cn(
                "flex-1 h-14 border-gold/40 text-gold hover:bg-gold/10",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              {t("capture.retake")}
            </Button>
            <Button
              onClick={handleConfirm}
              className={cn(
                "flex-1 h-14 bg-gold hover:bg-gold-light text-background font-semibold",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              {t("capture.usePhoto")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-full h-14 bg-gold hover:bg-gold-light text-background font-semibold text-lg",
                isKorean && "font-[var(--font-noto-kr)] text-base"
              )}
            >
              <ImagePlus className="w-5 h-5 mr-3" />
              {t("capture.selectPhoto")}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
