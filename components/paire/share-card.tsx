"use client"

import { forwardRef } from "react"

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
}

const GOLD = "#d4af37"
const GOLD_DIM = "rgba(212,175,55,0.22)"
const BG = "#0c0b08"
const W = 390

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ drink, foodImageUrl, isKorean, isKoreaRegion }, ref) => {
    const displayName = isKorean ? (drink.name || drink.nameEn || "") : (drink.nameEn || drink.name || "")
    const notes = (drink.tastingNotes || []).slice(0, 3)

    const formatPrice = (price: string) => {
      if (!price) return ""
      if (price.startsWith("\u20A9") || price.startsWith("$") || price.startsWith("\u20AC")) return price
      const num = parseFloat(price.replace(/[^0-9.]/g, ""))
      if (isNaN(num)) return price
      if (isKoreaRegion === false) return `$${num.toFixed(2)}`
      if (isKoreaRegion === true) return `\u20A9${Math.round(num).toLocaleString()}`
      return price
    }

    const noOverflow: React.CSSProperties = {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }

    return (
      <div
        ref={ref}
        style={{
          width: W,
          minWidth: W,
          maxWidth: W,
          background: BG,
          fontFamily: isKorean ? "'Noto Sans KR', sans-serif" : "Georgia, serif",
          display: "block",
        }}
      >
        {/* 이미지 영역 */}
        <div style={{ width: W, height: 240, position: "relative", overflow: "hidden", background: "#111", display: "block" }}>
          {foodImageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={foodImageUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.4)" }} />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={drink.image || ""} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: foodImageUrl ? 0.7 : 1 }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, rgba(12,11,8,0.1) 0%, rgba(12,11,8,0) 25%, rgba(12,11,8,0.6) 70%, ${BG} 100%)` }} />

          {/* 브랜드 - border 없음 */}
          <div style={{ position: "absolute", top: 16, left: 18, display: "flex", alignItems: "center", gap: 6, border: "none", outline: "none" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, flexShrink: 0 }} />
            <span style={{ color: GOLD, fontSize: 13, fontWeight: 700, letterSpacing: 3, lineHeight: 1 }}>PAIRÉ</span>
          </div>

          {/* 점수 */}
          {drink.aiScore && (
            <div style={{ position: "absolute", top: 12, right: 16, background: "rgba(12,11,8,0.8)", borderRadius: 999, padding: "3px 10px", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: GOLD, fontSize: 11 }}>★</span>
              <span style={{ color: GOLD, fontSize: 11, fontWeight: 600 }}>{drink.aiScore}</span>
            </div>
          )}

          {/* 하단 텍스트 */}
          <div style={{ position: "absolute", bottom: 0, left: 0, width: W, padding: "0 18px 16px", boxSizing: "border-box" }}>
            <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: "rgba(212,175,55,0.18)", color: GOLD, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7 }}>
              {drink.type}
            </div>
            <div style={{ color: "#f5f0e8", fontSize: isKorean ? 21 : 22, fontWeight: 700, lineHeight: 1.2, textShadow: "0 2px 10px rgba(0,0,0,0.9)", ...noOverflow, maxWidth: W - 36 }}>
              {displayName}
            </div>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div style={{ width: W, background: BG, padding: "16px 18px 20px", boxSizing: "border-box" }}>
          {/* 가격 + 노트 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 8 }}>
            <span style={{ color: GOLD, fontSize: 19, fontWeight: 700, flexShrink: 0 }}>{formatPrice(drink.price)}</span>
            <div style={{ display: "flex", gap: 5, overflow: "hidden" }}>
              {notes.slice(0, 2).map((note) => (
                <span key={note} style={{ padding: "3px 9px", borderRadius: 999, background: "rgba(212,175,55,0.10)", color: GOLD, fontSize: 10, ...noOverflow, maxWidth: 80 }}>
                  {note}
                </span>
              ))}
            </div>
          </div>

          {/* AI 추천 이유 */}
          {drink.aiReason && (
            <div style={{ background: "rgba(212,175,55,0.06)", borderRadius: 10, padding: "10px 12px", marginBottom: 14 }}>
              <div style={{ color: GOLD, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>
                <span>✦</span><span>{isKorean ? "페어리의 추천" : "Fairy's Pick"}</span>
              </div>
              <div style={{ color: "#c8bfa8", fontSize: isKorean ? 11 : 12, lineHeight: 1.6, overflow: "hidden", maxHeight: 52 }}>
                {drink.aiReason.slice(0, isKorean ? 70 : 100)}{drink.aiReason.length > (isKorean ? 70 : 100) ? "…" : ""}
              </div>
            </div>
          )}

          {/* 구분선 */}
          <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${GOLD_DIM}, transparent)`, marginBottom: 12 }} />

          {/* 푸터 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#6b6050", fontSize: 10, ...noOverflow, maxWidth: 200 }}>{isKorean ? "나만의 음료 페어링" : "Your Personal Drink Pairing"}</span>
            <span style={{ color: "#3a3020", fontSize: 10, flexShrink: 0 }}>paire.app</span>
          </div>
        </div>
      </div>
    )
  }
)

ShareCard.displayName = "ShareCard"
