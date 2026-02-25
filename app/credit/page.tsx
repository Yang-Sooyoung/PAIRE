'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import { loadTossPayments } from '@tosspayments/sdk';

const CREDIT_PACKAGES = [
  {
    id: 'CREDIT_5',
    credits: 5,
    price: 5000,
    nameKo: '크레딧 5회',
    nameEn: '5 Credits',
    descKo: '추천 5회 이용권',
    descEn: '5 Recommendations',
    badge: '🌟',
  },
  {
    id: 'CREDIT_10',
    credits: 10,
    price: 9000,
    nameKo: '크레딧 10회',
    nameEn: '10 Credits',
    descKo: '추천 10회 이용권',
    descEn: '10 Recommendations',
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
    descKo: '추천 30회 이용권',
    descEn: '30 Recommendations',
    badge: '✨',
    discount: 20,
    savings: 6000,
    popular: true,
  },
];

export default function CreditPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { language } = useI18n();
  const isKorean = language === 'ko';
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // 크레딧 잔액 조회
    const fetchBalance = async () => {
      try {
        const currentToken = useUserStore.getState().token;
        if (!currentToken) return;

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_URL}/credit/balance`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setCredits(data.credits || 0);
        }
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      }
    };

    fetchBalance();
  }, [user, router]);

  const handlePurchase = async (pkg: typeof CREDIT_PACKAGES[0]) => {
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

      // 구매 생성
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

      // Toss Payments 결제 위젯
      const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_TEST_CLIENT_KEY!);

      await tossPayments.requestPayment('카드', {
        amount,
        orderId,
        orderName,
        successUrl: `${window.location.origin}/credit/success`,
        failUrl: `${window.location.origin}/credit/fail`,
      });
    } catch (error) {
      console.error('Purchase error:', error);
      alert(isKorean ? '구매 중 오류가 발생했습니다.' : 'Purchase failed.');
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
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
              {isKorean ? '크레딧 구매' : 'Buy Credits'}
            </h1>
          </div>
          
          {/* 크레딧 잔액 */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-gold font-semibold">{credits}</span>
            <span className={cn(
              "text-gold-dim text-sm",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '크레딧' : 'Credits'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        {/* 설명 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className={cn(
            "text-muted-foreground mb-2",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean
              ? '크레딧으로 원하는 만큼만 이용하세요'
              : 'Use credits to get recommendations as you need'}
          </p>
          <p className={cn(
            "text-sm text-muted-foreground",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean
              ? '크레딧 1개 = 추천 1회'
              : '1 Credit = 1 Recommendation'}
          </p>
        </motion.div>

        {/* 패키지 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CREDIT_PACKAGES.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative bg-card border rounded-xl p-6 hover:border-gold/50 transition-all",
                pkg.popular ? "border-gold/30 shadow-lg shadow-gold/10" : "border-border"
              )}
            >
              {/* 인기 배지 */}
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold text-background text-xs font-semibold rounded-full">
                  {isKorean ? '인기' : 'POPULAR'}
                </div>
              )}

              {/* 이모지 */}
              <div className="text-4xl mb-4 text-center">{pkg.badge}</div>

              {/* 패키지 이름 */}
              <h3 className={cn(
                "text-xl font-semibold text-foreground text-center mb-2",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {isKorean ? pkg.nameKo : pkg.nameEn}
              </h3>

              {/* 설명 */}
              <p className={cn(
                "text-sm text-muted-foreground text-center mb-4",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {isKorean ? pkg.descKo : pkg.descEn}
              </p>

              {/* 가격 */}
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

              {/* 혜택 */}
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

              {/* 구매 버튼 */}
              <Button
                onClick={() => handlePurchase(pkg)}
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

        {/* 하단 안내 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className={cn(
            "text-sm text-muted-foreground mb-4",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean
              ? '💡 더 자주 이용하신다면 PREMIUM 구독을 추천드려요!'
              : '💡 Use frequently? Try PREMIUM subscription!'}
          </p>
          <Button
            onClick={() => router.push('/subscription')}
            variant="outline"
            className={cn(
              "border-gold/40 text-gold hover:bg-gold/10",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {isKorean ? 'PREMIUM 구독 보기' : 'View PREMIUM Plans'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
