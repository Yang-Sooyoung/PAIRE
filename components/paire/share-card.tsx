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

const CARD_W = 420
const GOLD = "#d4af37"
const GOLD_DIM = "rgba(212,175,55,0.25)"
const BG = "#0c0b08"
const BG2 = "#1a1500"

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ drink, foodImageUrl, isKorean, isKoreaRegion }, ref) => {
    const displayName = isKorean ? (drink.name || drink.nameEn) : (drink.nameEn || drink.name)

    const formatPrice = (price: string) => {
      if (!price) return ""
      if (price.startsWith("\u20A9") || price.startsWith("$") || price.startsWith("\u20AC")) return price
      const num = parseFloat(price.replace(/[^0-9.]/g, ""))
      if (isNaN(num)) return price
      if (isKoreaRegion === false) return `$${num.toFixed(2)}`
      if (isKoreaRegion === true) return `\u20A9${Math.round(num).toLocaleString()}`
      return price
    }

    const notes = drink.tastingNotes.slice(0, 3)

    return (
      <div
        ref={ref}
        style={{
          width: CARD_W,
          background: BG,
          borderRadius: 20,
          overflow: "hidden",
          fontFamily: isKorean ? "'Noto Sans KR', sans-serif" : "Georgia, serif",
          boxShadow: "0 0 0 1px rgba(212,175,55,0.15)",
          position: "relative",
        }}
      >
        {/* ── 배경 글로우 ── */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: `radial-gradient(ellipse 70% 50% at 30% 10%, rgba(212,175,55,0.10) 0%, transparent 70%),
                       radial-gradient(ellipse 60% 40% at 80% 90%, rgba(212,175,55,0.06) 0%, transparent 70%)`,
        }} />

        {/* ── 이미지 영역 ── */}
        <div style={{ position: "relative", height: foodImageUrl ? 280 : 260, zIndex: 1 }}>
          {/* 음식 이미지 (배경) */}
          {foodImageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={foodImageUrl}
              alt=""
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%", objectFit: "cover",
                filter: "brightness(0.45) saturate(0.8)",
              }}
            />
          )}
          {/* 음료 이미지 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={drink.image || ""}
            alt={displayName || ""}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%", objectFit: "cover",
              opacity: foodImageUrl ? 0.75 : 1,
            }}
          />
          {/* 그라디언트 오버레이 */}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(to bottom,
              rgba(12,11,8,0.1) 0%,
              rgba(12,11,8,0.0) 30%,
              rgba(12,11,8,0.55) 70%,
              rgba(12,11,8,1) 100%)`,
          }} />

          {/* 상단 브랜드 */}
          <div style={{
            position: "absolute", top: 18, left: 22,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: GOLD, boxShadow: `0 0 8px ${GOLD}`,
            }} />
            <span style={{
              color: GOLD, fontSize: 13, fontWeight: 700,
              letterSpacing: 3, textTransform: "uppercase",
            }}>
              PAIRÉ
            </span>
          </div>

          {/* 점수 배지 */}
          {drink.aiScore && (
            <div style={{
              position: "absolute", top: 14, right: 18,
              background: "rgba(12,11,8,0.7)",
              border: `1px solid ${GOLD_DIM}`,
              borderRadius: 999,
              padding: "3px 10px",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <span style={{ color: GOLD, fontSize: 11 }}>★</span>
              <span style={{ color: GOLD, fontSize: 11, fontWeight: 600 }}>{drink.aiScore}</span>
            </div>
          )}

          {/* 이미지 하단 음료 이름 오버레이 */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "0 22px 18px",
          }}>
            {/* 타입 뱃지 */}
            <div style={{
              display: "inline-block",
              padding: "3px 10px",
              borderRadius: 999,
              background: "rgba(212,175,55,0.18)",
              border: `1px solid ${GOLD_DIM}`,
              color: GOLD,
              fontSize: 10,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 8,
            }}>
              {drink.type}
            </div>
            {/* 음료 이름 */}
            <div style={{
              color: "#f5f0e8",
              fontSize: isKorean ? 22 : 24,
              fontWeight: 700,
              lineHeight: 1.2,
              textShadow: "0 2px 12px rgba(0,0,0,0.8)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {displayName}
            </div>
          </div>
        </div>

        {/* ── 콘텐츠 영역 ── */}
        <div style={{ padding: "18px 22px 22px", position: "relative", zIndex: 1 }}>

          {/* 가격 + 테이스팅 노트 한 줄 */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}>
            <span style={{ color: GOLD, fontSize: 20, fontWeight: 700 }}>
              {formatPrice(drink.price)}
            </span>
            <div style={{ display: "flex", gap: 5 }}>
              {notes.map((note) => (
                <span key={note} style={{
                  padding: "3px 9px",
                  borderRadius: 999,
                  background: "rgba(212,175,55,0.10)",
                  border: `1px solid ${GOLD_DIM}`,
                  color: GOLD,
                  fontSize: 10,
                  whiteSpace: "nowrap",
                }}>
                  {note}
                </span>
              ))}
            </div>
          </div>

          {/* AI 추천 이유 */}
          {drink.aiReason && (
            <div style={{
              background: "rgba(212,175,55,0.06)",
              border: `1px solid rgba(212,175,55,0.15)`,
              borderRadius: 12,
              padding: "12px 14px",
              marginBottom: 18,
            }}>
              <div style={{
                color: GOLD, fontSize: 10, letterSpacing: 1,
                textTransform: "uppercase", marginBottom: 6,
                display: "flex", alignItems: "center", gap: 5,
              }}>
                <span>✦</span>
                <span>{isKorean ? "페어리의 추천" : "Fairy's Pick"}</span>
              </div>
              <div style={{
                color: "#c8bfa8",
                fontSize: isKorean ? 11 : 12,
                lineHeight: 1.65,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              } as React.CSSProperties}>
                {drink.aiReason}
              </div>
            </div>
          )}

          {/* 구분선 */}
          <div style={{
            height: 1,
            background: `linear-gradient(to right, transparent, ${GOLD_DIM}, transparent)`,
            marginBottom: 14,
          }} />

          {/* 하단 푸터 */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 4, height: 4, borderRadius: "50%",
                background: GOLD, opacity: 0.6,
              }} />
              <span style={{ color: "#6b6050", fontSize: 10, letterSpacing: 0.5 }}>
                {isKorean ? "나만의 음료 페어링" : "Your Personal Drink Pairing"}
              </span>
            </div>
            <span style={{ color: "#3a3020", fontSize: 10 }}>paire.app</span>
          </div>
        </div>
      </div>
    )
  }
)

ShareCard.displayName = "ShareCard"
