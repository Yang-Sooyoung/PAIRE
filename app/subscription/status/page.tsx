'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Check } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function SubscriptionStatusPage() {
  const router = useRouter();
  const { user, token } = useUserStore();
  const { language, t } = useI18n();
  const isKorean = language === 'ko';
  const [loading, setLoading] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }

    // 구독 정보 조회
    (async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
        
        const response = await fetch(`${API_URL}/subscription/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSubscriptionInfo(data);
          setFetchError(false);
        } else if (response.status === 404) {
          // 404는 구독 정보가 없는 정상 상황
          setFetchError(false);
        } else {
          setFetchError(true);
        }
      } catch (err: any) {
        console.error('Failed to fetch subscription status:', err);
        setFetchError(true);
      }
    })();
  }, [user, token, router]);

  const handleCancel = async () => {
    if (!token) return;

    try {
      setLoading(true);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      
      const response = await fetch(`${API_URL}/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || (isKorean ? '구독 취소 실패' : 'Failed to cancel subscription'));
      }

      alert(isKorean ? '구독이 취소되었습니다.' : 'Subscription cancelled.');
      router.push('/user-info');
    } catch (err: any) {
      console.error('Cancel subscription error:', err);
      alert(err?.message || (isKorean ? '구독 취소 실패' : 'Failed to cancel subscription'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      {/* 헤더 */}
      <div className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gold hover:text-gold-light transition"
            title={t('common.back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={cn(
            "text-2xl font-light text-foreground tracking-wide",
            isKorean && "font-[var(--font-noto-kr)] tracking-normal"
          )}>
            {isKorean ? '구독 관리' : 'Manage Subscription'}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className={cn(
            "text-muted-foreground",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean ? '현재 PREMIUM 멤버십 중입니다' : 'You are currently a PREMIUM member'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-8 mb-8"
        >
          <div className="space-y-6">
            <div>
              <h2 className={cn(
                "text-sm font-semibold text-muted-foreground mb-2",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {isKorean ? '현재 플랜' : 'Current Plan'}
              </h2>
              <p className="text-2xl font-light text-foreground">PREMIUM</p>
            </div>

            {subscriptionInfo && subscriptionInfo.nextBillingDate && (
              <div>
                <h2 className={cn(
                  "text-sm font-semibold text-muted-foreground mb-2",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {isKorean ? '갱신 날짜' : 'Renewal Date'}
                </h2>
                <p className="text-foreground">
                  {new Date(subscriptionInfo.nextBillingDate).toLocaleDateString(isKorean ? 'ko-KR' : 'en-US')}
                </p>
              </div>
            )}

            {subscriptionInfo && subscriptionInfo.paymentMethod && (
              <div>
                <h2 className={cn(
                  "text-sm font-semibold text-muted-foreground mb-2",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {isKorean ? '결제 수단' : 'Payment Method'}
                </h2>
                <p className="text-foreground">
                  {subscriptionInfo.paymentMethod}
                </p>
              </div>
            )}

            <div className="pt-6 border-t border-border">
              <h2 className={cn(
                "text-sm font-semibold text-muted-foreground mb-4",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {isKorean ? 'PREMIUM 혜택' : 'PREMIUM Benefits'}
              </h2>
              <ul className={cn(
                "space-y-2 text-foreground",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-gold" />
                  {isKorean ? '무제한 음료 추천' : 'Unlimited drink recommendations'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-gold" />
                  {isKorean ? '상황별 맞춤 추천' : 'Personalized recommendations'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-gold" />
                  {isKorean ? '추천 히스토리 저장' : 'Recommendation history'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-gold" />
                  {isKorean ? '즐겨찾기 기능' : 'Favorites feature'}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-gold" />
                  {isKorean ? '공유 기능' : 'Sharing feature'}
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3"
        >
          <Button
            onClick={() => router.push('/')}
            className={cn(
              "flex-1 bg-gold hover:bg-gold-light text-background py-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {isKorean ? '추천 계속하기' : 'Continue Recommendations'}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className={cn(
                  "flex-1 bg-destructive/30 hover:bg-destructive/50 text-destructive border border-destructive py-3",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
              >
                {isKorean ? '구독 취소' : 'Cancel Subscription'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className={cn(
                  "text-foreground",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {isKorean ? '구독을 취소하시겠어요?' : 'Cancel subscription?'}
                </AlertDialogTitle>
                <AlertDialogDescription className={cn(
                  "text-muted-foreground",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {isKorean 
                    ? '구독을 취소하면 다음 갱신일부터 FREE 플랜으로 변경됩니다. 현재 남은 기간은 계속 사용할 수 있습니다.'
                    : 'If you cancel your subscription, it will change to the FREE plan from the next renewal date. You can continue using it for the remaining period.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-3">
                <AlertDialogCancel className={cn(
                  "bg-secondary hover:bg-secondary/80 text-foreground border-border",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {isKorean ? '계속 구독' : 'Keep Subscription'}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancel}
                  disabled={loading}
                  className={cn(
                    "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
                    isKorean && "font-[var(--font-noto-kr)]"
                  )}
                >
                  {loading ? (isKorean ? '처리 중...' : 'Processing...') : (isKorean ? '구독 취소' : 'Cancel')}
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/user-info')}
            className={cn(
              "text-muted-foreground hover:text-foreground transition",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {isKorean ? '돌아가기' : 'Go Back'}
          </button>
        </div>
      </div>
    </div>
  );
}
