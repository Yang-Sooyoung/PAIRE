'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

function SupportSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useI18n();
  const isKorean = language === 'ko';
  const [processing, setProcessing] = useState(true);

  const amount = searchParams.get('amount');
  const orderId = searchParams.get('orderId');
  const paymentKey = searchParams.get('paymentKey');

  useEffect(() => {
    // 결제 승인 처리
    const confirmPayment = async () => {
      if (!orderId || !paymentKey || !amount) {
        setProcessing(false);
        return;
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
        
        const response = await fetch(`${API_URL}/payment/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            orderId,
            paymentKey,
            amount: parseInt(amount),
          }),
        });

        if (!response.ok) {
          throw new Error('Payment confirmation failed');
        }

        console.log('Payment confirmed successfully');
      } catch (error) {
        console.error('Payment confirmation error:', error);
      } finally {
        setProcessing(false);
      }
    };

    confirmPayment();
  }, [orderId, paymentKey, amount]);

  if (processing) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center relative z-10"
        >
          <Loader2 className="w-16 h-16 text-gold animate-spin mx-auto mb-4" />
          <p className={cn(
            "text-foreground text-lg",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean ? '결제 처리 중...' : 'Processing payment...'}
          </p>
        </motion.div>
      </div>
    );
  }

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
          <div className="bg-gold/20 border border-gold/30 rounded-full p-4">
            <Heart className="w-12 h-12 text-gold fill-gold" />
          </div>
        </motion.div>

        <h1 className={cn(
          "text-3xl font-light text-foreground mb-2",
          isKorean && "font-[var(--font-noto-kr)]"
        )}>
          {isKorean ? '감사합니다!' : 'Thank You!'}
        </h1>
        
        {amount && (
          <p className="text-gold text-2xl font-semibold mb-4">
            {parseInt(amount).toLocaleString()}원
          </p>
        )}

        <p className={cn(
          "text-muted-foreground mb-8",
          isKorean && "font-[var(--font-noto-kr)]"
        )}>
          {isKorean ? (
            <>
              소중한 후원 감사드립니다.
              <br />
              더 나은 서비스로 보답하겠습니다 💛
            </>
          ) : (
            <>
              Thank you for your generous support.
              <br />
              We'll keep improving PAIRÉ 💛
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
            {isKorean ? '홈으로 이동' : 'Go Home'}
          </Button>
          <Button
            onClick={() => router.push('/support')}
            variant="outline"
            className={cn(
              "w-full border-border text-foreground hover:bg-secondary py-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {isKorean ? '개발자 지원 페이지' : 'Support Page'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function SupportSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-gold animate-spin" />
      </div>
    }>
      <SupportSuccessContent />
    </Suspense>
  );
}
