'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useUserStore } from '@/app/store/userStore';

function SubscriptionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useI18n();
  const isKorean = language === 'ko';
  const [processing, setProcessing] = useState(true);
  const bonusDays = parseInt(searchParams.get('bonus') || '0');

  useEffect(() => {
    const confirm = async () => {
      // Stripe에서 돌아올 때 store가 초기화되어 있으므로 먼저 initializeUser 실행
      const { initializeUser } = useUserStore.getState();
      await initializeUser();

      const sessionId = searchParams.get('session_id');

      if (sessionId) {
        try {
          // store 또는 localStorage에서 토큰 가져오기
          const token = useUserStore.getState().token || localStorage.getItem('accessToken');
          if (!token) {
            console.error('[subscription/success] No token available');
            setProcessing(false);
            router.push('/login');
            return;
          }
          const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');
          const res = await fetch(`${BASE_URL}/stripe/confirm-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ sessionId }),
          });
          const data = await res.json();
          console.log('[subscription/success] confirm-session response:', data);
          if (!res.ok) {
            console.error('[subscription/success] confirm-session failed:', data);
          }
          // 멤버십 반영을 위해 유저 정보 재갱신
          await initializeUser();
        } catch (e) {
          console.error('Confirm session error:', e);
        }
      }

      setProcessing(false);
      setTimeout(() => router.push('/user-info'), 3000);
    };
    confirm();
  }, [searchParams, router]);

  if (processing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-gold animate-pulse mx-auto mb-4" />
          <p className={cn("text-muted-foreground", isKorean && "font-[var(--font-noto-kr)]")}>
            {isKorean ? '구독을 활성화하는 중...' : 'Activating subscription...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10 max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-6 flex justify-center"
        >
          <div className="bg-green-500/20 border border-green-500 rounded-full p-4">
            <Check className="w-12 h-12 text-green-500" />
          </div>
        </motion.div>

        <h1 className={cn(
          "text-3xl font-light text-foreground mb-2",
          isKorean && "font-[var(--font-noto-kr)]"
        )}>
          {isKorean ? '구독 완료' : 'Subscription Complete'}
        </h1>
        <p className={cn(
          "text-muted-foreground mb-8",
          isKorean && "font-[var(--font-noto-kr)]"
        )}>
          {isKorean ? (
            <>
              PREMIUM 멤버십이 활성화되었습니다.
              <br />
              이제 무제한으로 추천을 받을 수 있어요.
            </>
          ) : (
            <>
              Your PREMIUM membership is now active.
              <br />
              You can now get unlimited recommendations.
            </>
          )}
        </p>

        {bonusDays > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 p-4 bg-gold/10 border border-gold/30 rounded-xl"
          >
            <p className={cn(
              "text-gold text-sm font-medium",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              🎁 {isKorean
                ? `이전 구독의 남은 기간 ${bonusDays}일이 추가되었습니다!`
                : `${bonusDays} remaining days from your previous subscription have been added!`}
            </p>
          </motion.div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => router.push('/')}
            className={cn(
              "w-full bg-gold hover:bg-gold-light text-background py-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {isKorean ? '추천 시작하기' : 'Start Recommendations'}
          </Button>
          <Button
            onClick={() => router.push('/user-info')}
            variant="outline"
            className={cn(
              "w-full border-border text-foreground hover:bg-secondary py-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {isKorean ? '내 정보 보기' : 'View My Info'}
          </Button>
        </div>

        <p className={cn(
          "text-muted-foreground text-sm mt-6",
          isKorean && "font-[var(--font-noto-kr)]"
        )}>
          {isKorean ? '3초 후 자동으로 이동합니다...' : 'Redirecting in 3 seconds...'}
        </p>
      </motion.div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-gold animate-pulse mx-auto" />
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
