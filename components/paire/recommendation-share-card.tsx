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
const CARD_W = 420

export const RecommendationShareCard = forwardRef<HTMLDivElement, RecommendationShareCardProps>(
  ({ detail, isKorean, occasionLabel }, ref) => {
    const drinks = detail.drinks.slice(0, 3)
    const foods = detail.detectedFoods.slice(0, 3)
    const fairy = detail.fairyMessage
      ? detail.fairyMessage.slice(0, isKorean ? 60 : 80) + (detail.fairyMessage.length > (isKorean ? 60 : 80) ? "…" : "")
      : ""

    const getDrinkName = (d: typeof drinks[0]) =>
      isKorean ? (d.name || d.nameEn || "") : (d.nameEn || d.name || "")

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
        {/* 배경 글로우 */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: `radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,175,55,0.12) 0%, transparent 65%),
                       radial-gradient(ellipse 60% 40% at 80% 100%, rgba(212,175,55,0.07) 0%, transparent 70%)`,
        }} />

        {/* ── 헤더 이미지 영역 ── */}
        <div style={{ position: "relative", height: 220, zIndex: 1 }}>
          {detail.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={detail.imageUrl}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.55) saturate(0.9)" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1a1200 0%, #0c0b08 100%)" }} />
          )}
          {/* 그라디언트 */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(12,11,8,0.2) 0%, rgba(12,11,8,0.0) 35%, rgba(12,11,8,0.7) 75%, rgba(12,11,8,1) 100%)",
          }} />

          {/* 상단 브랜드 */}
          <div style={{ position: "absolute", top: 18, left: 22, display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
            <span style={{ color: GOLD, fontSize: 13, fontWeight: 700, letterSpacing: 3 }}>PAIRÉ</span>
          </div>

          {/* 날짜 */}
          <div style={{ position: "absolute", top: 18, right: 20 }}>
            <span style={{ color: "rgba(212,175,55,0.6)", fontSize: 10 }}>
              {new Date(detail.createdAt).toLocaleDateString(isKorean ? "ko-KR" : "en-US", { month: "short", day: "numeric" })}
            </span>
          </div>

          {/* 하단 오버레이 텍스트 */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 22px 18px" }}>
            {/* 상황 뱃지 */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 10px", borderRadius: 999,
              background: "rgba(212,175,55,0.15)", border: `1px solid ${GOLD_DIM}`,
              color: GOLD, fontSize: 10, letterSpacing: 1.2,
              textTransform: "uppercase", marginBottom: 8,
            }}>
              <span>✦</span>
              <span>{occasionLabel}</span>
            </div>

            {/* 음식 태그 */}
            {foods.length > 0 && (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {foods.map((f, i) => (
                  <span key={i} style={{
                    padding: "2px 8px", borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(245,240,232,0.75)", fontSize: 10,
                  }}>
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── 페어리 메시지 ── */}
        {fairy && (
          <div style={{
            margin: "16px 22px 0",
            padding: "12px 14px",
            background: "rgba(212,175,55,0.06)",
            border: `1px solid rgba(212,175,55,0.14)`,
            borderRadius: 12,
            position: "relative", zIndex: 1,
          }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>🧚</span>
              <p style={{
                color: "#c8bfa8", fontSize: isKorean ? 11 : 12,
                lineHeight: 1.65, margin: 0,
              }}>
                {fairy}
              </p>
            </div>
          </div>
        )}

        {/* ── 추천 음료 목록 ── */}
        <div style={{ padding: "16px 22px 0", position: "relative", zIndex: 1 }}>
          <div style={{
            color: GOLD, fontSize: 10, letterSpacing: 1.5,
            textTransform: "uppercase", marginBottom: 10,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <div style={{ flex: 1, height: 1, background: GOLD_DIM }} />
            <span>{isKorean ? "추천 음료" : "Recommended"}</span>
            <div style={{ flex: 1, height: 1, background: GOLD_DIM }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {drinks.map((drink, i) => (
              <div key={drink.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "8px 10px",
                background: "rgba(255,255,255,0.03)",
                border: `1px solid rgba(212,175,55,0.10)`,
                borderRadius: 10,
              }}>
                {/* 번호 */}
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: "rgba(212,175,55,0.12)",
                  border: `1px solid ${GOLD_DIM}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ color: GOLD, fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
                </div>
                {/* 음료 이미지 */}
                {drink.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={drink.image}
                    alt=""
                    style={{
                      width: 44, height: 44, borderRadius: 8,
                      objectFit: "cover", flexShrink: 0,
                      border: `1px solid rgba(212,175,55,0.15)`,
                    }}
                  />
                ) : (
                  <div style={{
                    width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                    background: "rgba(212,175,55,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18,
                  }}>🍷</div>
                )}
                {/* 음료 정보 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: "#f5f0e8", fontSize: isKorean ? 13 : 14,
                    fontWeight: 600, lineHeight: 1.2,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {getDrinkName(drink)}
                  </div>
                  <div style={{ color: "rgba(212,175,55,0.6)", fontSize: 10, marginTop: 2 }}>
                    {drink.type}
                  </div>
                </div>
                {/* 테이스팅 노트 1개 */}
                {drink.tastingNotes[0] && (
                  <span style={{
                    padding: "2px 8px", borderRadius: 999, flexShrink: 0,
                    background: "rgba(212,175,55,0.10)",
                    border: `1px solid ${GOLD_DIM}`,
                    color: GOLD, fontSize: 9,
                    whiteSpace: "nowrap",
                  }}>
                    {drink.tastingNotes[0]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── 푸터 ── */}
        <div style={{
          padding: "14px 22px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "relative", zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD, opacity: 0.5 }} />
            <span style={{ color: "#4a4030", fontSize: 10 }}>
              {isKorean ? "나만의 음료 페어링" : "Your Personal Drink Pairing"}
            </span>
          </div>
          <span style={{ color: "#3a3020", fontSize: 10 }}>paire.app</span>
        </div>
      </div>
    )
  }
)

RecommendationShareCard.displayName = "RecommendationShareCard"
