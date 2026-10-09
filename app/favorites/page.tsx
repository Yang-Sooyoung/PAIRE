'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { getFavorites, removeFavorite, getDrinkDetail } from '@/app/api/favorite';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Trash2, Loader2, Lock, Share2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import { translateDrinkType, translateTastingNote, formatDrinkPriceByRegion, getDrinkDisplayName } from '@/lib/drink-translations';
import { toast } from 'sonner';
import { generateShoppingLink, detectCountryByIP, openExternalLink } from '@/lib/region-detector';
import { generateCoupangLink } from '@/lib/coupang-partners';
import { ShareModal } from '@/components/paire/share-modal';

interface Favorite {
  id: string;
  drinkId: string;
  drinkName: string;
  drinkType: string;
  drinkImage: string | null;
  createdAt: string;
  drink?: {
    id: string;
    name: string;
    type: string;
    description: string;
    tastingNotes: string[];
    image: string | null;
    price: string;
    purchaseUrl?: string;
  };
}

interface DrinkDetail {
  id: string;
  name: string;
  nameKo?: string;
  type: string;
  description: string;
  tastingNotes: string[];
  image: string;
  price: string;
  purchaseUrl?: string;
  alcohol?: string;
  origin?: string;
  pairing?: string[];
  servingTemp?: string;
}

function FavoritesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const detailId = searchParams.get('id');

  const { user, refreshTokenIfNeeded } = useUserStore();
  const { language, t } = useI18n();
  const isKorean = language === 'ko';

  // 목록 상태
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    type: 'confirm';
    title: string;
    description: string;
    onConfirm?: () => void;
  }>({ type: 'confirm', title: '', description: '' });

  // 상세 상태
  const [drink, setDrink] = useState<DrinkDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [isKoreaRegion, setIsKoreaRegion] = useState<boolean | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    detectCountryByIP().then(country => setIsKoreaRegion(country === 'KR'));
  }, []);

  // 목록 불러오기
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.membership === 'FREE') return;

    const fetchFavorites = async () => {
      try {
        const response = await getFavorites();
        setFavorites(response.favorites || []);
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, refreshTokenIfNeeded, router]);

  // 상세 불러오기
  useEffect(() => {
    if (!detailId || !user) return;

    const fetchDrinkDetail = async () => {
      setDetailLoading(true);
      try {
        const [detailResponse, favoritesResponse] = await Promise.all([
          getDrinkDetail(detailId),
          getFavorites(),
        ]);
        const drinkData = detailResponse.drink;
        const favoriteEntry = favoritesResponse.favorites?.find(
          (f: any) => f.drinkId === detailId
        );

        if (drinkData) {
          // DB에서 찾은 경우: 저장된 한글명 보완, 이미지 없으면 스냅샷으로 보완
          if (favoriteEntry?.drinkName) {
            drinkData.nameKo = favoriteEntry.drinkName;
          }
          if (!drinkData.image && favoriteEntry?.drinkImage) {
            drinkData.image = favoriteEntry.drinkImage;
          }
          setDrink(drinkData);
        } else if (favoriteEntry) {
          // DB에 없는 Gemini ephemeral 음료: favorites 스냅샷 + join된 drink 데이터로 구성
          const snap = favoriteEntry;
          setDrink({
            id: snap.drinkId,
            name: snap.drink?.name || snap.drinkName,
            nameKo: snap.drinkName,
            type: (snap.drinkType && snap.drinkType !== 'unknown') ? snap.drinkType : (snap.drink?.type || ''),
            description: snap.drink?.description || '',
            tastingNotes: snap.drink?.tastingNotes || [],
            image: snap.drinkImage || snap.drink?.image || '',
            price: snap.drink?.price || '',
            purchaseUrl: snap.drink?.purchaseUrl,
          });
        } else {
          toast.error(t('favorites.failedToLoad'));
          router.push('/favorites');
        }
      } catch (error) {
        console.error('Failed to fetch drink detail:', error);
        toast.error(t('favorites.failedToLoad'));
        router.push('/favorites');
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDrinkDetail();
  }, [detailId, user, router]);

  const handleRemove = (drinkId: string) => {
    setDialogConfig({
      type: 'confirm',
      title: t('favorites.removeFavorite'),
      description: t('favorites.removeConfirm'),
      onConfirm: async () => {
        setShowDialog(false);
        setRemovingId(drinkId);
        try {
          await removeFavorite(drinkId);
          setFavorites(prev => prev.filter(fav => fav.drinkId !== drinkId));
        } catch (error: any) {
          setDialogConfig({
            type: 'confirm',
            title: t('favorites.error'),
            description: error.message || t('favorites.failedToRemove'),
          });
          setShowDialog(true);
        } finally {
          setRemovingId(null);
        }
      },
    });
    setShowDialog(true);
  };

  const handleRemoveFavoriteDetail = async () => {
    if (!detailId) return;
    setRemoving(true);
    try {
      await removeFavorite(detailId);
      toast.success(t('favorites.removed'));
      router.push('/favorites');
    } catch (error: any) {
      toast.error(error.message || t('favorites.failedToRemove'));
    } finally {
      setRemoving(false);
    }
  };

  const handlePurchase = async () => {
    if (!drink) return;
    const country = await detectCountryByIP();
    if (country === 'KR') {
      const koreanName = drink.nameKo || (/[가-힣]/.test(drink.name) ? drink.name : null);
      const searchKeyword = koreanName || drink.name;
      const link = generateCoupangLink(searchKeyword);
      await openExternalLink(link);
    } else {
      const link = generateShoppingLink(drink.name, drink.type, country);
      await openExternalLink(link);
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
              {isKorean ? '즐겨찾기' : 'Favorites'}
            </h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-12 relative z-10 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="bg-gold/10 border border-gold/30 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Lock className="w-10 h-10 text-gold" />
            </div>
            <h2 className={cn("text-2xl font-light text-foreground mb-3", isKorean && "font-[var(--font-noto-kr)]")}>
              {t('favorites.premiumOnly')}
            </h2>
            <p className={cn("text-muted-foreground mb-8", isKorean && "font-[var(--font-noto-kr)]")}>
              {t('favorites.premiumDesc')}
            </p>
            <Button onClick={() => router.push('/subscription')}
              className={cn("bg-gold hover:bg-gold-light text-background", isKorean && "font-[var(--font-noto-kr)]")}>
              {t('favorites.subscribeToPremium')}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // 상세 뷰
  if (detailId) {
    if (detailLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-gold animate-spin" />
        </div>
      );
    }

    if (!drink) return null;

    return (
      <div className="min-h-screen bg-background relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
        </div>

        <div className="bg-card/50 backdrop-blur-sm border-b border-border sticky-header">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/favorites')} className="text-gold hover:text-gold-light transition">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className={cn("text-lg font-medium text-foreground tracking-wide", isKorean && "font-[var(--font-noto-kr)] tracking-normal")}>
                {t('favorites.drinkDetails')}
              </h1>
            </div>
            <button onClick={() => setShowShareModal(true)} className="p-2 rounded-full hover:bg-secondary transition">
              <Share2 className="w-5 h-5 text-gold" />
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* 이미지 */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary">
              {drink.image ? (
                <img src={drink.image} alt={drink.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gold/30 text-6xl">🍷</div>
              )}
            </div>

            {/* 기본 정보 */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className={cn("text-2xl font-bold text-foreground mb-2", isKorean && "font-[var(--font-noto-kr)]")}>
                {getDrinkDisplayName(drink.nameKo || drink.name, drink.name, isKorean)}
              </h2>
              <p className={cn("text-lg text-muted-foreground mb-4", isKorean && "font-[var(--font-noto-kr)]")}>
                {translateDrinkType(drink.type, language)}
              </p>
              <p className={cn("text-foreground leading-relaxed mb-4", isKorean && "font-[var(--font-noto-kr)]")}>
                {(() => {
                  const desc = drink.description;
                  if (!isKorean && /[가-힣]/.test(desc)) {
                    return "This drink pairs beautifully with your selection, offering a harmonious balance of flavors.";
                  }
                  return desc;
                })()}
              </p>
              <div className="text-2xl font-bold text-gold">
                {formatDrinkPriceByRegion(drink.price, isKoreaRegion ?? isKorean)}
              </div>
            </div>

            {/* 테이스팅 노트 */}
            {drink.tastingNotes && drink.tastingNotes.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className={cn("text-lg font-semibold text-foreground mb-3", isKorean && "font-[var(--font-noto-kr)]")}>
                  {t('favorites.tastingNotes')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {drink.tastingNotes.map((note, i) => (
                    <span key={i} className={cn("px-3 py-1.5 rounded-full bg-gold/10 text-gold text-sm", isKorean && "font-[var(--font-noto-kr)]")}>
                      {translateTastingNote(note, language)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 상세 정보 */}
            {(drink.alcohol || drink.origin || drink.servingTemp) && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className={cn("text-lg font-semibold text-foreground mb-3", isKorean && "font-[var(--font-noto-kr)]")}>
                  {t('favorites.details')}
                </h3>
                <div className="space-y-3">
                  {drink.alcohol && (
                    <div className="flex justify-between">
                      <span className={cn("text-muted-foreground", isKorean && "font-[var(--font-noto-kr)]")}>{t('favorites.alcohol')}</span>
                      <span className="text-foreground font-medium">{drink.alcohol}</span>
                    </div>
                  )}
                  {drink.origin && (
                    <div className="flex justify-between">
                      <span className={cn("text-muted-foreground", isKorean && "font-[var(--font-noto-kr)]")}>{t('favorites.origin')}</span>
                      <span className="text-foreground font-medium">{drink.origin}</span>
                    </div>
                  )}
                  {drink.servingTemp && (
                    <div className="flex justify-between">
                      <span className={cn("text-muted-foreground", isKorean && "font-[var(--font-noto-kr)]")}>{t('favorites.servingTemp')}</span>
                      <span className="text-foreground font-medium">{drink.servingTemp}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 페어링 */}
            {drink.pairing && drink.pairing.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className={cn("text-lg font-semibold text-foreground mb-3", isKorean && "font-[var(--font-noto-kr)]")}>
                  {t('favorites.recommendedPairing')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {drink.pairing.map((food, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-secondary text-foreground text-sm">{food}</span>
                  ))}
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex gap-3">
              <Button onClick={handleRemoveFavoriteDetail} disabled={removing} variant="outline"
                className={cn("flex-1 border-gold/30 text-gold hover:bg-gold/10", isKorean && "font-[var(--font-noto-kr)]")}>
                {removing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Heart className="w-4 h-4 mr-2 fill-gold" />}
                {t('favorites.removeFavorite')}
              </Button>
              <Button onClick={handlePurchase}
                className={cn("flex-1 bg-gold hover:bg-gold-light text-background", isKorean && "font-[var(--font-noto-kr)]")}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isKoreaRegion ? (isKorean ? '쿠팡에서 구매' : 'Buy on Coupang') : (isKorean ? 'Amazon에서 구매' : 'Buy on Amazon')}
              </Button>
            </div>

            {/* 제휴 면책 조항 */}
            {isKoreaRegion === true && (
              <p className="font-[var(--font-noto-kr)] text-xs text-center text-muted-foreground mt-2 px-2">
                이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
              </p>
            )}
            {isKoreaRegion === false && (
              <p className="text-xs text-center text-muted-foreground mt-2 px-2">
                As an Amazon Associate, we earn from qualifying purchases.
              </p>
            )}
          </motion.div>
        </div>

        {drink && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            drink={{
              name: drink.nameKo || drink.name,
              nameEn: drink.name,
              type: drink.type,
              description: drink.description,
              tastingNotes: drink.tastingNotes,
              image: drink.image,
              price: drink.price,
            }}
            isKorean={isKorean}
            isKoreaRegion={isKoreaRegion}
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
            {t('favorites.title')}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        {favorites.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <Heart className="w-16 h-16 text-gold/30 mx-auto mb-4" />
            <p className={cn("text-muted-foreground", isKorean && "font-[var(--font-noto-kr)]")}>
              {t('favorites.noFavorites')}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {favorites.map((favorite, index) => (
              <motion.div key={favorite.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-gold/30 transition">
                <div className="relative aspect-square cursor-pointer" onClick={() => router.push(`/favorites?id=${favorite.drinkId}`)}>
                  {/* 스냅샷 이미지 우선, 없으면 DB join 이미지, 둘 다 없으면 폴백 */}
                  {(favorite.drinkImage || favorite.drink?.image) ? (
                    <img
                      src={(favorite.drinkImage || favorite.drink?.image) as string}
                      alt={favorite.drinkName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full bg-secondary items-center justify-center"
                    style={{ display: (favorite.drinkImage || favorite.drink?.image) ? 'none' : 'flex' }}
                  >
                    <Heart className="w-12 h-12 text-gold/30" />
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(favorite.drinkId); }}
                    disabled={removingId === favorite.drinkId}
                    className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition z-10"
                  >
                    {removingId === favorite.drinkId
                      ? <Loader2 className="w-4 h-4 text-gold animate-spin" />
                      : <Trash2 className="w-4 h-4 text-gold" />}
                  </button>
                </div>
                <div className="p-3 cursor-pointer" onClick={() => router.push(`/favorites?id=${favorite.drinkId}`)}>
                  <h3 className={cn("text-foreground font-medium mb-1 truncate", isKorean && "font-[var(--font-noto-kr)] text-sm")}>
                    {isKorean
                      ? (favorite.drinkName || favorite.drink?.name || '')
                      : (favorite.drink?.name || favorite.drinkName || '')}
                  </h3>
                  {/* 유효한 타입이 있을 때만 표시 */}
                  {(() => {
                    const type = (favorite.drinkType && favorite.drinkType !== 'unknown')
                      ? favorite.drinkType
                      : favorite.drink?.type;
                    return type ? (
                      <p className={cn("text-xs text-muted-foreground truncate", isKorean && "font-[var(--font-noto-kr)]")}>
                        {translateDrinkType(type, language)}
                      </p>
                    ) : null;
                  })()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CustomDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        type={dialogConfig.type}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmText={isKorean ? '확인' : 'Confirm'}
        cancelText={isKorean ? '취소' : 'Cancel'}
        onConfirm={dialogConfig.onConfirm}
      />
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    }>
      <FavoritesContent />
    </Suspense>
  );
}
