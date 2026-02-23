'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const { language, t } = useI18n();
  const isKorean = language === 'ko';

  useEffect(() => {
    // 3초 후 자동으로 홈으로 이동
    const timer = setTimeout(() => {
      router.push('/user-info');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

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
