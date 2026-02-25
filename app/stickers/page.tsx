'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Sparkles, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface Sticker {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  emoji: string;
  condition: string;
  conditionEn: string;
  unlocked: boolean;
  unlockedAt?: string;
}

const STICKERS: Omit<Sticker, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first-recommendation',
    name: '첫 추천',
    nameEn: 'First Step',
    description: '첫 번째 추천을 받았어요',
    descriptionEn: 'Received your first recommendation',
    emoji: '🎉',
    condition: '추천 1회',
    conditionEn: '1 recommendation',
  },
  {
    id: 'wine-lover',
    name: '와인 러버',
    nameEn: 'Wine Lover',
    description: '와인 추천을 10번 받았어요',
    descriptionEn: 'Received 10 wine recommendations',
    emoji: '🍷',
    condition: '와인 추천 10회',
    conditionEn: '10 wine recommendations',
  },
  {
    id: 'night-owl',
    name: '야행성',
    nameEn: 'Night Owl',
    description: '밤 11시 이후 추천을 5번 받았어요',
    descriptionEn: 'Got 5 recommendations after 11 PM',
    emoji: '🌙',
    condition: '밤 11시 이후 추천 5회',
    conditionEn: '5 recommendations after 11 PM',
  },
  {
    id: 'passionate',
    name: '열정적',
    nameEn: 'Passionate',
    description: '일주일 연속 추천을 받았어요',
    descriptionEn: 'Got recommendations for 7 days straight',
    emoji: '🔥',
    condition: '7일 연속 추천',
    conditionEn: '7 days streak',
  },
  {
    id: 'premium-member',
    name: '프리미엄 멤버',
    nameEn: 'Premium Member',
    description: '프리미엄 구독을 시작했어요',
    descriptionEn: 'Started premium subscription',
    emoji: '💎',
    condition: '프리미엄 구독',
    conditionEn: 'Premium subscription',
  },
  {
    id: 'perfectionist',
    name: '완벽주의자',
    nameEn: 'Perfectionist',
    description: '즐겨찾기를 20개 모았어요',
    descriptionEn: 'Collected 20 favorites',
    emoji: '🎯',
    condition: '즐겨찾기 20개',
    conditionEn: '20 favorites',
  },
  {
    id: 'explorer',
    name: '탐험가',
    nameEn: 'Explorer',
    description: '5가지 다른 음료 타입을 추천받았어요',
    descriptionEn: 'Tried 5 different drink types',
    emoji: '🗺️',
    condition: '5가지 음료 타입',
    conditionEn: '5 drink types',
  },
  {
    id: 'social-butterfly',
    name: '소셜 버터플라이',
    nameEn: 'Social Butterfly',
    description: '추천을 10번 공유했어요',
    descriptionEn: 'Shared 10 recommendations',
    emoji: '🦋',
    condition: '공유 10회',
    conditionEn: '10 shares',
  },
];

export default function StickersPage() {
  const router = useRouter();
  const { user, token } = useUserStore();
  const { language } = useI18n();
  const isKorean = language === 'ko';
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }

    fetchStickers();
  }, [user, token, router]);

  const fetchStickers = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const response = await axios.get(`${API_URL}/sticker/my-stickers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const unlockedIds = new Set(response.data.stickers.map((s: any) => s.stickerId));
      const unlockedMap = new Map(
        response.data.stickers.map((s: any) => [s.stickerId, s.unlockedAt])
      );

      const allStickers = STICKERS.map((sticker) => ({
        ...sticker,
        unlocked: unlockedIds.has(sticker.id),
        unlockedAt: unlockedMap.get(sticker.id),
      }));

      setStickers(allStickers);
    } catch (error) {
      console.error('Failed to fetch stickers:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = stickers.filter((s) => s.unlocked).length;
  const totalCount = stickers.length;
  const progress = (unlockedCount / totalCount) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      {/* 헤더 */}
      <div className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gold hover:text-gold-light transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1
            className={cn(
              'text-2xl font-light text-foreground tracking-wide',
              isKorean && 'font-[var(--font-noto-kr)] tracking-normal'
            )}
          >
            {isKorean ? '스티커 컬렉션' : 'Sticker Collection'}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        {/* 진행도 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className={cn(
                  'text-xl font-light text-foreground mb-1',
                  isKorean && 'font-[var(--font-noto-kr)]'
                )}
              >
                {isKorean ? '수집 진행도' : 'Collection Progress'}
              </h2>
              <p className="text-muted-foreground text-sm">
                {unlockedCount} / {totalCount} {isKorean ? '개 수집' : 'collected'}
              </p>
            </div>
            <div className="text-4xl">
              <Sparkles className="w-10 h-10 text-gold" />
            </div>
          </div>

          {/* 진행 바 */}
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-gold to-gold-light"
            />
          </div>
        </motion.div>

        {/* 스티커 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stickers.map((sticker, index) => (
            <motion.div
              key={sticker.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'relative bg-card border rounded-xl p-6 transition-all',
                sticker.unlocked
                  ? 'border-gold/30 hover:border-gold/50 hover:shadow-lg hover:shadow-gold/10'
                  : 'border-border opacity-60'
              )}
            >
              {/* 잠금 아이콘 */}
              {!sticker.unlocked && (
                <div className="absolute top-3 right-3">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}

              {/* 이모지 */}
              <div
                className={cn(
                  'text-5xl mb-3 text-center',
                  !sticker.unlocked && 'grayscale opacity-30'
                )}
              >
                {sticker.emoji}
              </div>

              {/* 이름 */}
              <h3
                className={cn(
                  'text-center font-semibold text-foreground mb-2',
                  isKorean && 'font-[var(--font-noto-kr)]'
                )}
              >
                {isKorean ? sticker.name : sticker.nameEn}
              </h3>

              {/* 설명 */}
              <p
                className={cn(
                  'text-xs text-center text-muted-foreground mb-2',
                  isKorean && 'font-[var(--font-noto-kr)]'
                )}
              >
                {isKorean ? sticker.description : sticker.descriptionEn}
              </p>

              {/* 조건 */}
              <div
                className={cn(
                  'text-xs text-center px-2 py-1 rounded-full',
                  sticker.unlocked
                    ? 'bg-gold/10 text-gold'
                    : 'bg-secondary text-muted-foreground'
                )}
              >
                {isKorean ? sticker.condition : sticker.conditionEn}
              </div>

              {/* 해제 날짜 */}
              {sticker.unlocked && sticker.unlockedAt && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {new Date(sticker.unlockedAt).toLocaleDateString(
                    isKorean ? 'ko-KR' : 'en-US',
                    { month: 'short', day: 'numeric' }
                  )}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* 안내 메시지 */}
        {unlockedCount === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <p
              className={cn(
                'text-muted-foreground',
                isKorean && 'font-[var(--font-noto-kr)]'
              )}
            >
              {isKorean
                ? '추천을 받고 스티커를 수집해보세요! ✨'
                : 'Get recommendations and collect stickers! ✨'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
