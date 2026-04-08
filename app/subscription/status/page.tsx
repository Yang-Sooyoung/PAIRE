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
      // 援щ룆 ?뺣낫 ?놁쑝硫?援щ룆 ?섏씠吏濡?      router.push('/subscription');
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
      
      // 援щ룆 ?뺣낫 ?ㅼ떆 媛?몄삤湲?      await fetchSubscriptionStatus();
      
      // ?ъ슜???뺣낫 ?낅뜲?댄듃 (硫ㅻ쾭??? ?좎??섏?留?援щ룆 ?곹깭??CANCELLED)
      if (user) {
        // ?ъ슜???뺣낫 ?덈줈怨좎묠
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

      // 2珥???援щ룆 ?섏씠吏濡??대룞
      setTimeout(() => {
        router.push('/subscription');
      }, 2000);
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      setErrorMessage(error.response?.data?.message || (isKorean ? '援щ룆 痍⑥냼???ㅽ뙣?덉뒿?덈떎.' : 'Failed to cancel subscription.'));
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
    return null; // fetchSubscriptionStatus?먯꽌 ?대? redirect 泥섎━
  }

  const nextBillingDate = new Date(subscription.nextBillingDate);
  const formattedDate = nextBillingDate.toLocaleDateString(isKorean ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 諛곌꼍 ?④낵 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      {/* ?ㅻ뜑 */}
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
            {isKorean ? '援щ룆 愿由? : 'Manage Subscription'}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12 relative z-10">
        {/* 援щ룆 ?곹깭 移대뱶 */}
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
                    {isKorean ? '?댁? ?덉젙' : 'Cancelled'}
                  </span>
                )}
              </div>
              <p className={cn(
                "text-sm mt-1",
                subscription.status === 'CANCELLED' ? "text-orange-500" : "text-gold",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {subscription.interval === 'WEEKLY'
                  ? (isKorean ? '二쇨컙 援щ룆' : 'Weekly Subscription')
                  : subscription.interval === 'MONTHLY' 
                  ? (isKorean ? '?붽컙 援щ룆' : 'Monthly Subscription')
                  : (isKorean ? '?곌컙 援щ룆' : 'Annual Subscription')}
              </p>
            </div>
          </div>

          {/* ?댁? ?덈궡 硫붿떆吏 */}
          {subscription.status === 'CANCELLED' && (
            <div className="mb-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className={cn(
                "text-sm text-foreground",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {isKorean
                  ? `援щ룆???댁??섏뿀?듬땲?? ${formattedDate}源뚯? PREMIUM ?쒗깮??怨꾩냽 ?댁슜?섏떎 ???덉뒿?덈떎.`
                  : `Your subscription has been cancelled. You can continue using PREMIUM benefits until ${formattedDate}.`}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {/* 留뚮즺???ㅼ쓬 寃곗젣??*/}
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
                    ? (isKorean ? '留뚮즺?? : 'Expires On')
                    : (isKorean ? '?ㅼ쓬 寃곗젣?? : 'Next Billing Date')}
                </span>
              </div>
              <span className={cn(
                "text-foreground font-medium",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {formattedDate}
              </span>
            </div>

            {/* 寃곗젣 湲덉븸 */}
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
                  {isKorean ? '?뚮옖 湲덉븸' : 'Plan Amount'}
                </span>
              </div>
              <span className="text-foreground font-medium">
                {subscription.isStripe
                  ? `$${(subscription.price / 100).toFixed(2)}`
                  : `??{subscription.price.toLocaleString()}`}
              </span>
            </div>

            {/* 寃곗젣 ?섎떒 */}
            {subscription.status !== 'CANCELLED' && (
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gold" />
                  <span className={cn(
                    "text-muted-foreground",
                    isKorean && "font-[var(--font-noto-kr)]"
                  )}>
                    {isKorean ? '寃곗젣 ?섎떒' : 'Payment Method'}
                  </span>
                </div>
                <span className="text-foreground font-medium">
                  {subscription.paymentMethod}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ?꾨━誘몄뾼 ?쒗깮 */}
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
            {isKorean ? '?꾨━誘몄뾼 ?쒗깮' : 'Premium Benefits'}
          </h3>
          <ul className="space-y-3">
            {[
              isKorean ? '臾댁젣???뚮즺 異붿쿇' : 'Unlimited recommendations',
              isKorean ? '異붿쿇 ?덉뒪?좊━ ??? : 'Save recommendation history',
              isKorean ? '利먭꺼李얘린 湲곕뒫' : 'Favorites feature',
              isKorean ? '?곗꽑 怨좉컼 吏?? : 'Priority support',
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

        {/* 援щ룆 痍⑥냼/?ы솢?깊솕 踰꾪듉 */}
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
                {isKorean ? '?ㅼ떆 援щ룆?섍린' : 'Resubscribe'}
              </Button>
              <Button
                onClick={() => router.push('/subscription?tab=credit')}
                variant="outline"
                className={cn(
                  "flex-1 h-14 border-gold/40 text-gold hover:bg-gold/10",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
              >
                {isKorean ? '?щ젅??異⑹쟾' : 'Buy Credits'}
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
                {isKorean ? '?뚮옖 蹂寃? : 'Change Plan'}
              </Button>
              <Button
                onClick={() => setShowCancelDialog(true)}
                variant="outline"
                className={cn(
                  "flex-1 h-14 border-destructive/30 text-destructive hover:bg-destructive/10",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
              >
                {isKorean ? '援щ룆 痍⑥냼' : 'Cancel Subscription'}
              </Button>
            </>
          )}
        </motion.div>
      </div>

      {/* 痍⑥냼 ?뺤씤 ?ㅼ씠?쇰줈洹?*/}
      <CustomDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelSubscription}
        type="confirm"
        title={isKorean ? '援щ룆??痍⑥냼?섏떆寃좎뼱??' : 'Cancel Subscription?'}
        description={
          isKorean
            ? `?ㅼ쓬 寃곗젣??${formattedDate})遺??FREE ?뚮옖?쇰줈 ?꾪솚?⑸땲?? 洹??꾧퉴吏??PREMIUM ?쒗깮??怨꾩냽 ?댁슜?????덉뒿?덈떎.`
            : `Your subscription will be downgraded to FREE plan from ${formattedDate}. You can continue using PREMIUM benefits until then.`
        }
        confirmText={cancelling ? (isKorean ? '痍⑥냼 以?..' : 'Cancelling...') : (isKorean ? '援щ룆 痍⑥냼' : 'Cancel')}
        cancelText={isKorean ? '?뚯븘媛湲? : 'Go Back'}
      />

      {/* ?깃났 ?ㅼ씠?쇰줈洹?*/}
      <CustomDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        type="success"
        title={isKorean ? '援щ룆??痍⑥냼?섏뿀?듬땲?? : 'Subscription Cancelled'}
        description={
          isKorean
            ? `${formattedDate}源뚯? PREMIUM ?쒗깮???댁슜?????덉뒿?덈떎.`
            : `You can use PREMIUM benefits until ${formattedDate}.`
        }
        confirmText={isKorean ? '?뺤씤' : 'OK'}
      />

      {/* ?먮윭 ?ㅼ씠?쇰줈洹?*/}
      <CustomDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        type="error"
        title={isKorean ? '?ㅻ쪟 諛쒖깮' : 'Error'}
        description={errorMessage}
        confirmText={isKorean ? '?뺤씤' : 'OK'}
      />
    </div>
  );
}