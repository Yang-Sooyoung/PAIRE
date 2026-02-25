'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { Button } from '@/components/ui/button';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Calendar, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
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

    if (user.membership !== 'PREMIUM') {
      router.push('/subscription');
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
          
          // 구독이 CANCELLED 상태면 구독 페이지로 리다이렉트
          if (response.data.subscription.status === 'CANCELLED') {
            setTimeout(() => {
              router.push('/subscription');
            }, 100);
          }
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
              
              // 구독이 CANCELLED 상태면 구독 페이지로 리다이렉트
              if (response.data.subscription.status === 'CANCELLED') {
                setTimeout(() => {
                  router.push('/subscription');
                }, 100);
              }
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
      
      // 구독 정보 다시 가져오기
      await fetchSubscriptionStatus();
      
      // 사용자 정보 업데이트 (멤버십은 유지되지만 구독 상태는 CANCELLED)
      if (user) {
        // 사용자 정보 새로고침
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

      // 2초 후 구독 페이지로 이동
      setTimeout(() => {
        router.push('/subscription');
      }, 2000);
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      setErrorMessage(error.response?.data?.message || (isKorean ? '구독 취소에 실패했습니다.' : 'Failed to cancel subscription.'));
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <AlertCircle className="w-16 h-16 text-gold/30 mx-auto mb-4" />
          <h2 className={cn(
            "text-2xl font-light text-foreground mb-6",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean ? '활성 구독을 찾을 수 없습니다' : 'No active subscription found'}
          </h2>
          <Button
            onClick={() => router.push('/subscription')}
            className={cn(
              "bg-gold hover:bg-gold-light text-background",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {isKorean ? '구독하기' : 'Subscribe'}
          </Button>
        </motion.div>
      </div>
    );
  }

  const nextBillingDate = new Date(subscription.nextBillingDate);
  const formattedDate = nextBillingDate.toLocaleDateString(isKorean ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
        {/* 구독 상태 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 rounded-xl p-8 mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center">
              <Crown className="w-8 h-8 text-gold" />
            </div>
            <div>
              <h2 className={cn(
                "text-2xl font-light text-foreground mb-1",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                PREMIUM
              </h2>
              <p className={cn(
                "text-gold text-sm",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {subscription.interval === 'WEEKLY'
                  ? (isKorean ? '주간 구독' : 'Weekly Subscription')
                  : subscription.interval === 'MONTHLY' 
                  ? (isKorean ? '월간 구독' : 'Monthly Subscription')
                  : (isKorean ? '연간 구독' : 'Annual Subscription')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* 다음 결제일 */}
            <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gold" />
                <span className={cn(
                  "text-muted-foreground",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {isKorean ? '다음 결제일' : 'Next Billing Date'}
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
                <CreditCard className="w-5 h-5 text-gold" />
                <span className={cn(
                  "text-muted-foreground",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {isKorean ? '결제 금액' : 'Amount'}
                </span>
              </div>
              <span className="text-foreground font-medium">
                ₩{subscription.price.toLocaleString()}
              </span>
            </div>

            {/* 결제 수단 */}
            <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gold" />
                <span className={cn(
                  "text-muted-foreground",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {isKorean ? '결제 수단' : 'Payment Method'}
                </span>
              </div>
              <span className="text-foreground font-medium">
                {subscription.paymentMethod}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 프리미엄 혜택 */}
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
            {isKorean ? '프리미엄 혜택' : 'Premium Benefits'}
          </h3>
          <ul className="space-y-3">
            {[
              isKorean ? '무제한 음료 추천' : 'Unlimited recommendations',
              isKorean ? '추천 히스토리 저장' : 'Save recommendation history',
              isKorean ? '즐겨찾기 기능' : 'Favorites feature',
              isKorean ? '우선 고객 지원' : 'Priority support',
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

        {/* 구독 취소 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={() => setShowCancelDialog(true)}
            variant="outline"
            className={cn(
              "w-full border-destructive/30 text-destructive hover:bg-destructive/10",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {isKorean ? '구독 취소' : 'Cancel Subscription'}
          </Button>
        </motion.div>
      </div>

      {/* 취소 확인 다이얼로그 */}
      <CustomDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelSubscription}
        type="confirm"
        title={isKorean ? '구독을 취소하시겠어요?' : 'Cancel Subscription?'}
        description={
          isKorean
            ? `다음 결제일(${formattedDate})부터 FREE 플랜으로 전환됩니다. 그 전까지는 PREMIUM 혜택을 계속 이용할 수 있습니다.`
            : `Your subscription will be downgraded to FREE plan from ${formattedDate}. You can continue using PREMIUM benefits until then.`
        }
        confirmText={cancelling ? (isKorean ? '취소 중...' : 'Cancelling...') : (isKorean ? '구독 취소' : 'Cancel')}
        cancelText={isKorean ? '돌아가기' : 'Go Back'}
      />

      {/* 성공 다이얼로그 */}
      <CustomDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        type="success"
        title={isKorean ? '구독이 취소되었습니다' : 'Subscription Cancelled'}
        description={
          isKorean
            ? `${formattedDate}까지 PREMIUM 혜택을 이용할 수 있습니다.`
            : `You can use PREMIUM benefits until ${formattedDate}.`
        }
        confirmText={isKorean ? '확인' : 'OK'}
      />

      {/* 에러 다이얼로그 */}
      <CustomDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        type="error"
        title={isKorean ? '오류 발생' : 'Error'}
        description={errorMessage}
        confirmText={isKorean ? '확인' : 'OK'}
      />
    </div>
  );
}
