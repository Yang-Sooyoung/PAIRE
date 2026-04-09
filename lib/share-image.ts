// lib/share-image.ts
// html2canvas로 공유 카드 이미지 생성 + 공유/다운로드/클립보드 복사

export async function captureCardAsBlob(element: HTMLElement): Promise<Blob | null> {
  try {
    const html2canvas = (await import("html2canvas")).default
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
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

/**
 * 클립보드에 이미지 복사 (ClipboardItem API)
 * Chrome 76+, Safari 13.1+, Firefox 127+ 지원
 */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) return false
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ])
    return true
  } catch (err) {
    console.error("copyImageToClipboard error:", err)
    return false
  }
}

/**
 * 공유하기:
 * 1. 모바일 Web Share API (이미지 파일 공유) → 카카오, 인스타 등 앱으로 직접 공유
 * 2. 클립보드에 이미지 복사 (데스크탑 Chrome/Safari)
 * 3. 이미지 다운로드 (fallback)
 */
export async function shareCardImage(
  element: HTMLElement,
  text: string,
  fallbackCopy: string
): Promise<"shared" | "clipboard" | "downloaded" | "failed"> {
  const blob = await captureCardAsBlob(element)
  if (!blob) return "failed"

  // 1. 모바일 Web Share API - 이미지 파일로 직접 공유
  const file = new File([blob], "paire.png", { type: "image/png" })
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text })
      return "shared"
    } catch (e) {
      if ((e as Error).name === "AbortError") return "failed"
      // 공유 실패 시 다음 단계로
    }
  }

  // 2. 클립보드에 이미지 복사
  const copied = await copyImageToClipboard(blob)
  if (copied) return "clipboard"

  // 3. 다운로드 fallback
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "paire-recommendation.png"
  a.click()
  URL.revokeObjectURL(url)
  return "downloaded"
}
