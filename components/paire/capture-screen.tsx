"use client"

import React from "react"
import { useRef, useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Camera, X, ImagePlus, SwitchCamera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"
import imageCompression from 'browser-image-compression'
import { isNative } from "@/lib/capacitor"

interface CaptureScreenProps {
  onCapture: (imageUrl: string) => void
  onBack: () => void
}

export function CaptureScreen({ onCapture, onBack }: CaptureScreenProps) {
  const { language, t } = useI18n()
  const isKorean = language === "ko"
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')

  // 카메라 시작
  const startCamera = useCallback(async () => {
    // 네이티브 앱: Capacitor Camera 플러그인 사용
    if (isNative()) {
      try {
        const { Camera: CapCamera, CameraResultType, CameraSource } = await import('@capacitor/camera');
        const photo = await CapCamera.getPhoto({
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          quality: 90,
          direction: facingMode === 'environment' ? 1 : 0, // REAR=1, FRONT=0
        });
        if (photo.dataUrl) {
          setPreview(photo.dataUrl);
        }
      } catch (error: any) {
        if (error?.message !== 'User cancelled photos app') {
          console.error('카메라 접근 실패:', error);
          alert(isKorean ? '카메라 접근 권한이 필요합니다.' : 'Camera access is required.');
        }
      }
      return;
    }

    // 웹: getUserMedia 사용
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsCameraActive(true)
      }
    } catch (error) {
      console.error('카메라 접근 실패:', error)
      alert(isKorean ? '카메라 접근 권한이 필요합니다.' : 'Camera access is required.')
    }
  }, [facingMode, isKorean])

  // 카메라 중지
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setIsCameraActive(false)
    }
  }, [stream])

  // 카메라 전환
  const switchCamera = useCallback(() => {
    stopCamera()
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }, [stopCamera])

  // 사진 촬영
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)

    canvas.toBlob(async (blob) => {
      if (!blob) return

      try {
        setIsCompressing(true)

        // 이미지 압축
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/jpeg' as const,
        }

        const compressedFile = await imageCompression(blob as File, options)

        const reader = new FileReader()
        reader.onload = (event) => {
          const result = event.target?.result as string
          setPreview(result)
          setIsCompressing(false)
          stopCamera()
        }
        reader.readAsDataURL(compressedFile)
      } catch (error) {
        console.error('이미지 압축 실패:', error)
        const reader = new FileReader()
        reader.onload = (event) => {
          const result = event.target?.result as string
          setPreview(result)
          setIsCompressing(false)
          stopCamera()
        }
        reader.readAsDataURL(blob)
      }
    }, 'image/jpeg', 0.95)
  }, [stopCamera])

  // facingMode 변경 시 카메라 재시작
  useEffect(() => {
    if (isCameraActive) {
      startCamera()
    }
  }, [facingMode])

  // 컴포넌트 언마운트 시 카메라 정리
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    // 네이티브 앱: Capacitor Camera 플러그인으로 갤러리 열기
    if (isNative()) {
      try {
        const { Camera: CapCamera, CameraResultType, CameraSource } = await import('@capacitor/camera');
        const photo = await CapCamera.getPhoto({
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Photos,
          quality: 90,
        });
        if (photo.dataUrl) {
          setIsCompressing(true);
          try {
            const res = await fetch(photo.dataUrl);
            const blob = await res.blob();
            const compressed = await imageCompression(blob as File, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
            const reader = new FileReader();
            reader.onload = (ev) => { setPreview(ev.target?.result as string); setIsCompressing(false); };
            reader.readAsDataURL(compressed);
          } catch {
            setPreview(photo.dataUrl);
            setIsCompressing(false);
          }
        }
      } catch (error: any) {
        if (error?.message !== 'User cancelled photos app') {
          console.error('갤러리 접근 실패:', error);
        }
      }
      return;
    }

    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsCompressing(true)

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg' as const,
      }

      const compressedFile = await imageCompression(file, options)

      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setPreview(result)
        setIsCompressing(false)
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      console.error('이미지 압축 실패:', error)
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setPreview(result)
        setIsCompressing(false)
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
          onClick={() => {
            stopCamera()
            onBack()
          }}
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
        {isCameraActive && (
          <Button
            variant="ghost"
            size="icon"
            onClick={switchCamera}
            className="text-gold hover:bg-gold/10"
          >
            <SwitchCamera className="w-6 h-6" />
          </Button>
        )}
        {!isCameraActive && <div className="w-10" />}
      </div>

      {/* Camera/Preview Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-gold/30 bg-black"
        >
          {/* 실시간 카메라 */}
          {isCameraActive && !preview && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />
          )}

          {/* 촬영된 사진 미리보기 */}
          {preview && (
            <img
              src={preview}
              alt="Food preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* 초기 상태 */}
          {!isCameraActive && !preview && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-secondary/50">
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

          {/* Corner guides - 카메라 활성화 시에만 표시 */}
          {isCameraActive && !preview && (
            <>
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-gold rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-gold rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-gold rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-gold rounded-br-lg" />
            </>
          )}
        </motion.div>

        <p className={cn(
          "text-muted-foreground text-center mt-6 mb-8 max-w-xs",
          isKorean && "font-[var(--font-noto-kr)] text-sm"
        )}>
          {t("capture.hintLong")}
        </p>
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

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
              disabled={isCompressing}
              className={cn(
                "flex-1 h-14 border-gold/40 text-gold hover:bg-gold/10",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              {t("capture.retake")}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isCompressing}
              className={cn(
                "flex-1 h-14 bg-gold hover:bg-gold-light text-background font-semibold",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              {t("capture.usePhoto")}
            </Button>
          </div>
        ) : isCameraActive ? (
          <div className="flex flex-col gap-3">
            <Button
              onClick={capturePhoto}
              disabled={isCompressing}
              className={cn(
                "w-full h-16 bg-gold hover:bg-gold-light text-background font-bold text-xl rounded-full shadow-lg shadow-gold/30",
                isKorean && "font-[var(--font-noto-kr)] text-lg"
              )}
            >
              <Camera className="w-6 h-6 mr-3" />
              {isCompressing ? (isKorean ? '처리 중...' : 'Processing...') : (isKorean ? '📸 사진 촬영' : '📸 Take Photo')}
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => isNative() ? handleFileSelect({} as any) : fileInputRef.current?.click()}
                disabled={isCompressing}
                className={cn(
                  "flex-1 h-12 border-gold/40 text-gold hover:bg-gold/10",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
              >
                <ImagePlus className="w-5 h-5 mr-2" />
                {isKorean ? '갤러리' : 'Gallery'}
              </Button>
              <Button
                variant="outline"
                onClick={stopCamera}
                className={cn(
                  "flex-1 h-12 border-gold/40 text-gold hover:bg-gold/10",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
              >
                {isKorean ? '카메라 끄기' : 'Close'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Button
              onClick={startCamera}
              disabled={isCompressing}
              className={cn(
                "w-full h-14 bg-gold hover:bg-gold-light text-background font-semibold text-lg",
                isKorean && "font-[var(--font-noto-kr)] text-base"
              )}
            >
              <Camera className="w-5 h-5 mr-3" />
              {isKorean ? '카메라 켜기' : 'Open Camera'}
            </Button>
            <Button
              variant="outline"
              onClick={() => isNative() ? handleFileSelect({} as any) : fileInputRef.current?.click()}
              disabled={isCompressing}
              className={cn(
                "w-full h-12 border-gold/40 text-gold hover:bg-gold/10",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              <ImagePlus className="w-5 h-5 mr-2" />
              {isCompressing ? (isKorean ? '압축 중...' : 'Compressing...') : t("capture.selectPhoto")}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
