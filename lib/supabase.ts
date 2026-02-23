// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * 이미지를 Supabase Storage에 업로드
 */
export async function uploadImage(file: File | Blob, userId?: string): Promise<string> {
  const fileName = `${userId || 'guest'}_${Date.now()}.jpg`
  const filePath = `food-images/${fileName}`

  const { data, error } = await supabase.storage
    .from('paire-images')
    .upload(filePath, file, {
      contentType: 'image/jpeg',
      upsert: false,
    })

  if (error) {
    console.error('Upload error:', error)
    throw new Error('이미지 업로드 실패')
  }

  // 공개 URL 생성
  const { data: { publicUrl } } = supabase.storage
    .from('paire-images')
    .getPublicUrl(data.path)

  return publicUrl
}

/**
 * base64를 Blob으로 변환
 */
export function base64ToBlob(base64: string): Blob {
  const parts = base64.split(';base64,')
  const contentType = parts[0].split(':')[1]
  const raw = window.atob(parts[1])
  const rawLength = raw.length
  const uInt8Array = new Uint8Array(rawLength)

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i)
  }

  return new Blob([uInt8Array], { type: contentType })
}
