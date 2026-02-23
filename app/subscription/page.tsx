// app/subscription/page.tsx
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUserStore } from '@/app/store/userStore';
import { PLANS, type Plan } from './constants/subscriptionPlans';
import { loadTossPayments } from '@tosspayments/sdk';
import { Button } from '@/components/ui/button';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { useRouter } from 'next/navigation';
import { Check, ArrowLeft } from 'lucide-react';
import { PaymentMethodCard } from '@/components/subscription/PaymentMethodCard';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function SubscriptionPage() {
  const { user, token, setUser, refreshTokenIfNeeded } = useUserStore();
  const { language, t } = useI18n();
  const isKorean = language === 'ko';
  const [methodRegistered, setMethodRegistered] = useState(false);
  const [billingKey, setBillingKey] = useState('');
  const [selectedPlan] = useState<Plan>(PLANS[0]);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{ type: 'info' | 'success' | 'warning' | 'error' | 'confirm', title: string, description: string }>({ 
    type: 'info', 
    title: '', 
    description: '' 
  });
  const router = useRouter();

  const getPlanPrice = (plan: Plan) => {
    return billingPeriod === 'yearly'
      ? plan.priceYearly
      : plan.priceMonthly;
  };

  useEffect(() => {
    let isCancelled = false;

    if (!user || !token) {
      setMethodRegistered(false);
      return;
    }

    const fetchPaymentMethods = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

        let currentToken = token;
        let response = await axios.get(`${API_URL}/subscription/methods`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        if (isCancelled) return;

        // 401 에러면 토큰 갱신 후 재시도
        if (response.status === 401) {
          console.log('Token expired, refreshing...');
          const newToken = await refreshTokenIfNeeded();

          if (isCancelled) return;

          if (newToken) {
            currentToken = newToken;
            response = await axios.get(`${API_URL}/subscription/methods`, {
              headers: { Authorization: `Bearer ${currentToken}` },
            });

            if (isCancelled) return;
          } else {
            console.log('Token refresh failed, redirecting to login');
            router.push('/login');
            return;
          }
        }

        console.log('Payment methods response:', response.data);

        if (!isCancelled) {
          if (response.data?.success && response.data.methods?.length > 0) {
            const m = response.data.methods[0];
            console.log('Payment method found:', m);
            setMethodRegistered(true);
            setBillingKey(m.billingKey ?? '');
          } else {
            console.log('No payment methods found');
            setMethodRegistered(false);
          }
        }
      } catch (err: any) {
        if (isCancelled) return;

        // 401 에러 처리
        if (err?.response?.status === 401) {
          console.log('Token expired, refreshing...');
          const newToken = await refreshTokenIfNeeded();

          if (isCancelled) return;

          if (newToken) {
            try {
              const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
              const response = await axios.get(`${API_URL}/subscription/methods`, {
                headers: { Authorization: `Bearer ${newToken}` },
              });

              if (isCancelled) return;

              console.log('Payment methods response (after refresh):', response.data);

              if (!isCancelled) {
                if (response.data?.success && response.data.methods?.length > 0) {
                  const m = response.data.methods[0];
                  console.log('Payment method found (after refresh):', m);
                  setMethodRegistered(true);
                  setBillingKey(m.billingKey ?? '');
                } else {
                  console.log('No payment methods found (after refresh)');
                  setMethodRegistered(false);
                }
              }
            } catch (retryErr) {
              if (!isCancelled) {
                console.error('Retry failed:', retryErr);
                setMethodRegistered(false);
              }
            }
          } else {
            console.log('Token refresh failed, redirecting to login');
            router.push('/login');
          }
        } else {
          console.error('fetch payment methods error', err?.response?.data ?? err?.message);
          setMethodRegistered(false);
        }
      }
    };

    fetchPaymentMethods();

    return () => {
      isCancelled = true;
    };
  }, [user, token, refreshTokenIfNeeded, router]);

  const handleRegisterBilling = async () => {
    if (!user) return router.push('/login');

    try {
      setLoading(true);
      const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_TEST_CLIENT_KEY!);
      const customerKey = `user_${user.id}`;

      // 결제수단 등록만 하고 구독은 하지 않음
      await tossPayments.requestBillingAuth('카드', {
        customerKey,
        successUrl: `${window.location.origin}/subscription/register/done`,
        failUrl: `${window.location.origin}/subscription/fail`,
      });
    } catch (error) {
      console.error(error);
      setDialogConfig({
        type: 'error',
        title: '등록 실패',
        description: '결제 수단 등록 중 오류가 발생했습니다.',
      });
      setShowDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user || !token) {
      setDialogConfig({
        type: 'warning',
        title: '로그인 필요',
        description: '로그인이 필요한 서비스입니다.',
      });
      setShowDialog(true);
      return;
    }
    
    if (!methodRegistered && !billingKey) {
      setDialogConfig({
        type: 'warning',
        title: '결제수단 등록 필요',
        description: '결제수단을 먼저 등록해주세요.',
      });
      setShowDialog(true);
      return;
    }

    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const priceNumber = Number(getPlanPrice(selectedPlan));
      const interval = billingPeriod === 'monthly' ? 'MONTHLY' : 'ANNUALLY';

      const payload = {
        planId: selectedPlan.id,
        membership: selectedPlan.membership,
        interval,
        price: priceNumber,
        billingKey,
      };

      const res = await axios.post(`${API_URL}/subscription/create`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.subscription || res.data?.success) {
        setUser({ ...user, membership: 'PREMIUM' });
        router.push('/subscription/success');
      } else {
        setDialogConfig({
          type: 'error',
          title: '구독 생성 실패',
          description: res.data?.message ?? '구독 생성에 실패했습니다.',
        });
        setShowDialog(true);
      }
    } catch (err: any) {
      console.error('subscribe error', err?.response?.data ?? err?.message);
      setDialogConfig({
        type: 'error',
        title: '구독 요청 실패',
        description: err?.response?.data?.message ?? err?.message ?? '구독 요청에 실패했습니다.',
      });
      setShowDialog(true);
    } finally {
      setLoading(false);
    }
  };

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
            {t('subscription.title')}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12 relative z-10">
        {/* 헤더 텍스트 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className={cn(
            "text-muted-foreground",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {t('subscription.subtitle')}
          </p>
        </motion.div>

        {/* 플랜 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-8 mb-8"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className={cn(
                "text-2xl font-light text-foreground mb-2",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {selectedPlan.title}
              </h2>
              <p className={cn(
                "text-muted-foreground",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {selectedPlan.description}
              </p>
            </div>
          </div>

          {/* 가격 선택 */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg transition",
                billingPeriod === 'monthly'
                  ? 'bg-gold text-background'
                  : 'bg-secondary text-foreground hover:bg-secondary/80',
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              <div className="font-semibold">{t('subscription.monthly')}</div>
              <div className="text-sm">₩{selectedPlan.priceMonthly.toLocaleString()}</div>
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg transition",
                billingPeriod === 'yearly'
                  ? 'bg-gold text-background'
                  : 'bg-secondary text-foreground hover:bg-secondary/80',
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              <div className="font-semibold">{t('subscription.yearly')}</div>
              <div className="text-sm">₩{selectedPlan.priceYearly.toLocaleString()}</div>
            </button>
          </div>

          {/* 기능 목록 */}
          <div className="space-y-3 mb-8">
            {selectedPlan.features.map((feature, idx) => (
              <div key={idx} className={cn(
                "flex items-center gap-3 text-foreground",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                <Check className="w-5 h-5 text-gold flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* 결제 수단 */}
          <div className="mb-8">
            <h3 className={cn(
              "text-sm font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {t('subscription.paymentMethod')}
            </h3>
            {methodRegistered ? (
              <PaymentMethodCard
                billingKey={billingKey}
                token={token!}
                onRemoved={() => {
                  setMethodRegistered(false);
                  setBillingKey('');
                }}
              />
            ) : (
              <Button
                onClick={handleRegisterBilling}
                disabled={loading}
                className={cn(
                  "w-full bg-secondary hover:bg-secondary/80 text-foreground border border-border",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
              >
                {loading ? t('subscription.registering') : t('subscription.registerPayment')}
              </Button>
            )}
          </div>

          {/* 구독 버튼 */}
          <Button
            onClick={handleSubscribe}
            disabled={loading || !methodRegistered}
            className={cn(
              "w-full bg-gold hover:bg-gold-light text-background py-3 text-lg font-semibold",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {loading ? t('subscription.processing') : `${t('subscription.planPrice')}₩${getPlanPrice(selectedPlan).toLocaleString()}`}
          </Button>
        </motion.div>

        {/* 취소 버튼 */}
        <div className="text-center">
          <button
            onClick={() => router.back()}
            className={cn(
              "text-muted-foreground hover:text-foreground transition",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {t('subscription.goBack')}
          </button>
        </div>
      </div>

      {/* Custom Dialog */}
      <CustomDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        type={dialogConfig.type}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmText="확인"
      />
    </div>
  );
}
