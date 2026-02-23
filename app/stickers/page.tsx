'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Lock } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

// 스티커 정의
const STICKERS = [
  {
    id: 'first-recommendation',
    emoji: '🌟',
    nameKo: '첫 만남',
    nameEn: 'First Meeting',
    descKo: '첫 추천을 받았어요',
    descEn: 'Got your first recommendation',
    condition: 'recommendation_count >= 1',
  },
  {
    id: 'wine-lover',
    emoji: '🍷',
    nameKo: '와인 러버',
    nameEn: 'Wine Lover',
    descKo: '와인을 5번 추천받았어요',
    descEn: 'Got wine recommended 5 times',
    condition: 'wine_count >= 5',
  },
  {
    id: 'night-owl',
    emoji: '🌙',
    nameKo: '밤의 요정',
    nameEn: 'Night Fairy',
    descKo: '밤 10시 이후에 추천받았어요',
    descEn: 'Got recommendation after 10 PM',
    condition: 'late_night_recommendation',
  },
  {
    id: 'early-bird',
    emoji: '☀️',
    nameKo: '아침 요정',
    nameEn: 'Morning Fairy',
    descKo: '아침 7시 전에 추천받았어요',
    descEn: 'Got recommendation before 7 AM',
    condition: 'early_morning_recommendation',
  },
  {
    id: 'premium-member',
    emoji: '👑',
    nameKo: '프리미엄 요정',
    nameEn: 'Premium Fairy',
    descKo: 'PREMIUM 멤버가 되었어요',
    descEn: 'Became a PREMIUM member',
    condition: 'is_premium',
  },
  {
    id: 'collector',
    emoji: '💝',
    nameKo: '수집가',
    nameEn: 'Collector',
    descKo: '즐겨찾기 10개를 모았어요',
    descEn: 'Collected 10 favorites',
    condition: 'favorite_count >= 10',
  },
  {
    id: 'explorer',
    emoji: '🗺️',
    nameKo: '탐험가',
    nameEn: 'Explorer',
    descKo: '5가지 다른 종류의 음료를 추천받았어요',
    descEn: 'Got 5 different drink types',
    condition: 'drink_type_variety >= 5',
  },
  {
    id: 'social-butterfly',
    emoji: '🦋',
    nameKo: '사교적인 요정',
    nameEn: 'Social Butterfly',
    descKo: '친구 모임 상황으로 10번 추천받았어요',
    descEn: 'Got 10 recommendations for gatherings',
    condition: 'gathering_count >= 10',
  },
  {
    id: 'romantic',
    emoji: '💕',
    nameKo: '로맨틱 요정',
    nameEn: 'Romantic Fairy',
    descKo: '데이트 상황으로 5번 추천받았어요',
    descEn: 'Got 5 recommendations for dates',
    condition: 'date_count >= 5',
  },
  {
    id: 'solo-master',
    emoji: '🌸',
    nameKo: '나홀로 마스터',
    nameEn: 'Solo Master',
    descKo: '혼자 즐기기 상황으로 10번 추천받았어요',
    descEn: 'Got 10 solo recommendations',
    condition: 'solo_count >= 10',
  },
  {
    id: 'week-warrior',
    emoji: '🔥',
    nameKo: '일주일 챌린저',
    nameEn: 'Week Warrior',
    descKo: '7일 연속 추천받았어요',
    descEn: 'Got recommendations for 7 days straight',
    condition: 'consecutive_days >= 7',
  },
  {
    id: 'sharing-fairy',
    emoji: '✨',
    nameKo: '공유의 요정',
    nameEn: 'Sharing Fairy',
    descKo: '추천을 5번 공유했어요',
    descEn: 'Shared recommendations 5 times',
    condition: 'share_count >= 5',
  },
];

export default function StickersPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { language } = useI18n();
  const isKorean = language === 'ko';
  const [unlockedStickers, setUnlockedStickers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // TODO: 백엔드에서 잠금 해제된 스티커 가져오기
    // 임시로 첫 추천과 프리미엄 멤버 스티커만 해제
    const mockUnlocked = ['first-recommendation'];
    if (user.membership === 'PREMIUM') {
      mockUnlocked.push('premium-member');
    }
    setUnlockedStickers(mockUnlocked);
    setLoading(false);
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-gold animate-pulse mx-auto mb-4" />
          <p className={cn(
            "text-muted-foreground",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean ? '스티커를 불러오는 중...' : 'Loading stickers...'}
          </p>
        </div>
      </div>
    );
  }

  const unlockedCount = unlockedStickers.length;
  const totalCount = STICKERS.length;
  const progress = (unlockedCount / totalCount) * 100;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      {/* 헤더 */}
      <div className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gold hover:text-gold-light transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={cn(
            "text-2xl font-light text-foreground tracking-wide",
            isKorean && "font-[var(--font-noto-kr)] tracking-normal"
          )}>
            {isKorean ? '수집한 스티커' : 'Collected Stickers'}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        {/* 진행도 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={cn(
                "text-xl font-semibold text-foreground mb-1",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {isKorean ? '수집 진행도' : 'Collection Progress'}
              </h2>
              <p className={cn(
                "text-muted-foreground text-sm",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {unlockedCount} / {totalCount} {isKorean ? '개 수집' : 'collected'}
              </p>
            </div>
            <div className="text-4xl">
              {progress === 100 ? '🎉' : '✨'}
            </div>
          </div>
          
          {/* 진행 바 */}
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-gold-dim to-gold rounded-full"
            />
          </div>
        </motion.div>

        {/* 스티커 그리드 */}
        <div className="grid grid-cols-3 gap-4">
          {STICKERS.map((sticker, index) => {
            const isUnlocked = unlockedStickers.includes(sticker.id);
            
            return (
              <motion.div
                key={sticker.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "relative aspect-square rounded-xl border-2 p-4 flex flex-col items-center justify-center transition-all",
                  isUnlocked
                    ? "bg-gradient-to-br from-gold/10 to-gold/5 border-gold/30 hover:border-gold/50"
                    : "bg-card border-border opacity-50"
                )}
              >
                {/* 스티커 이모지 */}
                <div className={cn(
                  "text-5xl mb-2 transition-all",
                  !isUnlocked && "grayscale blur-sm"
                )}>
                  {isUnlocked ? sticker.emoji : '🔒'}
                </div>

                {/* 스티커 이름 */}
                <p className={cn(
                  "text-xs font-medium text-center mb-1",
                  isUnlocked ? "text-foreground" : "text-muted-foreground",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {isKorean ? sticker.nameKo : sticker.nameEn}
                </p>

                {/* 설명 (잠금 해제된 것만) */}
                {isUnlocked && (
                  <p className={cn(
                    "text-[10px] text-muted-foreground text-center leading-tight",
                    isKorean && "font-[var(--font-noto-kr)]"
                  )}>
                    {isKorean ? sticker.descKo : sticker.descEn}
                  </p>
                )}

                {/* 잠금 아이콘 */}
                {!isUnlocked && (
                  <Lock className="absolute top-2 right-2 w-3 h-3 text-muted-foreground" />
                )}

                {/* 반짝임 효과 (잠금 해제된 것만) */}
                {isUnlocked && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(212, 175, 55, 0)',
                        '0 0 20px 5px rgba(212, 175, 55, 0.3)',
                        '0 0 0 0 rgba(212, 175, 55, 0)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* 안내 메시지 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className={cn(
            "text-muted-foreground text-sm",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean
              ? '✨ 다양한 활동을 하면서 스티커를 모아보세요!'
              : '✨ Collect stickers through various activities!'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
