'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Crown, Zap, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

export default function UserInfoPage() {
  const router = useRouter();
  const { user, loading, initialized, setLoading, initializeUser } = useUserStore();
  const { language, t } = useI18n();
  const isKorean = language === 'ko';

  useEffect(() => {
    if (!initialized) {
      setLoading(true);
      initializeUser().finally(() => {
        setLoading(false);
      });
    }
  }, [initialized, setLoading, initializeUser]);

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

          {/* 사용자 정보 */}
          <div className="space-y-4">
            <h3 className={cn(
              "text-xs text-gold-dim uppercase tracking-widest font-light",
              isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
            )}>
              {t('userInfo.accountInfo')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 이메일 */}
              <div className="p-4 bg-secondary border border-border rounded-lg">
                <p className={cn(
                  "text-xs text-muted-foreground uppercase tracking-widest font-light mb-2",
                  isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
                )}>
                  {t('common.email')}
                </p>
                <p className="text-foreground font-light break-all">{email}</p>
              </div>

              {/* 이름 */}
              <div className="p-4 bg-secondary border border-border rounded-lg">
                <p className={cn(
                  "text-xs text-muted-foreground uppercase tracking-widest font-light mb-2",
                  isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
                )}>
                  {t('common.name')}
                </p>
                <p className="text-foreground font-light">{username}</p>
              </div>

              {/* ID */}
              <div className="p-4 bg-secondary border border-border rounded-lg">
                <p className={cn(
                  "text-xs text-muted-foreground uppercase tracking-widest font-light mb-2",
                  isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
                )}>
                  {t('userInfo.userId')}
                </p>
                <p className="text-foreground font-light text-sm">{id}</p>
              </div>

              {/* 권한 */}
              <div className="p-4 bg-secondary border border-border rounded-lg">
                <p className={cn(
                  "text-xs text-muted-foreground uppercase tracking-widest font-light mb-2",
                  isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
                )}>
                  {t('userInfo.role')}
                </p>
                <p className="text-foreground font-light">{Array.isArray(roles) ? roles.join(', ') : roles}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 액션 버튼들 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
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

          {/* 설정 */}
          <Button
            onClick={() => router.push('/settings')}
            variant="outline"
            className={cn(
              "border border-border text-gold hover:bg-gold/10 hover:border-gold/40 font-semibold py-3 rounded-lg transition-all duration-300",
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
