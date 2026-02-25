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
import { Check, ArrowLeft, Sparkles } from 'lucide-react';
import { PaymentMethodCard } from '@/components/subscription/PaymentMethodCard';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const CREDIT_PACKAGES = [
  {
    id: 'CREDIT_5',
    credits: 5,
    price: 5000,
    nameKo: '크레딧 5회',
    nameEn: '5 Credits',
    badge: '🌟',
  },
  {
    id: 'CREDIT_10',
    credits: 10,
    price: 9000,
    nameKo: '크레딧 10회',
    nameEn: '10 Credits',
    badge: '⭐',
    discount: 10,
    savings: 1000,
  },
  {
    id: 'CREDIT_30',
    credits: 30,
    price: 24000,
    nameKo: '크레딧 30회',
    nameEn: '30 Credits',
    badge: '✨',
    discount: 20,
    savings: 6000,
    popular: true,
  },
];

export default function SubscriptionPage() {
  const { user, token, setUser, refreshTokenIfNeeded } = useUserStore();
  const { language, t } = useI18n();
  const isKorean = language === 'ko';
  const [paymentType, setPaymentType] = useState<'subscription' | 'credit'>('subscription');
  const [methodRegistered, setMethodRegistered] = useState(false);
  const [billingKey, setBillingKey] = useState('');
  const [selectedPlan] = useState<Plan>(PLANS[0]);
  const [billingPeriod, setBillingPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{ type: 'info' | 'success' | 'warning' | 'error' | 'confirm', title: string, description: string }>({
    type: 'info',
    title: '',
    description: ''
  });
  const router = useRouter();

  const getPlanPrice = (plan: Plan) => {
    if (billingPeriod === 'weekly') return plan.priceWeekly || 0;
    if (billingPeriod === 'yearly') return plan.priceYearly;
    return plan.priceMonthly;
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

        if (response.status === 401) {
          const newToken = await refreshTokenIfNeeded();
          if (isCancelled) return;

          if (newToken) {
            currentToken = newToken;
            response = await axios.get(`${API_URL}/subscription/methods`, {
              headers: { Authorization: `Bearer ${currentToken}` },
            });
            if (isCancelled) return;
          } else {
            router.push('/login');
            return;
          }
        }

        if (!isCancelled) {
          if (response.data?.success && response.data.methods?.length > 0) {
            const m = response.data.methods[0];
            setMethodRegistered(true);
            setBillingKey(m.billingKey ?? '');
          } else {
            setMethodRegistered(false);
          }
        }
      } catch (err: any) {
        if (isCancelled) return;

        if (err?.response?.status === 401) {
          const newToken = await refreshTokenIfNeeded();
          if (isCancelled) return;

          if (newToken) {
            try {
              const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
              const response = await axios.get(`${API_URL}/subscription/methods`, {
                headers: { Authorization: `Bearer ${newToken}` },
              });

              if (!isCancelled) {
                if (response.data?.success && response.data.methods?.length > 0) {
                  const m = response.data.methods[0];
                  setMethodRegistered(true);
                  setBillingKey(m.billingKey ?? '');
                } else {
                  setMethodRegistered(false);
                }
              }
            } catch (retryErr) {
              if (!isCancelled) {
                setMethodRegistered(false);
              }
            }
          } else {
            router.push('/login');
          }
        } else {
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

      await tossPayments.requestBillingAuth('카드', {
        customerKey,
        successUrl: `${window.location.origin}/subscription/register/done`,
        failUrl: `${window.location.origin}/subscription/fail`,
      });
    } catch (error) {
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
      const interval = billingPeriod === 'weekly' ? 'WEEKLY' : billingPeriod === 'monthly' ? 'MONTHLY' : 'ANNUALLY';

      const payload = {
        planId: selectedPlan.id,
        membership: selectedPlan.membership,
        interval,
        price: priceNumber,
        billingKey,
      };

      let currentToken = useUserStore.getState().token || token;

      let res = await axios.post(`${API_URL}/subscription/create`, payload, {
        headers: { Authorization: `Bearer ${currentToken}` },
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
      if (err?.response?.status === 401) {
        const newToken = await refreshTokenIfNeeded();

        if (newToken) {
          try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
            const priceNumber = Number(getPlanPrice(selectedPlan));
            const interval = billingPeriod === 'weekly' ? 'WEEKLY' : billingPeriod === 'monthly' ? 'MONTHLY' : 'ANNUALLY';

            const payload = {
              planId: selectedPlan.id,
              membership: selectedPlan.membership,
              interval,
              price: priceNumber,
              billingKey,
            };

            const res = await axios.post(`${API_URL}/subscription/create`, payload, {
              headers: { Authorization: `Bearer ${newToken}` },
            });

            if (res.data?.subscription || res.data?.success) {
              setUser({ ...user, membership: 'PREMIUM' });
              router.push('/subscription/success');
              return;
            }
          } catch (retryErr: any) {
            console.error('Retry subscribe error', retryErr);
          }
        } else {
          router.push('/login');
          return;
        }
      }

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

  const handleCreditPurchase = async (pkg: typeof CREDIT_PACKAGES[0]) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const currentToken = useUserStore.getState().token;
      if (!currentToken) {
        router.push('/login');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      const response = await fetch(`${API_URL}/credit/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ packageType: pkg.id }),
      });

      if (!response.ok) {
        throw new Error('구매 생성 실패');
      }

      const { orderId, amount, orderName } = await response.json();

      const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_TEST_CLIENT_KEY!);

      await tossPayments.requestPayment('카드', {
        amount,
        orderId,
        orderName,
        successUrl: `${window.location.origin}/credit/success`,
        failUrl: `${window.location.origin}/credit/fail`,
      });
    } catch (error) {
      setDialogConfig({
        type: 'error',
        title: isKorean ? '구매 실패' : 'Purchase Failed',
        description: isKorean ? '구매 중 오류가 발생했습니다.' : 'An error occurred during purchase.',
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
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
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
            {isKorean ? '결제 방식 선택' : 'Choose Payment Type'}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        {/* 탭 선택 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 mb-12 justify-center"
        >
          <button
            onClick={() => setPaymentType('subscription')}
            className={cn(
              "px-8 py-4 rounded-xl transition-all font-semibold",
              paymentType === 'subscription'
                ? 'bg-gold text-background shadow-lg shadow-gold/20'
                : 'bg-card border border-border text-muted-foreground hover:border-gold/30',
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {isKorean ? '🔄 정기 구독' : '🔄 Subscription'}
          </button>
          <button
            onClick={() => setPaymentType('credit')}
            className={cn(
              "px-8 py-4 rounded-xl transition-all font-semibold",
              paymentType === 'credit'
                ? 'bg-gold text-background shadow-lg shadow-gold/20'
                : 'bg-card border border-border text-muted-foreground hover:border-gold/30',
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {isKorean ? '✨ 크레딧 충전' : '✨ Buy Credits'}
          </button>
        </motion.div>

        {/* 구독 섹션 */}
        {paymentType === 'subscription' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center mb-8">
              <p className={cn(
                "text-muted-foreground",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {isKorean ? '무제한으로 이용하세요' : 'Unlimited recommendations'}
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 mb-8 max-w-2xl mx-auto">
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
              <div className="flex gap-3 mb-8">
                <button
                  onClick={() => setBillingPeriod('weekly')}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-lg transition",
                    billingPeriod === 'weekly'
                      ? 'bg-gold text-background'
                      : 'bg-secondary text-foreground hover:bg-secondary/80',
                    isKorean && "font-[var(--font-noto-kr)]"
                  )}
                >
                  <div className="font-semibold">{isKorean ? '주간' : 'Weekly'}</div>
                  <div className="text-sm">₩{(selectedPlan.priceWeekly || 0).toLocaleString()}</div>
                </button>
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
            </div>
          </motion.div>
        )}

        {/* 크레딧 섹션 */}
        {paymentType === 'credit' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center mb-8">
              <p className={cn(
                "text-muted-foreground mb-2",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {isKorean ? '필요한 만큼만 충전하세요' : 'Pay as you go'}
              </p>
              <p className={cn(
                "text-sm text-muted-foreground",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {isKorean ? '크레딧 1개 = 추천 1회' : '1 Credit = 1 Recommendation'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CREDIT_PACKAGES.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={cn(
                    "relative bg-card border rounded-xl p-6 hover:border-gold/50 transition-all",
                    pkg.popular ? "border-gold/30 shadow-lg shadow-gold/10" : "border-border"
                  )}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold text-background text-xs font-semibold rounded-full">
                      {isKorean ? '인기' : 'POPULAR'}
                    </div>
                  )}

                  <div className="text-4xl mb-4 text-center">{pkg.badge}</div>

                  <h3 className={cn(
                    "text-xl font-semibold text-foreground text-center mb-2",
                    isKorean && "font-[var(--font-noto-kr)]"
                  )}>
                    {isKorean ? pkg.nameKo : pkg.nameEn}
                  </h3>

                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gold mb-1">
                      ₩{pkg.price.toLocaleString()}
                    </div>
                    {pkg.discount && (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-muted-foreground line-through">
                          ₩{(pkg.price + (pkg.savings || 0)).toLocaleString()}
                        </span>
                        <span className="text-sm text-gold font-semibold">
                          {pkg.discount}% {isKorean ? '할인' : 'OFF'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-gold" />
                      <span className={isKorean ? "font-[var(--font-noto-kr)]" : ""}>
                        {pkg.credits}{isKorean ? '회 추천' : ' Recommendations'}
                      </span>
                    </div>
                    {pkg.discount && (
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-gold" />
                        <span className={isKorean ? "font-[var(--font-noto-kr)]" : ""}>
                          ₩{pkg.savings?.toLocaleString()} {isKorean ? '절약' : 'saved'}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleCreditPurchase(pkg)}
                    disabled={loading}
                    className={cn(
                      "w-full py-3 font-semibold",
                      pkg.popular
                        ? "bg-gold hover:bg-gold-light text-background"
                        : "bg-secondary hover:bg-secondary/80 text-foreground border border-border",
                      isKorean && "font-[var(--font-noto-kr)]"
                    )}
                  >
                    {loading ? (isKorean ? '처리 중...' : 'Processing...') : (isKorean ? '구매하기' : 'Buy Now')}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
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
