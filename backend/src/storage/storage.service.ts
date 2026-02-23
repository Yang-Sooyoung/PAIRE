import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;
  private bucketName = 'paire-images';

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not found. Image upload will be disabled.');
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * base64 이미지를 Supabase Storage에 업로드
   */
  async uploadBase64Image(base64Data: string, userId?: string): Promise<string | null> {
    if (!this.supabase) {
      console.warn('Supabase not initialized. Skipping upload.');
      return null;
    }

    try {
      // base64 데이터에서 헤더 제거
      const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64String, 'base64');

      // 파일명 생성
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileName = `${userId || 'guest'}_${timestamp}_${randomString}.jpg`;
      const filePath = `food-images/${fileName}`;

      // Supabase Storage에 업로드
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, buffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return null;
      }

      // 공개 URL 생성
      const { data: publicUrlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Failed to upload image:', error);
      return null;
    }
  }

  /**
   * URL 이미지를 다운로드하여 Supabase에 업로드
   */
  async uploadFromUrl(imageUrl: string, userId?: string): Promise<string | null> {
    if (!this.supabase) {
      console.warn('Supabase not initialized. Skipping upload.');
      return null;
    }

    try {
      // 이미지 다운로드
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      // 파일명 생성
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileName = `${userId || 'guest'}_${timestamp}_${randomString}.jpg`;
      const filePath = `food-images/${fileName}`;

      // Supabase Storage에 업로드
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, buffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return null;
      }

      // 공개 URL 생성
      const { data: publicUrlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Failed to upload image from URL:', error);
      return null;
    }
  }

  /**
   * 이미지 삭제
   */
  async deleteImage(imageUrl: string): Promise<boolean> {
    if (!this.supabase) {
      return false;
    }

    try {
      // URL에서 파일 경로 추출
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf(this.bucketName) + 1).join('/');

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Failed to delete image:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete image:', error);
      return false;
    }
  }
}
