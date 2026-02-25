'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

export default function CreditFailPage() {
  const router = useRouter();
  const { language } = useI18n();
  const isKorean = language === 'ko';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-red-500/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="mb-8"
        >
          <XCircle className="w-24 h-24 text-red-500 mx-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h1 className={cn(
            "text-3xl font-bold text-foreground mb-4",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean ? '결제 실패' : 'Payment Failed'}
          </h1>
          <p className={cn(
            "text-muted-foreground mb-8",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean 
              ? '결제 처리 중 문제가 발생했습니다.\n다시 시도해 주세요.'
              : 'There was an issue processing your payment.\nPlease try again.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <Button
            onClick={() => router.push('/subscription')}
            className={cn(
              "w-full bg-gold hover:bg-gold-light text-background font-semibold py-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {isKorean ? '다시 시도하기' : 'Try Again'}
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className={cn(
              "w-full border-border text-foreground flex items-center justify-center gap-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            {isKorean ? '홈으로 돌아가기' : 'Back to Home'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
