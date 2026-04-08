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
import { 
  detectCountry,
  detectCountryByIP,
  getRegionConfig, 
  isMobileApp,
  type CountryCode 
} from '@/lib/region-detector';

const CREDIT_PACKAGES = [
  {
    id: 'CREDIT_5',
    credits: 5,
    price: 5000,
    priceUSD: 3.99,
    nameKo: '?щ젅??5??,
    nameEn: '5 Credits',
    badge: '?뙚',
  },
  {
    id: 'CREDIT_10',
    credits: 10,
    price: 9000,
    priceUSD: 6.99,
    nameKo: '?щ젅??10??,
    nameEn: '10 Credits',
    badge: '狩?,
    discount: 10,
    savings: 1000,
    savingsUSD: 0.8,
  },
  {
    id: 'CREDIT_30',
    credits: 30,
    price: 24000,
    priceUSD: 17.99,
    nameKo: '?щ젅??30??,
    nameEn: '30 Credits',
    badge: '??,
    discount: 20,
    savings: 6000,
    savingsUSD: 4.0,
    popular: true,
  },
];

export default function SubscriptionPage() {
  const { user, token, setUser, refreshTokenIfNeeded, initializeUser } = useUserStore();
  const { language, t } = useI18n();
  const isKorean = language === 'ko';
  const router = useRouter();
  
  // 吏??媛먯? (null = 媛먯? 以? 湲곕낯媛?Stripe)
  const [regionConfig, setRegionConfig] = useState(getRegionConfig('OTHER'));
  const activeRegion = regionConfig;
  
  // URL ?뚮씪誘명꽣?먯꽌 ???뺤씤
  const [paymentType, setPaymentType] = useState<'subscription' | 'credit'>('subscription');
  const [methodRegistered, setMethodRegistered] = useState(false);
  const [billingKey, setBillingKey] = useState('');
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(1); // 湲곕낯媛? ?붽컙
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{ type: 'info' | 'success' | 'warning' | 'error' | 'confirm', title: string, description: string }>({
    type: 'info',
    title: '',
    description: ''
  });
  const selectedPlan = PLANS[selectedPlanIndex];

  // Stripe ?ㅻ줈媛湲??깆쑝濡?store媛 珥덇린?붾맂 寃쎌슦 蹂듦뎄
  useEffect(() => {
    if (!user || !token) {
      initializeUser();
    }
  }, []);

  // 吏??諛???紐⑤뱶 媛먯?
  useEffect(() => {
    // IP 湲곕컲 媛먯? (媛???뺥솗 - VPN??諛섏쁺)
    detectCountryByIP().then(country => {
      setRegionConfig(getRegionConfig(country));
      console.log('Detected country (IP):', country);
      console.log('Payment provider:', getRegionConfig(country).paymentProvider);
    });
    console.log('Is mobile app:', isMobileApp());
  }, []);

  // URL ?뚮씪誘명꽣濡????ㅼ젙
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'credit') {
      setPaymentType('credit');
    }
  }, []);

  const getPlanPrice = (plan: Plan) => {
    return activeRegion.paymentProvider === 'stripe' ? plan.priceMonthlyUSD : plan.priceMonthly;
  };

  const formatPlanPrice = (plan: Plan) => {
    if (activeRegion.paymentProvider === 'stripe') {
      return `$${plan.priceMonthlyUSD.toFixed(2)}`;
    }
    return `??{plan.priceMonthly.toLocaleString()}`;
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

      await tossPayments.requestBillingAuth('移대뱶', {
        customerKey,
        successUrl: `${window.location.origin}/subscription/register/done`,
        failUrl: `${window.location.origin}/subscription/fail`,
      });
    } catch (error) {
      setDialogConfig({
        type: 'error',
        title: '?깅줉 ?ㅽ뙣',
        description: '寃곗젣 ?섎떒 ?깅줉 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.',
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
        title: isKorean ? '濡쒓렇???꾩슂' : 'Login Required',
        description: isKorean ? '濡쒓렇?몄씠 ?꾩슂???쒕퉬?ㅼ엯?덈떎.' : 'Please login to continue.',
      });
      setShowDialog(true);
      return;
    }

    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

      // Stripe 寃곗젣 (?댁쇅)
      if (activeRegion.paymentProvider === 'stripe') {
        // Stripe Price ID 留ㅽ븨 - ?뚮옖蹂꾨줈 ?뺥솗??留ㅽ븨
        let stripePriceId: string | undefined;
        if (selectedPlan.interval === 'WEEKLY') {
          stripePriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY;
        } else if (selectedPlan.interval === 'MONTHLY') {
          stripePriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY;
        } else {
          stripePriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY;
        }

        // WEEKLY ?섍꼍蹂???놁쑝硫?MONTHLY濡?fallback (寃쎄퀬 異쒕젰)
        if (!stripePriceId) {
          if (selectedPlan.interval === 'WEEKLY') {
            stripePriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY;
            console.warn('NEXT_PUBLIC_STRIPE_PRICE_WEEKLY not set, falling back to MONTHLY');
          }
        }

        if (!stripePriceId) {
          throw new Error('Stripe price ID is not configured');
        }

        console.log(`[subscribe] interval=${selectedPlan.interval}, priceId=${stripePriceId}`);

        // 諛깆뿏?쒖뿉 /api prefix ?놁쓬 - BASE_URL ?ъ슜
        const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');
        const currentToken = useUserStore.getState().token || token;
        const response = await axios.post(
          `${BASE_URL}/stripe/create-subscription-session`,
          {
            priceId: stripePriceId,
            planId: selectedPlan.id,
            successUrl: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/subscription`,
          },
          {
            headers: { Authorization: `Bearer ${currentToken}` },
          }
        );

        // Stripe Checkout?쇰줈 由щ떎?대젆??        if (response.data.url) {
          window.location.href = response.data.url;
        }
        return;
      }

      // ?좎뒪?섏씠癒쇱툩 寃곗젣 (?쒓뎅)
      if (!methodRegistered && !billingKey) {
        setDialogConfig({
          type: 'warning',
          title: '寃곗젣?섎떒 ?깅줉 ?꾩슂',
          description: '寃곗젣?섎떒??癒쇱? ?깅줉?댁＜?몄슂.',
        });
        setShowDialog(true);
        setLoading(false);
        return;
      }

      const priceNumber = Number(getPlanPrice(selectedPlan));
      const payload = {
        planId: selectedPlan.id,
        membership: selectedPlan.membership,
        interval: selectedPlan.interval,
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
          title: '援щ룆 ?앹꽦 ?ㅽ뙣',
          description: res.data?.message ?? '援щ룆 ?앹꽦???ㅽ뙣?덉뒿?덈떎.',
        });
        setShowDialog(true);
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        const newToken = await refreshTokenIfNeeded();
        if (newToken) {
          // ?좏겙 媛깆떊 ???ъ떆?꾨뒗 ?좎뒪?섏씠癒쇱툩留?          if (activeRegion.paymentProvider === 'toss') {
            try {
              const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
              const priceNumber = Number(getPlanPrice(selectedPlan));
              const payload = {
                planId: selectedPlan.id,
                membership: selectedPlan.membership,
                interval: selectedPlan.interval,
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
          }
        } else {
          router.push('/login');
          return;
        }
      }

      setDialogConfig({
        type: 'error',
        title: isKorean ? '援щ룆 ?붿껌 ?ㅽ뙣' : 'Subscription Failed',
        description: err?.response?.data?.message ?? err?.message ?? (isKorean ? '援щ룆 ?붿껌???ㅽ뙣?덉뒿?덈떎.' : 'Failed to create subscription.'),
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

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

      // ?댁쇅: Stripe Checkout
      if (activeRegion.paymentProvider === 'stripe') {
        const STRIPE_CREDIT_PRICE_IDS: Record<string, string> = {
          CREDIT_5: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_5 || '',
          CREDIT_10: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_10 || '',
          CREDIT_30: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_30 || '',
        };
        const priceId = STRIPE_CREDIT_PRICE_IDS[pkg.id];
        if (!priceId) {
          setDialogConfig({ type: 'error', title: 'Not configured', description: 'Stripe credit price ID is not configured.' });
          setShowDialog(true);
          return;
        }
        // 諛깆뿏?쒖뿉 /api prefix ?놁쓬 - BASE_URL ?ъ슜
        const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');
        const response = await fetch(`${BASE_URL}/stripe/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentToken}` },
          body: JSON.stringify({ priceId, credits: pkg.credits, successUrl: `${window.location.origin}/credit/success?session_id={CHECKOUT_SESSION_ID}`, cancelUrl: `${window.location.origin}/subscription?tab=credit` }),
        });
        if (!response.ok) throw new Error('Stripe session ?앹꽦 ?ㅽ뙣');
        const { url } = await response.json();
        if (url) window.location.href = url;
        return;
      }

      // ?쒓뎅: ?좎뒪?섏씠癒쇱툩
      const response = await fetch(`${API_URL}/credit/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ packageType: pkg.id }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const newToken = await refreshTokenIfNeeded();
          if (newToken) {
            const retryResponse = await fetch(`${API_URL}/credit/purchase`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newToken}` },
              body: JSON.stringify({ packageType: pkg.id }),
            });
            if (!retryResponse.ok) throw new Error('援щℓ ?앹꽦 ?ㅽ뙣');
            const { orderId, amount, orderName } = await retryResponse.json();
            const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_TEST_CLIENT_KEY!);
            await tossPayments.requestPayment('移대뱶', { amount, orderId, orderName, successUrl: `${window.location.origin}/credit/success`, failUrl: `${window.location.origin}/credit/fail` });
            return;
          } else {
            router.push('/login');
            return;
          }
        }
        throw new Error('援щℓ ?앹꽦 ?ㅽ뙣');
      }

      const { orderId, amount, orderName } = await response.json();
      const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_TEST_CLIENT_KEY!);
      await tossPayments.requestPayment('移대뱶', { amount, orderId, orderName, successUrl: `${window.location.origin}/credit/success`, failUrl: `${window.location.origin}/credit/fail` });
    } catch (error) {
      setDialogConfig({
        type: 'error',
        title: isKorean ? '援щℓ ?ㅽ뙣' : 'Purchase Failed',
        description: isKorean ? '援щℓ 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.' : 'An error occurred during purchase.',
      });
      setShowDialog(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 諛곌꼍 ?④낵 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      {/* ?ㅻ뜑 */}
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
            "text-lg font-medium text-foreground tracking-wide",
            isKorean && "font-[var(--font-noto-kr)] tracking-normal"
          )}>
            {isKorean ? '寃곗젣 諛⑹떇 ?좏깮' : 'Choose Payment Type'}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        {/* ???좏깮 */}
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
            {isKorean ? '?봽 ?뺢린 援щ룆' : '?봽 Subscription'}
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
            {isKorean ? '???щ젅??異⑹쟾' : '??Buy Credits'}
          </button>
        </motion.div>

        {/* 援щ룆 ?뱀뀡 */}
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
                {isKorean ? '臾댁젣?쒖쑝濡??댁슜?섏꽭?? : 'Unlimited recommendations'}
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 mb-8 max-w-2xl mx-auto">
              {/* ?뚮옖 ?좏깮 ??*/}
              <div className="flex gap-3 mb-8">
                {PLANS.map((plan, index) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanIndex(index)}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-lg transition",
                      selectedPlanIndex === index
                        ? 'bg-gold text-background'
                        : 'bg-secondary text-foreground hover:bg-secondary/80',
                      isKorean && "font-[var(--font-noto-kr)]"
                    )}
                  >
                    <div className="font-semibold text-sm">{plan.interval === 'WEEKLY' ? (isKorean ? '二쇨컙' : 'Weekly') : plan.interval === 'MONTHLY' ? (isKorean ? '?붽컙' : 'Monthly') : (isKorean ? '?곌컙' : 'Yearly')}</div>
                    <div className="text-sm">{activeRegion.paymentProvider === 'stripe' ? `$${plan.priceMonthlyUSD.toFixed(2)}` : `??{plan.priceMonthly.toLocaleString()}`}</div>
                    {plan.interval === 'ANNUALLY' && (
                      <div className="text-xs opacity-80">{isKorean ? '33% ?좎씤' : '33% OFF'}</div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <h2 className={cn(
                  "text-2xl font-light text-foreground mb-2",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {isKorean ? selectedPlan.titleKo : selectedPlan.titleEn}
                </h2>
                <p className={cn(
                  "text-muted-foreground",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {isKorean ? selectedPlan.descriptionKo : selectedPlan.descriptionEn}
                </p>
              </div>

              {/* 媛寃??쒖떆 */}
              <div className="text-center mb-8 p-6 bg-gold/5 rounded-xl border border-gold/20">
                <div className="text-4xl font-bold text-gold mb-2">
                  {formatPlanPrice(selectedPlan)}
                </div>
                <div className={cn(
                  "text-sm text-muted-foreground",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {selectedPlan.interval === 'WEEKLY' ? (isKorean ? '二?1??寃곗젣' : 'Billed weekly') : 
                   selectedPlan.interval === 'MONTHLY' ? (isKorean ? '??1??寃곗젣' : 'Billed monthly') : 
                   (isKorean ? '??1??寃곗젣' : 'Billed annually')}
                </div>
              </div>

              {/* 湲곕뒫 紐⑸줉 */}
              <div className="space-y-3 mb-8">
                {(isKorean ? selectedPlan.featuresKo : selectedPlan.featuresEn).map((feature, idx) => (
                  <div key={idx} className={cn(
                    "flex items-center gap-3 text-foreground",
                    isKorean && "font-[var(--font-noto-kr)]"
                  )}>
                    <Check className="w-5 h-5 text-gold flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* 寃곗젣 ?섎떒 */}
              <div className="mb-8">
                <h3 className={cn(
                  "text-sm font-semibold text-foreground mb-3",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {t('subscription.paymentMethod')}
                </h3>
                
                {/* ?쒓뎅: ?좎뒪?섏씠癒쇱툩 */}
                {activeRegion.paymentProvider === 'toss' && (
                  <>
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
                  </>
                )}
                
                {/* ?댁쇅: Stripe */}
                {activeRegion.paymentProvider === 'stripe' && (
                  <div className={cn(
                    "p-4 bg-secondary/50 border border-border rounded-lg",
                    isKorean && "font-[var(--font-noto-kr)]"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-12 h-5" viewBox="0 0 60 25" fill="none">
                        <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z" fill="#635BFF"/>
                      </svg>
                      <span className="text-sm text-muted-foreground">
                        {isKorean ? '?덉쟾??援?젣 寃곗젣' : 'Secure International Payment'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isKorean
                        ? 'Stripe瑜??듯빐 ?좎슜移대뱶, 泥댄겕移대뱶, Apple Pay, Google Pay ???ㅼ뼇??寃곗젣 ?섎떒???ъ슜?????덉뒿?덈떎.'
                        : 'Pay with credit card, debit card, Apple Pay, Google Pay, and more via Stripe.'}
                    </p>
                  </div>
                )}
              </div>

              {/* 援щ룆 踰꾪듉 */}
              <Button
                onClick={handleSubscribe}
                disabled={loading || (activeRegion.paymentProvider === 'toss' && !methodRegistered)}
                className={cn(
                  "w-full bg-gold hover:bg-gold-light text-background py-3 text-lg font-semibold disabled:opacity-50",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
              >
                {loading 
                  ? t('subscription.processing') 
                  : `${t('subscription.planPrice')}${formatPlanPrice(selectedPlan)}`
                }
              </Button>
            </div>
          </motion.div>
        )}

        {/* ?щ젅???뱀뀡 */}
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
                {isKorean ? '?꾩슂??留뚰겮留?異⑹쟾?섏꽭?? : 'Pay as you go'}
              </p>
              <p className={cn(
                "text-sm text-muted-foreground",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {isKorean ? '?щ젅??1媛?= 異붿쿇 1?? : '1 Credit = 1 Recommendation'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                      {isKorean ? '?멸린' : 'POPULAR'}
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
                      {activeRegion.paymentProvider === 'stripe'
                        ? `$${pkg.priceUSD.toFixed(2)}`
                        : `??{pkg.price.toLocaleString()}`}
                    </div>
                    {pkg.discount && (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-muted-foreground line-through">
                          {activeRegion.paymentProvider === 'stripe'
                            ? `$${(pkg.priceUSD + (pkg.savingsUSD || 0)).toFixed(2)}`
                            : `??{(pkg.price + (pkg.savings || 0)).toLocaleString()}`}
                        </span>
                        <span className="text-sm text-gold font-semibold">
                          {pkg.discount}% {isKorean ? '?좎씤' : 'OFF'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-gold" />
                      <span className={isKorean ? "font-[var(--font-noto-kr)]" : ""}>
                        {pkg.credits}{isKorean ? '??異붿쿇' : ' Recommendations'}
                      </span>
                    </div>
                    {pkg.discount && (
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-gold" />
                        <span className={isKorean ? "font-[var(--font-noto-kr)]" : ""}>
                          {activeRegion.paymentProvider === 'stripe'
                            ? `$${(pkg.savingsUSD || 0).toFixed(2)}`
                            : `??{pkg.savings?.toLocaleString()}`} {isKorean ? '?덉빟' : 'saved'}
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
                    {loading ? (isKorean ? '泥섎━ 以?..' : 'Processing...') : (isKorean ? '援щℓ?섍린' : 'Buy Now')}
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* ?щ젅??寃곗젣 ?덈궡 */}
            <div className="max-w-2xl mx-auto">
              <div className={cn(
                "text-center text-sm text-muted-foreground mb-4",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {isKorean ? '?뮩 ?щ젅?㏃? ?쇳쉶??寃곗젣濡?利됱떆 異⑹쟾?⑸땲?? : '?뮩 Credits are charged immediately with one-time payment'}
              </div>
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
        confirmText="?뺤씤"
      />
    </div>
  );
}