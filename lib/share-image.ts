// lib/share-image.ts - dom-to-image-more 기반 (html2canvas 대체)

/**
 * DOM 요소를 PNG Blob으로 캡처
 */
export async function captureCardAsBlob(element: HTMLElement): Promise<Blob | null> {
  try {
    const domtoimage = (await import("dom-to-image-more")).default

    // 요소가 실제로 렌더링될 때까지 대기
    await new Promise(r => setTimeout(r, 200))

    const blob = await domtoimage.toBlob(element, {
      quality: 1,
      scale: 2,
      bgcolor: "#0a0a0a",
      style: {
        // 캡처 시 폰트 강제 적용
        fontFamily: "'Noto Sans KR', 'Playfair Display', Georgia, serif",
      },
    })
    return blob
  } catch (err) {
    console.error("captureCardAsBlob error:", err)
    return null
  }
}

/**
 * 이미지 저장
 */
export async function downloadCardImage(
  element: HTMLElement,
  filename = "paire-recommendation.png"
): Promise<boolean> {
  const blob = await captureCardAsBlob(element)
  if (!blob) return false

  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return true
}

/**
 * 클립보드에 이미지 복사
 */
export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) return false
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
    return true
  } catch (err) {
    console.error("copyImageToClipboard error:", err)
    return false
  }
}

/**
 * 공유하기:
 * 1. 모바일 Web Share API → 앱으로 직접 공유
 * 2. 클립보드에 이미지 복사 (데스크탑)
 * 3. 다운로드 fallback
 */
export async function shareCardImage(
  element: HTMLElement,
  text: string,
  _fallbackCopy: string
): Promise<"shared" | "clipboard" | "downloaded" | "failed"> {
  const blob = await captureCardAsBlob(element)
  if (!blob) return "failed"

  // 1. 모바일 Web Share API
  const file = new File([blob], "paire.png", { type: "image/png" })
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text })
      return "shared"
    } catch (e) {
      if ((e as Error).name === "AbortError") return "failed"
    }
  }

  // 2. 클립보드 복사
  const copied = await copyImageToClipboard(blob)
  if (copied) return "clipboard"

  // 3. 다운로드 fallback
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "paire-recommendation.png"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return "downloaded"
}
