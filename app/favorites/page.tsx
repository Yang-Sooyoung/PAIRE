'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { getFavorites, removeFavorite } from '@/app/api/favorite';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Trash2, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

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
    foodPairings?: string[];
    occasions?: string[];
    tastes?: string[];
  };
}

export default function FavoritesPage() {
  const router = useRouter();
  const { user, refreshTokenIfNeeded } = useUserStore();
  const { language, t } = useI18n();
  const isKorean = language === 'ko';
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    type: 'confirm'
    title: string
    description: string
    onConfirm?: () => void
  }>({
    type: 'confirm',
    title: '',
    description: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // FREE 사용자는 접근 불가
    if (user.membership === 'FREE') {
      return;
    }

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

  const handleRemove = async (drinkId: string) => {
    setDialogConfig({
      type: 'confirm',
      title: t('favorites.removeFavorite'),
      description: t('favorites.removeConfirm'),
      onConfirm: async () => {
        setShowDialog(false);
        setRemovingId(drinkId);
        try {
          await removeFavorite(drinkId);
          setFavorites((prev) => prev.filter((fav) => fav.drinkId !== drinkId));
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
      }
    });
    setShowDialog(true);
  };

  // FREE 사용자 화면
  if (user && user.membership === 'FREE') {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
        </div>

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
              {isKorean ? '즐겨찾기' : 'Favorites'}
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-12 relative z-10 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-gold/10 border border-gold/30 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Lock className="w-10 h-10 text-gold" />
            </div>
            <h2 className={cn(
              "text-2xl font-light text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {t('favorites.premiumOnly')}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-8",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {t('favorites.premiumDesc')}
            </p>
            <Button
              onClick={() => router.push('/subscription')}
              className={cn(
                "bg-gold hover:bg-gold-light text-background",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              {t('favorites.subscribeToPremium')}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

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
            {t('favorites.title')}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Heart className="w-16 h-16 text-gold/30 mx-auto mb-4" />
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {t('favorites.noFavorites')}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {favorites.map((favorite, index) => (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-gold/30 transition"
              >
                <div 
                  className="relative aspect-square cursor-pointer"
                  onClick={() => router.push(`/favorites/${favorite.drinkId}`)}
                >
                  {favorite.drinkImage ? (
                    <img
                      src={favorite.drinkImage}
                      alt={favorite.drinkName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <Heart className="w-12 h-12 text-gold/30" />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(favorite.drinkId);
                    }}
                    disabled={removingId === favorite.drinkId}
                    className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition z-10"
                  >
                    {removingId === favorite.drinkId ? (
                      <Loader2 className="w-4 h-4 text-gold animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-gold" />
                    )}
                  </button>
                </div>
                <div 
                  className="p-3 cursor-pointer"
                  onClick={() => router.push(`/favorites/${favorite.drinkId}`)}
                >
                  <h3 className={cn(
                    "text-foreground font-medium mb-1 truncate",
                    isKorean && "font-[var(--font-noto-kr)] text-sm"
                  )}>
                    {favorite.drinkName}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {favorite.drinkType}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Dialog */}
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
