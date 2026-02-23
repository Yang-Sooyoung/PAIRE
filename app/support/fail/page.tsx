'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

export default function SupportFailPage() {
  const router = useRouter();
  const { language } = useI18n();
  const isKorean = language === 'ko';

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
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
          <div className="bg-destructive/20 border border-destructive/30 rounded-full p-4">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>
        </motion.div>

        <h1 className={cn(
          "text-3xl font-light text-foreground mb-2",
          isKorean && "font-[var(--font-noto-kr)]"
        )}>
          {isKorean ? '결제 실패' : 'Payment Failed'}
        </h1>

        <p className={cn(
          "text-muted-foreground mb-8",
          isKorean && "font-[var(--font-noto-kr)]"
        )}>
          {isKorean ? (
            <>
              결제가 취소되었거나 오류가 발생했습니다.
              <br />
              다시 시도해주세요.
            </>
          ) : (
            <>
              Payment was cancelled or an error occurred.
              <br />
              Please try again.
            </>
          )}
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => router.push('/support')}
            className={cn(
              "w-full bg-gold hover:bg-gold-light text-background py-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {isKorean ? '다시 시도' : 'Try Again'}
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className={cn(
              "w-full border-border text-foreground hover:bg-secondary py-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {isKorean ? '홈으로 이동' : 'Go Home'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
