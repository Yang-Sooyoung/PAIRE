'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { getRecommendationHistory, deleteRecommendation } from '@/app/api/recommendation';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Wine, Loader2, Lock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import { translateOccasion, translateTaste, getDrinkDisplayName } from '@/lib/drink-translations';

interface HistoryItem {
  id: string;
  occasion: string;
  tastes: string[];
  drinks: any[];
  imageUrl?: string;
  fairyMessage?: string;
  createdAt: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const { user, refreshTokenIfNeeded } = useUserStore();
  const { language, t } = useI18n();
  const isKorean = language === 'ko';
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // FREE 사용자는 접근 불가
    if (user.membership === 'FREE') {
      return;
    }

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

  const handleDelete = async (id: string) => {
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
            <button
              onClick={() => router.back()}
              className="text-gold hover:text-gold-light transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className={cn(
              "text-lg font-medium text-foreground tracking-wide",
              isKorean && "font-[var(--font-noto-kr)] tracking-normal"
            )}>
              {isKorean ? '추천 히스토리' : 'Recommendation History'}
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
              {isKorean ? 'PREMIUM 전용 기능' : 'PREMIUM Feature'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-8",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '추천 히스토리는 PREMIUM 멤버만 이용할 수 있습니다.'
                : 'Recommendation history is available for PREMIUM members only.'}
            </p>
            <Button
              onClick={() => router.push('/subscription')}
              className={cn(
                "bg-gold hover:bg-gold-light text-background",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              {isKorean ? 'PREMIUM 구독하기' : 'Subscribe to PREMIUM'}
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
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      <div className="bg-card/50 backdrop-blur-sm border-b border-border sticky-header">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gold hover:text-gold-light transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={cn(
            "text-lg font-medium text-foreground tracking-wide",
            isKorean && "font-[var(--font-noto-kr)] tracking-normal"
          )}>
            {isKorean ? '추천 히스토리' : 'Recommendation History'}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Wine className="w-16 h-16 text-gold/30 mx-auto mb-4" />
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '아직 추천 기록이 없습니다.' : 'No recommendations yet.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-4 hover:border-gold/30 transition"
              >
                <div
                  className="flex gap-4 cursor-pointer"
                  onClick={() => router.push(`/history/${item.id}`)}
                >
                  {item.imageUrl && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                      <img
                        src={item.imageUrl}
                        alt="Food"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString(isKorean ? 'ko-KR' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className={cn(
                      "text-foreground font-medium mb-2",
                      isKorean && "font-[var(--font-noto-kr)]"
                    )}>
                      {translateOccasion(item.occasion, language)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.drinks.slice(0, 3).map((drink: any, i: number) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold"
                        >
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
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    disabled={deletingId === item.id}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition px-2 py-1 rounded"
                  >
                    {deletingId === item.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />
                    }
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