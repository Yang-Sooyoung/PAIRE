"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface ShareCardProps {
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
  className?: string
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ drink, foodImageUrl, isKorean, isKoreaRegion, className }, ref) => {
    const displayName = isKorean ? (drink.name || drink.nameEn) : (drink.nameEn || drink.name)

    // 지역 기반 가격 포맷
    const formatPrice = (price: string) => {
      if (!price) return ''
      // 이미 통화 기호가 있으면 그대로
      if (price.startsWith('₩') || price.startsWith('$') || price.startsWith('€')) return price
      // 숫자만 있으면 지역에 따라 포맷
      const num = parseFloat(price.replace(/[^0-9.]/g, ''))
      if (isNaN(num)) return price
      if (isKoreaRegion === false) return `$${num.toFixed(2)}`
      if (isKoreaRegion === true) return `₩${Math.round(num).toLocaleString()}`
      return price
    }

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        style={{
          width: 400,
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1400 50%, #0a0a0a 100%)",
          fontFamily: isKorean
            ? "'Noto Sans KR', sans-serif"
            : "'Playfair Display', 'Georgia', serif",
        }}
      >
        {/* 배경 장식 */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse at 20% 20%, rgba(212,175,55,0.08) 0%, transparent 60%)",
        }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse at 80% 80%, rgba(212,175,55,0.05) 0%, transparent 60%)",
        }} />

        {/* 음식 이미지 (있을 때) */}
        {foodImageUrl && (
          <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={foodImageUrl}
              alt="food"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              crossOrigin="anonymous"
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, transparent 30%, #0a0a0a 100%)",
            }} />
          </div>
        )}

        {/* 음료 이미지 */}
        <div style={{
          position: "relative",
          height: foodImageUrl ? 140 : 200,
          overflow: "hidden",
          marginTop: foodImageUrl ? -40 : 0,
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={drink.image || "/placeholder.svg"}
            alt={displayName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            crossOrigin="anonymous"
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 20%, #0a0a0a 100%)",
          }} />
        </div>

        {/* 콘텐츠 */}
        <div style={{ padding: "20px 24px 24px" }}>
          {/* 음료 타입 */}
          <div style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: 999,
            border: "1px solid rgba(212,175,55,0.4)",
            background: "rgba(212,175,55,0.1)",
            color: "#d4af37",
            fontSize: 11,
            letterSpacing: 1,
            marginBottom: 10,
            textTransform: "uppercase",
          }}>
            {drink.type}
          </div>

          {/* 음료 이름 */}
          <div style={{
            fontSize: isKorean ? 22 : 24,
            fontWeight: 700,
            color: "#f5f0e8",
            marginBottom: 6,
            lineHeight: 1.2,
          }}>
            {displayName}
          </div>

          {/* 가격 */}
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#d4af37",
            marginBottom: 14,
          }}>
            {formatPrice(drink.price)}
          </div>

          {/* AI 추천 이유 */}
          {drink.aiReason && (
            <div style={{
              background: "rgba(212,175,55,0.07)",
              border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 14,
            }}>
              <div style={{ color: "#d4af37", fontSize: 11, marginBottom: 5, letterSpacing: 0.5 }}>
                ✨ {isKorean ? "페어리의 추천 이유" : "Why PAIRÉ recommends this"}
              </div>
              <div style={{
                color: "#c8bfa8",
                fontSize: isKorean ? 11 : 12,
                lineHeight: 1.6,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              } as React.CSSProperties}>
                {drink.aiReason}
              </div>
            </div>
          )}

          {/* 테이스팅 노트 */}
          {drink.tastingNotes.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
              {drink.tastingNotes.slice(0, 4).map((note) => (
                <span key={note} style={{
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "rgba(212,175,55,0.12)",
                  color: "#d4af37",
                  fontSize: 11,
                  border: "1px solid rgba(212,175,55,0.25)",
                }}>
                  {note}
                </span>
              ))}
            </div>
          )}

          {/* 구분선 */}
          <div style={{
            height: 1,
            background: "linear-gradient(to right, transparent, rgba(212,175,55,0.3), transparent)",
            marginBottom: 14,
          }} />

          {/* 브랜드 */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ color: "#d4af37", fontSize: 16, fontWeight: 700, letterSpacing: 2 }}>
              PAIRÉ
            </div>
            <div style={{ color: "#6b6050", fontSize: 10 }}>
              {isKorean ? "나만의 음료 페어링" : "Your Personal Drink Pairing"}
            </div>
          </div>
        </div>
      </div>
    )
  }
)

ShareCard.displayName = "ShareCard"
