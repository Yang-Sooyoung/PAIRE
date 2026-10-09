'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { getRecommendationHistory, deleteRecommendation, getRecommendationDetail } from '@/app/api/recommendation';
import { addFavorite, removeFavorite, checkFavorite } from '@/app/api/favorite';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Wine, Loader2, Lock, Trash2, Heart, Sparkles, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import { translateOccasion, translateTaste, getDrinkDisplayName, translateDrinkType, translateTastingNote, formatDrinkPriceByRegion } from '@/lib/drink-translations';
import { toast } from 'sonner';
import { ShareModal } from '@/components/paire/share-modal';
import { RecommendationShareModal } from '@/components/paire/recommendation-share-modal';

interface HistoryItem {
  id: string;
  occasion: string;
  tastes: string[];
  drinks: any[];
  imageUrl?: string;
  fairyMessage?: string;
  createdAt: string;
}

interface Drink {
  id: string;
  name: string;
  nameEn?: string;
  type: string;
  description: string;
  descriptionEn?: string;
  tastingNotes: string[];
  image: string;
  price: string;
}

interface RecommendationDetail {
  id: string;
  occasion: string;
  tastes: string[];
  drinks: Drink[];
  detectedFoods: string[];
  fairyMessage: string;
  imageUrl?: string;
  createdAt: string;
}

// useSearchParams를 사용하는 내부 컴포넌트 (Suspense 경계 필요)
function HistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const detailId = searchParams.get('id');

  const { user, refreshTokenIfNeeded } = useUserStore();
  const { language, t } = useI18n();
  const isKorean = language === 'ko';

  // 목록 상태
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // 상세 상태
  const [detail, setDetail] = useState<RecommendationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [favoriteStatus, setFavoriteStatus] = useState<Record<string, boolean>>({});
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);
  const [isKoreaRegion, setIsKoreaRegion] = useState<boolean | null>(null);
  const [shareTarget, setShareTarget] = useState<Drink | null>(null);
  const [showRecommendationShare, setShowRecommendationShare] = useState(false);

  useEffect(() => {
    import('@/lib/region-detector').then(({ detectCountryByIP }) => {
      detectCountryByIP().then(country => setIsKoreaRegion(country === 'KR'));
    });
  }, []);

  // 목록 불러오기
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.membership === 'FREE') return;

    const fetchHistory = async () => {
      try {
        const response = await getRecommendationHistory(20, 0);
        setHistory(response.recommendations || []);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, refreshTokenIfNeeded, router]);

  // 상세 불러오기
  useEffect(() => {
    if (!detailId || !user) return;

    const fetchDetail = async () => {
      setDetailLoading(true);
      try {
        const response = await getRecommendationDetail(detailId);
        const rec = response.recommendation;

        if (rec && typeof rec.drinks === 'string') {
          try { rec.drinks = JSON.parse(rec.drinks); } catch { rec.drinks = []; }
        }
        if (rec && typeof rec.detectedFoods === 'string') {
          try { rec.detectedFoods = JSON.parse(rec.detectedFoods); } catch { rec.detectedFoods = []; }
        }
        if (rec && typeof rec.tastes === 'string') {
          try { rec.tastes = JSON.parse(rec.tastes); } catch { rec.tastes = []; }
        }

        setDetail(rec);

        const drinks = rec?.drinks;
        if (drinks && Array.isArray(drinks)) {
          const statusMap: Record<string, boolean> = {};
          for (const drink of drinks) {
            try {
              const favResponse = await checkFavorite(drink.id);
              statusMap[drink.id] = favResponse.isFavorite;
            } catch {
              statusMap[drink.id] = false;
            }
          }
          setFavoriteStatus(statusMap);
        }
      } catch (error) {
        console.error('Failed to fetch detail:', error);
        toast.error(isKorean ? '상세 정보를 불러올 수 없습니다.' : 'Failed to load details.');
        router.push('/history');
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetail();
  }, [detailId, user, router, isKorean]);

  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
    setShowDialog(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setShowDialog(false);
    setDeletingId(pendingDeleteId);
    try {
      await deleteRecommendation(pendingDeleteId);
      setHistory(prev => prev.filter(item => item.id !== pendingDeleteId));
    } catch (e) {
      console.error('Failed to delete:', e);
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  };

  const handleToggleFavorite = async (drinkId: string) => {
    setTogglingFavorite(drinkId);
    try {
      const isFavorite = favoriteStatus[drinkId];
      if (isFavorite) {
        await removeFavorite(drinkId);
        toast.success(isKorean ? '즐겨찾기에서 제거했습니다.' : 'Removed from favorites.');
      } else {
        const drink = detail?.drinks?.find((d: any) => d.id === drinkId);
        await addFavorite(drinkId, drink?.name);
        toast.success(isKorean ? '즐겨찾기에 추가했습니다.' : 'Added to favorites.');
      }
      setFavoriteStatus(prev => ({ ...prev, [drinkId]: !isFavorite }));
    } catch (error: any) {
      toast.error(error.message || (isKorean ? '오류가 발생했습니다.' : 'An error occurred.'));
    } finally {
      setTogglingFavorite(null);
    }
  };

  // FREE 사용자 화면
  if (user && user.membership === 'FREE') {
    return (
      <div className="min-h-screen bg-background relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
        </div>
        <div className="bg-card/50 backdrop-blur-sm border-b border-border sticky-header">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => router.back()} className="text-gold hover:text-gold-light transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className={cn("text-lg font-medium text-foreground tracking-wide", isKorean && "font-[var(--font-noto-kr)] tracking-normal")}>
              {isKorean ? '추천 히스토리' : 'Recommendation History'}
            </h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-12 relative z-10 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="bg-gold/10 border border-gold/30 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Lock className="w-10 h-10 text-gold" />
            </div>
            <h2 className={cn("text-2xl font-light text-foreground mb-3", isKorean && "font-[var(--font-noto-kr)]")}>
              {isKorean ? 'PREMIUM 전용 기능' : 'PREMIUM Feature'}
            </h2>
            <p className={cn("text-muted-foreground mb-8", isKorean && "font-[var(--font-noto-kr)]")}>
              {isKorean ? '추천 히스토리는 PREMIUM 멤버만 이용할 수 있습니다.' : 'Recommendation history is available for PREMIUM members only.'}
            </p>
            <Button onClick={() => router.push('/subscription')} className={cn("bg-gold hover:bg-gold-light text-background", isKorean && "font-[var(--font-noto-kr)]")}>
              {isKorean ? 'PREMIUM 구독하기' : 'Subscribe to PREMIUM'}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // 상세 뷰 (id 쿼리스트링 있을 때)
  if (detailId) {
    if (detailLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-gold animate-spin" />
        </div>
      );
    }

    if (!detail) return null;

    return (
      <div className="min-h-screen bg-background relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
        </div>

        <div className="bg-card/50 backdrop-blur-sm border-b border-border sticky-header">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => router.push('/history')} className="text-gold hover:text-gold-light transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className={cn("text-lg font-medium text-foreground tracking-wide flex-1", isKorean && "font-[var(--font-noto-kr)] tracking-normal")}>
              {isKorean ? '추천 상세' : 'Recommendation Detail'}
            </h1>
            <button onClick={() => setShowRecommendationShare(true)} className="text-gold hover:text-gold-light transition p-1">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8 relative z-10 space-y-6">
          {/* 기본 정보 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {new Date(detail.createdAt).toLocaleDateString(isKorean ? 'ko-KR' : 'en-US', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>

            {detail.imageUrl && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img src={detail.imageUrl} alt="Food" className="w-full h-48 object-cover" />
              </div>
            )}

            <h2 className={cn("text-xl font-semibold text-foreground mb-3", isKorean && "font-[var(--font-noto-kr)]")}>
              {translateOccasion(detail.occasion, language)}
            </h2>

            {detail.detectedFoods && detail.detectedFoods.length > 0 && (
              <div className="mb-3">
                <p className={cn("text-sm text-muted-foreground mb-2", isKorean && "font-[var(--font-noto-kr)]")}>
                  {isKorean ? '감지된 음식' : 'Detected Foods'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {detail.detectedFoods.map((food, i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-full bg-secondary text-foreground">{food}</span>
                  ))}
                </div>
              </div>
            )}

            {detail.tastes && detail.tastes.length > 0 && (
              <div>
                <p className={cn("text-sm text-muted-foreground mb-2", isKorean && "font-[var(--font-noto-kr)]")}>
                  {isKorean ? '선호 맛' : 'Preferred Tastes'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {detail.tastes.map((taste, i) => (
                    <span key={i} className={cn("text-xs px-3 py-1 rounded-full bg-gold/10 text-gold", isKorean && "font-[var(--font-noto-kr)]")}>
                      {translateTaste(taste, language)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* 요정 메시지 */}
          {detail.fairyMessage && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
                <p className={cn("text-foreground leading-relaxed", isKorean && "font-[var(--font-noto-kr)]")}>
                  {detail.fairyMessage}
                </p>
              </div>
            </motion.div>
          )}

          {/* 추천 음료 목록 */}
          <div className="space-y-4">
            <h3 className={cn("text-lg font-semibold text-foreground", isKorean && "font-[var(--font-noto-kr)]")}>
              {isKorean ? '추천 음료' : 'Recommended Drinks'}
            </h3>

            {detail.drinks && detail.drinks.length > 0 ? (
              detail.drinks.map((drink, index) => (
                <motion.div key={drink.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.1 }}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:border-gold/30 transition">
                  <div className="flex gap-4 p-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                      {drink.image ? (
                        <img src={drink.image} alt={drink.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gold/30">🍷</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className={cn("text-lg font-semibold text-foreground mb-1", isKorean && "font-[var(--font-noto-kr)]")}>
                            {getDrinkDisplayName(drink.name, drink.nameEn, isKorean)}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-1">{translateDrinkType(drink.type, language)}</p>
                          {drink.price && (
                            <p className="text-sm font-medium text-gold">
                              {formatDrinkPriceByRegion(drink.price, isKoreaRegion ?? isKorean)}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => setShareTarget(drink)} className="p-2 rounded-full hover:bg-secondary transition">
                            <Share2 className="w-5 h-5 text-muted-foreground hover:text-gold transition" />
                          </button>
                          <button onClick={() => handleToggleFavorite(drink.id)} disabled={togglingFavorite === drink.id}
                            className="p-2 rounded-full hover:bg-secondary transition">
                            {togglingFavorite === drink.id ? (
                              <Loader2 className="w-5 h-5 text-gold animate-spin" />
                            ) : (
                              <Heart className={cn("w-5 h-5 transition", favoriteStatus[drink.id] ? "fill-gold text-gold" : "text-muted-foreground")} />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className={cn("text-sm text-muted-foreground mb-2 line-clamp-2", isKorean && "font-[var(--font-noto-kr)]")}>
                        {(() => {
                          const desc = drink.description;
                          if (!isKorean && /[가-힣]/.test(desc)) return "This drink pairs beautifully with your dish.";
                          return desc;
                        })()}
                      </p>
                      {drink.tastingNotes && drink.tastingNotes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {drink.tastingNotes.map((note, i) => (
                            <span key={i} className={cn("text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold", isKorean && "font-[var(--font-noto-kr)]")}>
                              {translateTastingNote(note, language)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className={cn(isKorean && "font-[var(--font-noto-kr)]")}>
                  {isKorean ? '추천 음료가 없습니다.' : 'No drinks recommended.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {shareTarget && (
          <ShareModal
            isOpen={!!shareTarget}
            onClose={() => setShareTarget(null)}
            drink={{ name: shareTarget.name, nameEn: shareTarget.nameEn, type: shareTarget.type, description: shareTarget.description, tastingNotes: shareTarget.tastingNotes, image: shareTarget.image, price: shareTarget.price }}
            foodImageUrl={detail?.imageUrl}
            isKorean={isKorean}
            isKoreaRegion={isKoreaRegion}
          />
        )}

        {detail && (
          <RecommendationShareModal
            isOpen={showRecommendationShare}
            onClose={() => setShowRecommendationShare(false)}
            detail={detail}
            isKorean={isKorean}
            occasionLabel={translateOccasion(detail.occasion, language)}
          />
        )}
      </div>
    );
  }

  // 목록 로딩
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    );
  }

  // 목록 뷰
  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      <div className="bg-card/50 backdrop-blur-sm border-b border-border sticky-header">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gold hover:text-gold-light transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={cn("text-lg font-medium text-foreground tracking-wide", isKorean && "font-[var(--font-noto-kr)] tracking-normal")}>
            {isKorean ? '추천 히스토리' : 'Recommendation History'}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        {history.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <Wine className="w-16 h-16 text-gold/30 mx-auto mb-4" />
            <p className={cn("text-muted-foreground", isKorean && "font-[var(--font-noto-kr)]")}>
              {isKorean ? '아직 추천 기록이 없습니다.' : 'No recommendations yet.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-4 hover:border-gold/30 transition">
                <div className="flex gap-4 cursor-pointer" onClick={() => router.push(`/history?id=${item.id}`)}>
                  {item.imageUrl && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                      <img src={item.imageUrl} alt="Food" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString(isKorean ? 'ko-KR' : 'en-US', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className={cn("text-foreground font-medium mb-2", isKorean && "font-[var(--font-noto-kr)]")}>
                      {translateOccasion(item.occasion, language)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.drinks.slice(0, 3).map((drink: any, i: number) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold">
                          {getDrinkDisplayName(drink.name, drink.nameEn, isKorean)}
                        </span>
                      ))}
                      {item.drinks.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                          +{item.drinks.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-3 pt-3 border-t border-border/50">
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} disabled={deletingId === item.id}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition px-2 py-1 rounded">
                    {deletingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    {isKorean ? '삭제' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CustomDialog
        isOpen={showDialog}
        onClose={() => { setShowDialog(false); setPendingDeleteId(null); }}
        type="confirm"
        title={isKorean ? '기록 삭제' : 'Delete Record'}
        description={isKorean ? '이 추천 기록을 삭제하시겠어요?' : 'Delete this recommendation?'}
        confirmText={isKorean ? '삭제' : 'Delete'}
        cancelText={isKorean ? '취소' : 'Cancel'}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    }>
      <HistoryContent />
    </Suspense>
  );
}
