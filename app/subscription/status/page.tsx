'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { Button } from '@/components/ui/button';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface Subscription {
  id: string;
  membership: string;
  interval: string;
  price: number;
  nextBillingDate: string;
  status: string;
  paymentMethod: string;
  isStripe?: boolean;
}

export default function SubscriptionStatusPage() {
  const router = useRouter();
  const { user, token, setUser, refreshTokenIfNeeded } = useUserStore();
  const { language, t } = useI18n();
  const isKorean = language === 'ko';
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }

    fetchSubscriptionStatus();
  }, [user, token, router]);

  const fetchSubscriptionStatus = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      let currentToken = token;

      try {
        const response = await axios.get(`${API_URL}/subscription/status`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        if (response.data?.subscription) {
          setSubscription(response.data.subscription);
        }
      } catch (error: any) {
        if (error?.response?.status === 401) {
          const newToken = await refreshTokenIfNeeded();
          if (newToken) {
            const response = await axios.get(`${API_URL}/subscription/status`, {
              headers: { Authorization: `Bearer ${newToken}` },
            });
            if (response.data?.subscription) {
              setSubscription(response.data.subscription);
            }
          } else {
            router.push('/login');
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      // 구독 ?�보 ?�으�?구독 ?�이지�?
      router.push('/subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!token) return;

    setCancelling(true);
    setShowCancelDialog(false);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      
      const response = await axios.post(
        `${API_URL}/subscription/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Cancel subscription response:', response.data);
      
      // 구독 ?�보 ?�시 가?�오�?
      await fetchSubscriptionStatus();
      
      // ?�용???�보 ?�데?�트 (멤버??? ?��??��?�?구독 ?�태??CANCELLED)
      if (user) {
        // ?�용???�보 ?�로고침
        try {
          const userResponse = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userResponse.data) {
            setUser(userResponse.data);
          }
        } catch (error) {
          console.error('Failed to refresh user info:', error);
        }
      }
      
      setShowSuccessDialog(true);

      // 2�???구독 ?�이지�??�동
      setTimeout(() => {
        router.push('/subscription');
      }, 2000);
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      setErrorMessage(error.response?.data?.message || (isKorean ? '구독 취소???�패?�습?�다.' : 'Failed to cancel subscription.'));
      setShowErrorDialog(true);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    );
  }

  if (!subscription) {
    return null; // fetchSubscriptionStatus?�서 ?��? redirect 처리
  }

  const nextBillingDate = new Date(subscription.nextBillingDate);
  const formattedDate = nextBillingDate.toLocaleDateString(isKorean ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 배경 ?�과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      {/* ?�더 */}
      <div className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gold hover:text-gold-light transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={cn(
            "text-lg font-medium text-foreground tracking-wide",
            isKorean && "font-[var(--font-noto-kr)] tracking-normal"
          )}>
            {isKorean ? '구독 관�? : 'Manage Subscription'}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12 relative z-10">
        {/* 구독 ?�태 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "border rounded-xl p-8 mb-8",
            subscription.status === 'CANCELLED'
              ? "bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/30"
              : "bg-gradient-to-br from-gold/10 to-gold/5 border-gold/20"
          )}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              subscription.status === 'CANCELLED' ? "bg-orange-500/20" : "bg-gold/20"
            )}>
              <Crown className={cn(
                "w-8 h-8",
                subscription.status === 'CANCELLED' ? "text-orange-500" : "text-gold"
              )} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={cn(
                  "text-2xl font-light text-foreground",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  PREMIUM
                </h2>
                {subscription.status === 'CANCELLED' && (
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-500",
                    isKorean && "font-[var(--font-noto-kr)]"
                  )}>
                    {isKorean ? '?��? ?�정' : 'Cancelled'}
                  </span>
                )}
              </div>
              <p className={cn(
                "text-sm mt-1",
                subscription.status === 'CANCELLED' ? "text-orange-500" : "text-gold",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {subscription.interval === 'WEEKLY'
                  ? (isKorean ? '주간 구독' : 'Weekly Subscription')
                  : subscription.interval === 'MONTHLY' 
                  ? (isKorean ? '?�간 구독' : 'Monthly Subscription')
                  : (isKorean ? '?�간 구독' : 'Annual Subscription')}
              </p>
            </div>
          </div>

          {/* ?��? ?�내 메시지 */}
          {subscription.status === 'CANCELLED' && (
            <div className="mb-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className={cn(
                "text-sm text-foreground",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {isKorean
                  ? `구독???��??�었?�니?? ${formattedDate}까�? PREMIUM ?�택??계속 ?�용?�실 ???�습?�다.`
                  : `Your subscription has been cancelled. You can continue using PREMIUM benefits until ${formattedDate}.`}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {/* 만료???�음 결제??*/}
            <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className={cn(
                  "w-5 h-5",
                  subscription.status === 'CANCELLED' ? "text-orange-500" : "text-gold"
                )} />
                <span className={cn(
                  "text-muted-foreground",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {subscription.status === 'CANCELLED'
                    ? (isKorean ? '만료?? : 'Expires On')
                    : (isKorean ? '?�음 결제?? : 'Next Billing Date')}
                </span>
              </div>
              <span className={cn(
                "text-foreground font-medium",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {formattedDate}
              </span>
            </div>

            {/* 결제 금액 */}
            <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className={cn(
                  "w-5 h-5",
                  subscription.status === 'CANCELLED' ? "text-orange-500" : "text-gold"
                )} />
                <span className={cn(
                  "text-muted-foreground",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {isKorean ? '?�랜 금액' : 'Plan Amount'}
                </span>
              </div>
              <span className="text-foreground font-medium">
                {subscription.isStripe
                  ? `$${(subscription.price / 100).toFixed(2)}`
                  : `??{subscription.price.toLocaleString()}`}
              </span>
            </div>

            {/* 결제 ?�단 */}
            {subscription.status !== 'CANCELLED' && (
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gold" />
                  <span className={cn(
                    "text-muted-foreground",
                    isKorean && "font-[var(--font-noto-kr)]"
                  )}>
                    {isKorean ? '결제 ?�단' : 'Payment Method'}
                  </span>
                </div>
                <span className="text-foreground font-medium">
                  {subscription.paymentMethod}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ?�리미엄 ?�택 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-6 mb-8"
        >
          <h3 className={cn(
            "text-lg font-medium text-foreground mb-4",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean ? '?�리미엄 ?�택' : 'Premium Benefits'}
          </h3>
          <ul className="space-y-3">
            {[
              isKorean ? '무제???�료 추천' : 'Unlimited recommendations',
              isKorean ? '추천 ?�스?�리 ?�?? : 'Save recommendation history',
              isKorean ? '즐겨찾기 기능' : 'Favorites feature',
              isKorean ? '?�선 고객 지?? : 'Priority support',
            ].map((benefit, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gold" />
                <span className={cn(
                  "text-muted-foreground",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* 구독 취소/?�활?�화 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3"
        >
          {subscription.status === 'CANCELLED' ? (
            <>
              <Button
                onClick={() => router.push('/subscription')}
                className={cn(
                  "flex-1 h-14 bg-gold hover:bg-gold-light text-background font-semibold",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
              >
                {isKorean ? '?�시 구독?�기' : 'Resubscribe'}
              </Button>
              <Button
                onClick={() => router.push('/subscription?tab=credit')}
                variant="outline"
                className={cn(
                  "flex-1 h-14 border-gold/40 text-gold hover:bg-gold/10",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
              >
                {isKorean ? '?�레??충전' : 'Buy Credits'}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => router.push('/subscription')}
                variant="outline"
                className={cn(
                  "flex-1 h-14 border-gold/40 text-gold hover:bg-gold/10",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
              >
                {isKorean ? '?�랜 변�? : 'Change Plan'}
              </Button>
              <Button
                onClick={() => setShowCancelDialog(true)}
                variant="outline"
                className={cn(
                  "flex-1 h-14 border-destructive/30 text-destructive hover:bg-destructive/10",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
              >
                {isKorean ? '구독 취소' : 'Cancel Subscription'}
              </Button>
            </>
          )}
        </motion.div>
      </div>

      {/* 취소 ?�인 ?�이?�로�?*/}
      <CustomDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelSubscription}
        type="confirm"
        title={isKorean ? '구독??취소?�시겠어??' : 'Cancel Subscription?'}
        description={
          isKorean
            ? `?�음 결제??${formattedDate})부??FREE ?�랜?�로 ?�환?�니?? �??�까지??PREMIUM ?�택??계속 ?�용?????�습?�다.`
            : `Your subscription will be downgraded to FREE plan from ${formattedDate}. You can continue using PREMIUM benefits until then.`
        }
        confirmText={cancelling ? (isKorean ? '취소 �?..' : 'Cancelling...') : (isKorean ? '구독 취소' : 'Cancel')}
        cancelText={isKorean ? '?�아가�? : 'Go Back'}
      />

      {/* ?�공 ?�이?�로�?*/}
      <CustomDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        type="success"
        title={isKorean ? '구독??취소?�었?�니?? : 'Subscription Cancelled'}
        description={
          isKorean
            ? `${formattedDate}까�? PREMIUM ?�택???�용?????�습?�다.`
            : `You can use PREMIUM benefits until ${formattedDate}.`
        }
        confirmText={isKorean ? '?�인' : 'OK'}
      />

      {/* ?�러 ?�이?�로�?*/}
      <CustomDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        type="error"
        title={isKorean ? '?�류 발생' : 'Error'}
        description={errorMessage}
        confirmText={isKorean ? '?�인' : 'OK'}
      />
    </div>
  );
}


