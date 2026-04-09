"use client"

import { forwardRef } from "react"

interface RecommendationShareCardProps {
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

const GOLD = "#d4af37"
const GOLD_DIM = "rgba(212,175,55,0.22)"
const BG = "#0c0b08"
const W = 390

export const RecommendationShareCard = forwardRef<HTMLDivElement, RecommendationShareCardProps>(
  ({ detail, isKorean, occasionLabel }, ref) => {
    const drinks = (detail.drinks || []).slice(0, 3)
    const foods = (detail.detectedFoods || []).slice(0, 2)
    const maxFairyLen = isKorean ? 55 : 75
    const fairy = detail.fairyMessage
      ? detail.fairyMessage.slice(0, maxFairyLen) + (detail.fairyMessage.length > maxFairyLen ? "…" : "")
      : ""

    const getDrinkName = (d: typeof drinks[0]) =>
      isKorean ? (d.name || d.nameEn || "") : (d.nameEn || d.name || "")

    const noOverflow: React.CSSProperties = {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }

    const dateStr = new Date(detail.createdAt).toLocaleDateString(
      isKorean ? "ko-KR" : "en-US",
      { month: "short", day: "numeric" }
    )

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
        {/* 헤더 이미지 */}
        <div style={{ width: W, height: 200, position: "relative", overflow: "hidden", background: "#111", display: "block" }}>
          {detail.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={detail.imageUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5) saturate(0.85)" }} />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #1a1200 0%, #0c0b08 100%)" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, rgba(12,11,8,0.15) 0%, rgba(12,11,8,0) 30%, rgba(12,11,8,0.65) 75%, ${BG} 100%)` }} />

          {/* 브랜드 */}
          <div style={{ position: "absolute", top: 16, left: 18, display: "flex", alignItems: "center", gap: 6, border: "none", outline: "none" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, flexShrink: 0 }} />
            <span style={{ color: GOLD, fontSize: 13, fontWeight: 700, letterSpacing: 3, lineHeight: 1 }}>PAIRÉ</span>
          </div>

          {/* 날짜 - 한 줄 고정 */}
          <div style={{ position: "absolute", top: 16, right: 18 }}>
            <span style={{ color: "rgba(212,175,55,0.65)", fontSize: 10, whiteSpace: "nowrap" }}>{dateStr}</span>
          </div>

          {/* 하단 */}
          <div style={{ position: "absolute", bottom: 0, left: 0, width: W, padding: "0 18px 14px", boxSizing: "border-box" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: "rgba(212,175,55,0.15)", color: GOLD, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 7 }}>
              <span>✦</span>
              <span style={{ ...noOverflow, maxWidth: 200 }}>{occasionLabel}</span>
            </div>
            {foods.length > 0 && (
              <div style={{ display: "flex", gap: 5 }}>
                {foods.map((f, i) => (
                  <span key={i} style={{ padding: "2px 8px", borderRadius: 999, background: "rgba(255,255,255,0.08)", color: "rgba(245,240,232,0.75)", fontSize: 10, ...noOverflow, maxWidth: 100 }}>{f}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 페어리 메시지 */}
        {fairy && (
          <div style={{ width: W, background: BG, padding: "14px 18px 0", boxSizing: "border-box" }}>
            <div style={{ padding: "10px 12px", background: "rgba(212,175,55,0.06)", borderRadius: 10 }}>
              <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                <span style={{ fontSize: 13, flexShrink: 0 }}>🧚</span>
                <p style={{ color: "#c8bfa8", fontSize: isKorean ? 11 : 12, lineHeight: 1.6, margin: 0, overflow: "hidden", maxHeight: 40 }}>{fairy}</p>
              </div>
            </div>
          </div>
        )}

        {/* 추천 음료 */}
        <div style={{ width: W, background: BG, padding: "14px 18px 0", boxSizing: "border-box" }}>
          {/* 섹션 타이틀 */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, height: 1, background: GOLD_DIM }} />
            <span style={{ color: GOLD, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>
              {isKorean ? "추천 음료" : "Recommended"}
            </span>
            <div style={{ flex: 1, height: 1, background: GOLD_DIM }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {drinks.map((drink, i) => (
              <div key={drink.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 8, width: "100%", boxSizing: "border-box" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(212,175,55,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: GOLD, fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
                </div>
                {drink.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={drink.image} alt="" style={{ width: 40, height: 40, borderRadius: 7, objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: 7, background: "rgba(212,175,55,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>🍷</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#f5f0e8", fontSize: isKorean ? 13 : 14, fontWeight: 600, lineHeight: 1.2, ...noOverflow }}>{getDrinkName(drink)}</div>
                  <div style={{ color: "rgba(212,175,55,0.55)", fontSize: 10, marginTop: 2, ...noOverflow }}>{drink.type}</div>
                </div>
                {(drink.tastingNotes || [])[0] && (
                  <span style={{ padding: "2px 8px", borderRadius: 999, background: "rgba(212,175,55,0.10)", color: GOLD, fontSize: 9, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {drink.tastingNotes[0]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 푸터 */}
        <div style={{ width: W, background: BG, padding: "12px 18px 16px", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD, opacity: 0.45, flexShrink: 0 }} />
            <span style={{ color: "#4a4030", fontSize: 10, ...noOverflow, maxWidth: 200 }}>{isKorean ? "나만의 음료 페어링" : "Your Personal Drink Pairing"}</span>
          </div>
          <span style={{ color: "#3a3020", fontSize: 10, flexShrink: 0 }}>paire.app</span>
        </div>
      </div>
    )
  }
)

RecommendationShareCard.displayName = "RecommendationShareCard"
