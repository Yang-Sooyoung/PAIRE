'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

function CreditSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserStore();
  const { language } = useI18n();
  const isKorean = language === 'ko';
  const [processing, setProcessing] = useState(true);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');

      console.log('Credit success page - params:', { paymentKey, orderId, amount });

      if (!paymentKey || !orderId || !amount) {
        console.error('Missing payment parameters');
        router.push('/subscription');
        return;
      }

      try {
        // localStorage에서 직접 토큰 가져오기
        let currentToken = useUserStore.getState().token || localStorage.getItem('accessToken');
        
        if (!currentToken) {
          console.error('No token available');
          // 토큰이 없으면 잠시 대기 후 재시도
          await new Promise(resolve => setTimeout(resolve, 1000));
          currentToken = useUserStore.getState().token || localStorage.getItem('accessToken');
          
          if (!currentToken) {
            console.error('Still no token after retry');
            router.push('/login');
            return;
          }
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
        console.log('Confirming payment with API:', API_URL);

        const response = await fetch(`${API_URL}/credit/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: parseInt(amount),
          }),
        });

        console.log('Confirm response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Confirm response data:', data);
          setCredits(data.credits);
          
          // 사용자 정보 새로고침
          const { initializeUser } = useUserStore.getState();
          await initializeUser();
        } else {
          const errorData = await response.text();
          console.error('Confirm failed:', errorData);
          throw new Error('Payment confirmation failed');
        }
      } catch (error: any) {
        console.error('Payment confirmation error:', error);
        router.push('/credit/fail');
      } finally {
        setProcessing(false);
      }
    };

    confirmPayment();
  }, [searchParams, router]);

  if (processing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-gold animate-pulse mx-auto mb-4" />
          <p className={cn(
            "text-muted-foreground",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean ? '결제를 확인하는 중...' : 'Confirming payment...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="mb-8"
        >
          <CheckCircle className="w-24 h-24 text-gold mx-auto" />
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
            {isKorean ? '결제 완료!' : 'Payment Complete!'}
          </h1>
          <div className="bg-card border border-gold/30 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-gold" />
              <span className="text-2xl font-bold text-gold">+{credits}</span>
              <span className={cn(
                "text-gold-dim",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {isKorean ? '크레딧' : 'Credits'}
              </span>
            </div>
            <p className={cn(
              "text-sm text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '크레딧이 충전되었습니다!' : 'Credits have been added to your account!'}
            </p>
          </div>
          <p className={cn(
            "text-muted-foreground mb-8",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean 
              ? '이제 원하는 만큼 추천을 받아보세요!'
              : 'Now you can get recommendations as you need!'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <Button
            onClick={() => router.push('/')}
            className={cn(
              "w-full bg-gold hover:bg-gold-light text-background font-semibold py-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {isKorean ? '추천 받으러 가기' : 'Get Recommendations'}
          </Button>
          <Button
            onClick={() => router.push('/user-info')}
            variant="outline"
            className={cn(
              "w-full border-border text-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {isKorean ? '내 정보로 가기' : 'Go to Profile'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default function CreditSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-gold animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <CreditSuccessContent />
    </Suspense>
  );
}
