// lib/share-image.ts

/**
 * 외부 이미지를 base64 dataURL로 변환 (CORS 우회)
 */
async function toDataURL(src: string): Promise<string> {
  try {
    const res = await fetch(src, { mode: "cors" })
    const blob = await res.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return src // 실패 시 원본 URL 반환
  }
}

/**
 * 요소 내 모든 img src를 base64로 교체 후 원복
 */
async function replaceImagesWithBase64(element: HTMLElement): Promise<() => void> {
  const imgs = Array.from(element.querySelectorAll("img")) as HTMLImageElement[]
  const originals: { el: HTMLImageElement; src: string }[] = []

  await Promise.all(
    imgs.map(async (img) => {
      const src = img.src
      if (!src || src.startsWith("data:")) return
      const dataUrl = await toDataURL(src)
      originals.push({ el: img, src })
      img.src = dataUrl
    })
  )

  // 원복 함수 반환
  return () => {
    originals.forEach(({ el, src }) => { el.src = src })
  }
}

/**
 * html2canvas로 캡처 → Blob 반환
 */
export async function captureCardAsBlob(element: HTMLElement): Promise<Blob | null> {
  try {
    // 이미지를 base64로 교체
    const restore = await replaceImagesWithBase64(element)

    // 잠깐 대기 (이미지 렌더링 완료)
    await new Promise(r => setTimeout(r, 100))

    const html2canvas = (await import("html2canvas")).default
    const canvas = await html2canvas(element, {
      backgroundColor: "#0a0a0a",
      scale: 2,
      useCORS: false,   // base64로 교체했으므로 불필요
      allowTaint: true,
      logging: false,
      imageTimeout: 0,
    })

    restore()

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
 * 1. 모바일 Web Share API → 앱으로 직접 공유
 * 2. 클립보드에 이미지 복사 (데스크탑)
 * 3. 다운로드 fallback
 */
export async function shareCardImage(
  element: HTMLElement,
  text: string,
  fallbackCopy: string
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

  // 3. 다운로드
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
