'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function SubscriptionCancelPage() {
  const router = useRouter();
  const { language, t } = useI18n();
  const isKorean = language === 'ko';

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
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-full p-4">
            <AlertCircle className="w-12 h-12 text-yellow-500" />
          </div>
        </motion.div>

        <h1 className={cn(
          "text-3xl font-light text-foreground mb-2",
          isKorean && "font-[var(--font-noto-kr)]"
        )}>
          {isKorean ? '구독 취소됨' : 'Subscription Cancelled'}
        </h1>
        <p className={cn(
          "text-muted-foreground mb-8",
          isKorean && "font-[var(--font-noto-kr)]"
        )}>
          {isKorean ? (
            <>
              구독 결제가 취소되었습니다.
              <br />
              언제든지 다시 구독할 수 있습니다.
            </>
          ) : (
            <>
              Your subscription payment was cancelled.
              <br />
              You can subscribe again anytime.
            </>
          )}
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => router.push('/subscription')}
            className={cn(
              "w-full bg-gold hover:bg-gold-light text-background py-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {isKorean ? '다시 구독하기' : 'Subscribe Again'}
          </Button>
          <Button
            onClick={() => router.push('/user-info')}
            variant="outline"
            className={cn(
              "w-full border-border text-foreground hover:bg-secondary py-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {isKorean ? '돌아가기' : 'Go Back'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
