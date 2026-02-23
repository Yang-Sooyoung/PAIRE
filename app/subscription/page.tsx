// app/subscription/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUserStore } from '@/app/store/userStore';
import { PLANS, type Plan } from './constants/subscriptionPlans';
import { loadTossPayments } from '@tosspayments/sdk';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

export default function SubscriptionPage() {
  const { user, token, setUser } = useUserStore();
  const [methodRegistered, setMethodRegistered] = useState(false);
  const [billingKey, setBillingKey] = useState('');
  const [selectedPlan] = useState<Plan>(PLANS[0]);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getPlanPrice = (plan: Plan) => {
    return billingPeriod === 'yearly'
      ? plan.priceYearly
      : plan.priceMonthly;
  };

  useEffect(() => {
    if (!user || !token) {
      setMethodRegistered(false);
      return;
    }

    (async () => {
      try {
        const r = await axios.get('/api/subscription/methods', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (r.data?.success && r.data.methods?.length > 0) {
          const m = r.data.methods[0];
          setMethodRegistered(true);
          setBillingKey(m.billingKey ?? '');
        } else {
          setMethodRegistered(false);
        }
      } catch (err: any) {
        console.error('fetch payment methods error', err?.response?.data ?? err?.message);
        setMethodRegistered(false);
      }
    })();
  }, [user, token]);

  const handleRegisterBilling = async () => {
    if (!user) return router.push('/login');

    try {
      setLoading(true);
      const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_TEST_CLIENT_KEY!);
      const customerKey = `user_${user.id}`;
      const price = getPlanPrice(selectedPlan);
      const interval = billingPeriod === 'monthly' ? 'MONTHLY' : 'ANNUALLY';

      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
      await tossPayments.requestBillingAuth('카드', {
        customerKey,
        successUrl: `${apiUrl}/api/subscription/billing-callback?plan=${selectedPlan.membership}&interval=${interval}&price=${price}`,
        failUrl: `${window.location.origin}/subscription/fail`,
      });
    } catch (error) {
      console.error(error);
      alert('결제 수단 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user || !token) return alert('로그인 필요');
    if (!methodRegistered && !billingKey) return alert('결제수단을 먼저 등록하세요.');

    try {
      setLoading(true);
      const priceNumber = Number(getPlanPrice(selectedPlan));
      const interval = billingPeriod === 'monthly' ? 'MONTHLY' : 'ANNUALLY';

      const payload = {
        planId: selectedPlan.id,
        membership: selectedPlan.membership,
        interval,
        price: priceNumber,
        billingKey,
      };

      const res = await axios.post('/api/subscription/create', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.subscription || res.data?.success) {
        setUser({ ...user, membership: 'PREMIUM' });
        router.push('/subscription/success');
      } else {
        alert(res.data?.message ?? '구독 생성 실패');
      }
    } catch (err: any) {
      console.error('subscribe error', err?.response?.data ?? err?.message);
      alert(err?.response?.data?.message ?? err?.message ?? '구독 요청 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-white mb-2">PREMIUM 구독</h1>
          <p className="text-slate-400">무제한 음료 추천으로 매 순간을 특별하게</p>
        </div>

        {/* 플랜 카드 */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-light text-white mb-2">{selectedPlan.title}</h2>
              <p className="text-slate-400">{selectedPlan.description}</p>
            </div>
          </div>

          {/* 가격 선택 */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`flex-1 py-3 px-4 rounded-lg transition ${billingPeriod === 'monthly'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
            >
              <div className="font-semibold">월간</div>
              <div className="text-sm">₩{selectedPlan.priceMonthly.toLocaleString()}</div>
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`flex-1 py-3 px-4 rounded-lg transition ${billingPeriod === 'yearly'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
            >
              <div className="font-semibold">연간</div>
              <div className="text-sm">₩{selectedPlan.priceYearly.toLocaleString()}</div>
            </button>
          </div>

          {/* 기능 목록 */}
          <div className="space-y-3 mb-8">
            {selectedPlan.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-slate-300">
                <Check className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* 결제 수단 */}
          <div className="mb-8 pb-8 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">결제 수단</h3>
            {methodRegistered ? (
              <div className="text-slate-400 text-sm">
                ✓ 등록된 결제수단: **** **** **** {billingKey.slice(-4)}
              </div>
            ) : (
              <Button
                onClick={handleRegisterBilling}
                disabled={loading}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white"
              >
                {loading ? '등록 중...' : '결제수단 등록'}
              </Button>
            )}
          </div>

          {/* 구독 버튼 */}
          <Button
            onClick={handleSubscribe}
            disabled={loading || !methodRegistered}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 text-lg font-semibold"
          >
            {loading ? '처리 중...' : `구독하기 — ₩${getPlanPrice(selectedPlan).toLocaleString()}`}
          </Button>
        </div>

        {/* 취소 버튼 */}
        <div className="text-center">
          <button
            onClick={() => router.back()}
            className="text-slate-400 hover:text-slate-300 transition"
          >
            돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
