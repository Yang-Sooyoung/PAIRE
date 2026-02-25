'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Crown, Zap, ArrowRight, Sparkles, Coins } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

export default function UserInfoPage() {
  const router = useRouter();
  const { user, loading, initialized, setLoading, initializeUser } = useUserStore();
  const { language, t } = useI18n();
  const isKorean = language === 'ko';
  const [credits, setCredits] = useState(0);
  const [dailyUsage, setDailyUsage] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!initialized) {
      setLoading(true);
      initializeUser().finally(() => {
        setLoading(false);
      });
    }
  }, [initialized, setLoading, initializeUser]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;

      try {
        const currentToken = useUserStore.getState().token;
        if (!currentToken) return;

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

        // 크레딧 잔액 조회
        const creditResponse = await fetch(`${API_URL}/credit/balance`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        if (creditResponse.ok) {
          const creditData = await creditResponse.json();
          setCredits(creditData.credits || 0);
        }

        // 오늘 사용한 추천 횟수 조회
        const historyResponse = await fetch(`${API_URL}/recommendation/history?limit=100&offset=0`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const todayCount = historyData.recommendations?.filter((rec: any) => {
            const recDate = new Date(rec.createdAt);
            recDate.setHours(0, 0, 0, 0);
            return recDate.getTime() === today.getTime();
          }).length || 0;

          setDailyUsage(todayCount);
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user) {
      fetchUserStats();
    }
  }, [user]);

  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-foreground text-2xl font-light mb-4">PAIRÉ</div>
          <div className={cn(
            "text-muted-foreground text-sm",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {t('common.loading')}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className={cn(
            "text-2xl font-light text-foreground mb-6",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {t('userInfo.loginRequired')}
          </h2>
          <Button
            onClick={() => router.push('/login')}
            className={cn(
              "bg-gold hover:bg-gold-light text-background font-semibold px-8 py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold/20",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {t('userInfo.goToLogin')}
          </Button>
        </motion.div>
      </div>
    );
  }

  const { id, email, username, roles, membership } = user;
  const isPremium = membership === 'PREMIUM';

  return (
    <div className="min-h-screen bg-background px-4 py-12 relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto relative z-10"
      >
        {/* 헤더 */}
        <div className="text-center mb-12">
          <button
            onClick={() => router.push('/')}
            className="inline-block hover:opacity-80 transition mb-6"
            title={isKorean ? '홈으로 이동' : 'Go to Home'}
          >
            <h1 className="text-4xl font-light text-foreground tracking-widest">PAIRÉ</h1>
          </button>
          <p className={cn(
            "text-gold-dim text-sm tracking-wide font-light",
            isKorean && "font-[var(--font-noto-kr)] tracking-normal"
          )}>
            {t('userInfo.title')}
          </p>
        </div>

        {/* 메인 카드 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-card backdrop-blur-sm border border-border rounded-2xl p-8 mb-8 space-y-8"
        >
          {/* 멤버십 상태 */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 rounded-xl">
            <div className="flex items-center gap-4">
              {isPremium ? (
                <Crown className="w-8 h-8 text-gold" />
              ) : (
                <Zap className="w-8 h-8 text-gold-dim" />
              )}
              <div>
                <p className={cn(
                  "text-xs text-gold-dim uppercase tracking-widest font-light",
                  isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
                )}>
                  {t('userInfo.membership')}
                </p>
                <p className="text-2xl font-light text-foreground">
                  {isPremium ? 'PREMIUM' : 'FREE'}
                </p>
              </div>
            </div>
            {!isPremium && (
              <Button
                onClick={() => router.push('/subscription')}
                className={cn(
                  "bg-gold hover:bg-gold-light text-background font-semibold px-6 py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 flex items-center gap-2",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
              >
                {t('userInfo.upgrade')} <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* 이용 현황 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 크레딧 잔액 */}
            <div className="p-6 bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="w-5 h-5 text-gold" />
                <p className={cn(
                  "text-xs text-gold uppercase tracking-widest font-light",
                  isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
                )}>
                  {isKorean ? '보유 크레딧' : 'Credits'}
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-light text-gold">
                  {loadingStats ? '...' : credits}
                </p>
                <p className={cn(
                  "text-sm text-muted-foreground",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {isKorean ? '회' : 'uses'}
                </p>
              </div>
              <Button
                onClick={() => router.push('/subscription?tab=credit')}
                variant="ghost"
                className={cn(
                  "mt-3 text-xs text-gold hover:text-gold-light hover:bg-gold/10 p-0 h-auto",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
              >
                {isKorean ? '충전하기 →' : 'Buy Credits →'}
              </Button>
            </div>

            {/* 오늘 무료 이용 */}
            {!isPremium && (
              <div className="p-6 bg-secondary border border-border rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-gold-dim" />
                  <p className={cn(
                    "text-xs text-muted-foreground uppercase tracking-widest font-light",
                    isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
                  )}>
                    {isKorean ? '오늘 무료 이용' : 'Today Free'}
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-light text-foreground">
                    {loadingStats ? '...' : `${dailyUsage}/1`}
                  </p>
                </div>
                <p className={cn(
                  "mt-2 text-xs text-muted-foreground",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {isKorean ? '매일 자정 초기화' : 'Resets daily'}
                </p>
              </div>
            )}

            {/* PREMIUM 무제한 */}
            {isPremium && (
              <div className="p-6 bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="w-5 h-5 text-gold" />
                  <p className={cn(
                    "text-xs text-gold uppercase tracking-widest font-light",
                    isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
                  )}>
                    {isKorean ? '오늘 이용' : 'Today Usage'}
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-light text-gold">
                    {loadingStats ? '...' : dailyUsage}
                  </p>
                  <p className={cn(
                    "text-sm text-gold-dim",
                    isKorean && "font-[var(--font-noto-kr)]"
                  )}>
                    / ∞
                  </p>
                </div>
                <p className={cn(
                  "mt-2 text-xs text-gold-dim",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {isKorean ? '무제한 이용 가능' : 'Unlimited'}
                </p>
              </div>
            )}
          </div>

          {/* 내 활동 */}
          <div className="space-y-4">
            <h3 className={cn(
              "text-xs text-gold-dim uppercase tracking-widest font-light",
              isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
            )}>
              {isKorean ? '내 활동' : 'My Activity'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 추천 히스토리 */}
              <button
                onClick={() => {
                  if (isPremium) {
                    router.push('/history');
                  } else {
                    router.push('/subscription');
                  }
                }}
                className="p-4 bg-secondary border border-border rounded-lg hover:bg-gold/5 hover:border-gold/30 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className={cn(
                    "text-xs text-muted-foreground uppercase tracking-widest font-light",
                    isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
                  )}>
                    {isKorean ? '추천 히스토리' : 'History'}
                  </p>
                  {!isPremium && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold">
                      PREMIUM
                    </span>
                  )}
                </div>
                <p className="text-foreground font-light group-hover:text-gold transition">
                  {isKorean ? '내 추천 기록 보기' : 'View my recommendations'}
                </p>
              </button>

              {/* 즐겨찾기 */}
              <button
                onClick={() => {
                  if (isPremium) {
                    router.push('/favorites');
                  } else {
                    router.push('/subscription');
                  }
                }}
                className="p-4 bg-secondary border border-border rounded-lg hover:bg-gold/5 hover:border-gold/30 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className={cn(
                    "text-xs text-muted-foreground uppercase tracking-widest font-light",
                    isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
                  )}>
                    {isKorean ? '즐겨찾기' : 'Favorites'}
                  </p>
                  {!isPremium && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold">
                      PREMIUM
                    </span>
                  )}
                </div>
                <p className="text-foreground font-light group-hover:text-gold transition">
                  {isKorean ? '저장한 음료 보기' : 'View saved drinks'}
                </p>
              </button>

              {/* 수집한 스티커 */}
              <button
                onClick={() => router.push('/stickers')}
                className="p-4 bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 rounded-lg hover:border-gold/50 transition-all text-left group relative overflow-hidden"
              >
                {/* 반짝임 효과 */}
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    background: [
                      'radial-gradient(circle at 0% 0%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
                      'radial-gradient(circle at 100% 100%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
                      'radial-gradient(circle at 0% 0%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <p className={cn(
                      "text-xs text-gold uppercase tracking-widest font-light",
                      isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
                    )}>
                      {isKorean ? '수집한 스티커' : 'Stickers'}
                    </p>
                    <Sparkles className="w-4 h-4 text-gold" />
                  </div>
                  <p className="text-foreground font-light group-hover:text-gold transition">
                    {isKorean ? '요정의 선물 모아보기 ✨' : 'Collect fairy gifts ✨'}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </motion.div>

        {/* 액션 버튼들 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-4"
        >
          {/* 첫 번째 줄 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 추천 시작 */}
            <Button
              onClick={() => router.push('/')}
              className={cn(
                "bg-gold hover:bg-gold-light text-background font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold/20",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              {t('userInfo.startRecommendation')}
            </Button>

            {/* 구독 관리 */}
            <Button
              onClick={() => {
                if (isPremium) {
                  router.push('/subscription/status');
                } else {
                  router.push('/subscription');
                }
              }}
              variant="outline"
              className={cn(
                "border border-border text-gold hover:bg-gold/10 hover:border-gold/40 font-semibold py-3 rounded-lg transition-all duration-300",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              {isPremium ? t('userInfo.manageSubscription') : t('userInfo.subscribe')}
            </Button>
          </div>

          {/* 두 번째 줄 */}
          <Button
            onClick={() => router.push('/settings')}
            variant="outline"
            className={cn(
              "w-full border border-border text-gold hover:bg-gold/10 hover:border-gold/40 font-semibold py-3 rounded-lg transition-all duration-300",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {t('userInfo.settings')}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
