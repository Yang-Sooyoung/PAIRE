'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Loader2, Share2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { removeFavorite, getDrinkDetail } from '@/app/api/favorite';

// 음료 상세 데이터 타입
interface DrinkDetail {
  id: string;
  name: string;
  type: string;
  description: string;
  tastingNotes: string[];
  image: string;
  price: string;
  alcohol?: string;
  origin?: string;
  pairing?: string[];
  servingTemp?: string;
}

export default function FavoriteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useUserStore();
  const { language } = useI18n();
  const isKorean = language === 'ko';
  
  const [drink, setDrink] = useState<DrinkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchDrinkDetail = async () => {
      try {
        const response = await getDrinkDetail(id);
        setDrink(response.drink);
      } catch (error) {
        console.error('Failed to fetch drink detail:', error);
        toast.error(isKorean ? '상세 정보를 불러올 수 없습니다.' : 'Failed to load details.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchDrinkDetail();
  }, [id, user, router, isKorean]);

  const handleRemoveFavorite = async () => {
    setRemoving(true);
    try {
      await removeFavorite(id);
      toast.success(isKorean ? '즐겨찾기에서 제거했습니다.' : 'Removed from favorites.');
      router.back();
    } catch (error: any) {
      toast.error(error.message || (isKorean ? '오류가 발생했습니다.' : 'An error occurred.'));
    } finally {
      setRemoving(false);
    }
  };

  const handleShare = async () => {
    if (!drink) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: drink.name,
          text: drink.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(isKorean ? '링크가 복사되었습니다.' : 'Link copied to clipboard.');
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    );
  }

  if (!drink) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      <div className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
              {isKorean ? '음료 상세' : 'Drink Details'}
            </h1>
          </div>
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-secondary transition"
          >
            <Share2 className="w-5 h-5 text-gold" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 이미지 */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary">
            {drink.image ? (
              <img
                src={drink.image}
                alt={drink.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gold/30 text-6xl">
                🍷
              </div>
            )}
          </div>

          {/* 기본 정보 */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className={cn(
              "text-2xl font-bold text-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {drink.name}
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              {drink.type}
            </p>
            <p className={cn(
              "text-foreground leading-relaxed mb-4",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {drink.description}
            </p>
            <div className="text-2xl font-bold text-gold">
              {drink.price}
            </div>
          </div>

          {/* 테이스팅 노트 */}
          {drink.tastingNotes.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className={cn(
                "text-lg font-semibold text-foreground mb-3",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {isKorean ? '테이스팅 노트' : 'Tasting Notes'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {drink.tastingNotes.map((note, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-gold/10 text-gold text-sm"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 상세 정보 */}
          {(drink.alcohol || drink.origin || drink.servingTemp) && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className={cn(
                "text-lg font-semibold text-foreground mb-3",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {isKorean ? '상세 정보' : 'Details'}
              </h3>
              
              <div className="space-y-3">
                {drink.alcohol && (
                  <div className="flex justify-between">
                    <span className={cn(
                      "text-muted-foreground",
                      isKorean && "font-[var(--font-noto-kr)]"
                    )}>
                      {isKorean ? '알코올 도수' : 'Alcohol'}
                    </span>
                    <span className="text-foreground font-medium">
                      {drink.alcohol}
                    </span>
                  </div>
                )}
                
                {drink.origin && (
                  <div className="flex justify-between">
                    <span className={cn(
                      "text-muted-foreground",
                      isKorean && "font-[var(--font-noto-kr)]"
                    )}>
                      {isKorean ? '원산지' : 'Origin'}
                    </span>
                    <span className="text-foreground font-medium">
                      {drink.origin}
                    </span>
                  </div>
                )}
                
                {drink.servingTemp && (
                  <div className="flex justify-between">
                    <span className={cn(
                      "text-muted-foreground",
                      isKorean && "font-[var(--font-noto-kr)]"
                    )}>
                      {isKorean ? '적정 온도' : 'Serving Temp'}
                    </span>
                    <span className="text-foreground font-medium">
                      {drink.servingTemp}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 페어링 */}
          {drink.pairing && drink.pairing.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className={cn(
                "text-lg font-semibold text-foreground mb-3",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {isKorean ? '추천 페어링' : 'Recommended Pairing'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {drink.pairing.map((food, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-secondary text-foreground text-sm"
                  >
                    {food}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <Button
              onClick={handleRemoveFavorite}
              disabled={removing}
              variant="outline"
              className={cn(
                "flex-1 border-gold/30 text-gold hover:bg-gold/10",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              {removing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Heart className="w-4 h-4 mr-2 fill-gold" />
              )}
              {isKorean ? '즐겨찾기 제거' : 'Remove Favorite'}
            </Button>
            
            <Button
              className={cn(
                "flex-1 bg-gold hover:bg-gold-light text-background",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isKorean ? '구매하기' : 'Purchase'}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
