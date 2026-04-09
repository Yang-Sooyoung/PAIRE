// lib/share-image.ts
// html2canvas로 공유 카드 이미지 생성 + 공유/다운로드

export async function captureCardAsBlob(element: HTMLElement): Promise<Blob | null> {
  try {
    const html2canvas = (await import("html2canvas")).default
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2, // 고해상도
      useCORS: true,
      allowTaint: false,
      logging: false,
    })
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png", 1.0)
    })
  } catch (err) {
    console.error("captureCardAsBlob error:", err)
    return null
  }
}

export async function downloadCardImage(element: HTMLElement, filename = "paire-recommendation.png") {
  const blob = await captureCardAsBlob(element)
  if (!blob) return false
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  return true
}

export async function shareCardImage(
  element: HTMLElement,
  text: string,
  fallbackCopy: string
): Promise<"shared" | "downloaded" | "copied" | "failed"> {
  const blob = await captureCardAsBlob(element)

  if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], "paire.png", { type: "image/png" })] })) {
    try {
      await navigator.share({
        files: [new File([blob], "paire.png", { type: "image/png" })],
        text,
      })
      return "shared"
    } catch (e) {
      if ((e as Error).name === "AbortError") return "failed"
    }
  }

  // 이미지 공유 불가 → 다운로드
  if (blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "paire-recommendation.png"
    a.click()
    URL.revokeObjectURL(url)
    return "downloaded"
  }

  // 최후 fallback → 텍스트 복사
  try {
    await navigator.clipboard.writeText(fallbackCopy)
    return "copied"
  } catch {
    return "failed"
  }
}
