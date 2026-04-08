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
    name: 'ì²?ì¶”ì²œ',
    nameEn: 'First Step',
    description: 'ì²?ë²ˆì§¸ ì¶”ì²œ??ë°›ì•˜?´ìš”',
    descriptionEn: 'Received your first recommendation',
    emoji: '?‰',
    condition: 'ì¶”ì²œ 1??,
    conditionEn: '1 recommendation',
  },
  {
    id: 'wine-lover',
    name: '?€???¬ë²„',
    nameEn: 'Wine Lover',
    description: '?€??ì¶”ì²œ??10ë²?ë°›ì•˜?´ìš”',
    descriptionEn: 'Received 10 wine recommendations',
    emoji: '?·',
    condition: '?€??ì¶”ì²œ 10??,
    conditionEn: '10 wine recommendations',
  },
  {
    id: 'night-owl',
    name: '?¼í–‰??,
    nameEn: 'Night Owl',
    description: 'ë°?11???´í›„ ì¶”ì²œ??5ë²?ë°›ì•˜?´ìš”',
    descriptionEn: 'Got 5 recommendations after 11 PM',
    emoji: '?Œ™',
    condition: 'ë°?11???´í›„ ì¶”ì²œ 5??,
    conditionEn: '5 recommendations after 11 PM',
  },
  {
    id: 'passionate',
    name: '?´ì •??,
    nameEn: 'Passionate',
    description: '?¼ì£¼???°ì† ì¶”ì²œ??ë°›ì•˜?´ìš”',
    descriptionEn: 'Got recommendations for 7 days straight',
    emoji: '?”¥',
    condition: '7???°ì† ì¶”ì²œ',
    conditionEn: '7 days streak',
  },
  {
    id: 'premium-member',
    name: '?„ë¦¬ë¯¸ì—„ ë©¤ë²„',
    nameEn: 'Premium Member',
    description: '?„ë¦¬ë¯¸ì—„ êµ¬ë…???œì‘?ˆì–´??,
    descriptionEn: 'Started premium subscription',
    emoji: '?’',
    condition: '?„ë¦¬ë¯¸ì—„ êµ¬ë…',
    conditionEn: 'Premium subscription',
  },
  {
    id: 'perfectionist',
    name: '?„ë²½ì£¼ì˜??,
    nameEn: 'Perfectionist',
    description: 'ì¦ê²¨ì°¾ê¸°ë¥?20ê°?ëª¨ì•˜?´ìš”',
    descriptionEn: 'Collected 20 favorites',
    emoji: '?¯',
    condition: 'ì¦ê²¨ì°¾ê¸° 20ê°?,
    conditionEn: '20 favorites',
  },
  {
    id: 'explorer',
    name: '?í—˜ê°€',
    nameEn: 'Explorer',
    description: '5ê°€ì§€ ?¤ë¥¸ ?Œë£Œ ?€?…ì„ ì¶”ì²œë°›ì•˜?´ìš”',
    descriptionEn: 'Tried 5 different drink types',
    emoji: '?—ºï¸?,
    condition: '5ê°€ì§€ ?Œë£Œ ?€??,
    conditionEn: '5 drink types',
  },
  {
    id: 'social-butterfly',
    name: '?Œì…œ ë²„í„°?Œë¼??,
    nameEn: 'Social Butterfly',
    description: 'ì¶”ì²œ??10ë²?ê³µìœ ?ˆì–´??,
    descriptionEn: 'Shared 10 recommendations',
    emoji: '?¦‹',
    condition: 'ê³µìœ  10??,
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

      // ë°±ì—”?œëŠ” { stickers: [{ id, unlockedAt }] } ?•ì‹?¼ë¡œ ë°˜í™˜
      const unlockedIds = new Set(response.data.stickers.map((s: any) => s.id));
      const unlockedMap = new Map(
        response.data.stickers.map((s: any) => [s.id, s.unlockedAt])
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
      {/* ë°°ê²½ ?¨ê³¼ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      {/* ?¤ë” */}
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
              'text-lg font-medium text-foreground tracking-wide',
              isKorean && 'font-[var(--font-noto-kr)] tracking-normal'
            )}
          >
            {isKorean ? '?¤í‹°ì»?ì»¬ë ‰?? : 'Sticker Collection'}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        {/* ì§„í–‰??*/}
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
                {isKorean ? '?˜ì§‘ ì§„í–‰?? : 'Collection Progress'}
              </h2>
              <p className="text-muted-foreground text-sm">
                {unlockedCount} / {totalCount} {isKorean ? 'ê°??˜ì§‘' : 'collected'}
              </p>
            </div>
            <div className="text-4xl">
              <Sparkles className="w-10 h-10 text-gold" />
            </div>
          </div>

          {/* ì§„í–‰ ë°?*/}
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-gold to-gold-light"
            />
          </div>
        </motion.div>

        {/* ?¤í‹°ì»?ê·¸ë¦¬??*/}
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
              {/* ? ê¸ˆ ?„ì´ì½?*/}
              {!sticker.unlocked && (
                <div className="absolute top-3 right-3">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}

              {/* ?´ëª¨ì§€ */}
              <div
                className={cn(
                  'text-5xl mb-3 text-center',
                  !sticker.unlocked && 'grayscale opacity-30'
                )}
              >
                {sticker.emoji}
              </div>

              {/* ?´ë¦„ */}
              <h3
                className={cn(
                  'text-center font-semibold text-foreground mb-2',
                  isKorean && 'font-[var(--font-noto-kr)]'
                )}
              >
                {isKorean ? sticker.name : sticker.nameEn}
              </h3>

              {/* ?¤ëª… */}
              <p
                className={cn(
                  'text-xs text-center text-muted-foreground mb-2',
                  isKorean && 'font-[var(--font-noto-kr)]'
                )}
              >
                {isKorean ? sticker.description : sticker.descriptionEn}
              </p>

              {/* ì¡°ê±´ */}
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

              {/* ?´ì œ ? ì§œ */}
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

        {/* ?ˆë‚´ ë©”ì‹œì§€ */}
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
                ? 'ì¶”ì²œ??ë°›ê³  ?¤í‹°ì»¤ë? ?˜ì§‘?´ë³´?¸ìš”! ??
                : 'Get recommendations and collect stickers! ??}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}


