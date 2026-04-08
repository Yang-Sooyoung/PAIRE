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
    name: '泥?異붿쿇',
    nameEn: 'First Step',
    description: '泥?踰덉㎏ 異붿쿇??諛쏆븯?댁슂',
    descriptionEn: 'Received your first recommendation',
    emoji: '?럦',
    condition: '異붿쿇 1??,
    conditionEn: '1 recommendation',
  },
  {
    id: 'wine-lover',
    name: '????щ쾭',
    nameEn: 'Wine Lover',
    description: '???異붿쿇??10踰?諛쏆븯?댁슂',
    descriptionEn: 'Received 10 wine recommendations',
    emoji: '?뜼',
    condition: '???異붿쿇 10??,
    conditionEn: '10 wine recommendations',
  },
  {
    id: 'night-owl',
    name: '?쇳뻾??,
    nameEn: 'Night Owl',
    description: '諛?11???댄썑 異붿쿇??5踰?諛쏆븯?댁슂',
    descriptionEn: 'Got 5 recommendations after 11 PM',
    emoji: '?뙔',
    condition: '諛?11???댄썑 異붿쿇 5??,
    conditionEn: '5 recommendations after 11 PM',
  },
  {
    id: 'passionate',
    name: '?댁젙??,
    nameEn: 'Passionate',
    description: '?쇱＜???곗냽 異붿쿇??諛쏆븯?댁슂',
    descriptionEn: 'Got recommendations for 7 days straight',
    emoji: '?뵦',
    condition: '7???곗냽 異붿쿇',
    conditionEn: '7 days streak',
  },
  {
    id: 'premium-member',
    name: '?꾨━誘몄뾼 硫ㅻ쾭',
    nameEn: 'Premium Member',
    description: '?꾨━誘몄뾼 援щ룆???쒖옉?덉뼱??,
    descriptionEn: 'Started premium subscription',
    emoji: '?뭿',
    condition: '?꾨━誘몄뾼 援щ룆',
    conditionEn: 'Premium subscription',
  },
  {
    id: 'perfectionist',
    name: '?꾨꼍二쇱쓽??,
    nameEn: 'Perfectionist',
    description: '利먭꺼李얘린瑜?20媛?紐⑥븯?댁슂',
    descriptionEn: 'Collected 20 favorites',
    emoji: '?렞',
    condition: '利먭꺼李얘린 20媛?,
    conditionEn: '20 favorites',
  },
  {
    id: 'explorer',
    name: '?먰뿕媛',
    nameEn: 'Explorer',
    description: '5媛吏 ?ㅻⅨ ?뚮즺 ??낆쓣 異붿쿇諛쏆븯?댁슂',
    descriptionEn: 'Tried 5 different drink types',
    emoji: '?뿺截?,
    condition: '5媛吏 ?뚮즺 ???,
    conditionEn: '5 drink types',
  },
  {
    id: 'social-butterfly',
    name: '?뚯뀥 踰꾪꽣?뚮씪??,
    nameEn: 'Social Butterfly',
    description: '異붿쿇??10踰?怨듭쑀?덉뼱??,
    descriptionEn: 'Shared 10 recommendations',
    emoji: '?쫳',
    condition: '怨듭쑀 10??,
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

      // 諛깆뿏?쒕뒗 { stickers: [{ id, unlockedAt }] } ?뺤떇?쇰줈 諛섑솚
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
      {/* 諛곌꼍 ?④낵 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      {/* ?ㅻ뜑 */}
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
            {isKorean ? '?ㅽ떚而?而щ젆?? : 'Sticker Collection'}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        {/* 吏꾪뻾??*/}
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
                {isKorean ? '?섏쭛 吏꾪뻾?? : 'Collection Progress'}
              </h2>
              <p className="text-muted-foreground text-sm">
                {unlockedCount} / {totalCount} {isKorean ? '媛??섏쭛' : 'collected'}
              </p>
            </div>
            <div className="text-4xl">
              <Sparkles className="w-10 h-10 text-gold" />
            </div>
          </div>

          {/* 吏꾪뻾 諛?*/}
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-gold to-gold-light"
            />
          </div>
        </motion.div>

        {/* ?ㅽ떚而?洹몃━??*/}
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
              {/* ?좉툑 ?꾩씠肄?*/}
              {!sticker.unlocked && (
                <div className="absolute top-3 right-3">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}

              {/* ?대え吏 */}
              <div
                className={cn(
                  'text-5xl mb-3 text-center',
                  !sticker.unlocked && 'grayscale opacity-30'
                )}
              >
                {sticker.emoji}
              </div>

              {/* ?대쫫 */}
              <h3
                className={cn(
                  'text-center font-semibold text-foreground mb-2',
                  isKorean && 'font-[var(--font-noto-kr)]'
                )}
              >
                {isKorean ? sticker.name : sticker.nameEn}
              </h3>

              {/* ?ㅻ챸 */}
              <p
                className={cn(
                  'text-xs text-center text-muted-foreground mb-2',
                  isKorean && 'font-[var(--font-noto-kr)]'
                )}
              >
                {isKorean ? sticker.description : sticker.descriptionEn}
              </p>

              {/* 議곌굔 */}
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

              {/* ?댁젣 ?좎쭨 */}
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

        {/* ?덈궡 硫붿떆吏 */}
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
                ? '異붿쿇??諛쏄퀬 ?ㅽ떚而ㅻ? ?섏쭛?대낫?몄슂! ??
                : 'Get recommendations and collect stickers! ??}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}