'use client';

import React, { useState } from 'react';
import { loadTossPayments } from '@tosspayments/sdk';
import { PLANS } from '@/app/subscription/constants/subscriptionPlans';
import { useUserStore } from '@/app/store/userStore';
import { Button } from '@/components/ui/button';

export default function SubscribeRegister() {
  const { user } = useUserStore();
  const [selectedPlanId, setSelectedPlanId] = useState(PLANS[0].id);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  const getPlanPrice = (plan: any) => {
    return billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly;
  };

  const handleRegisterBilling = async () => {
    if (!user) {
      alert('로그인이 필요합니다');
      return;
    }

    try {
      setLoading(true);
      const selectedPlan = PLANS.find(plan => plan.id === selectedPlanId);
      if (!selectedPlan) {
        alert('플랜을 찾을 수 없습니다.');
        return;
      }
      // TODO :: 키 교체
      const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_TEST_CLIENT_KEY!);
      const customerKey = `user_${user.id}`;
      const price = getPlanPrice(selectedPlan);
      const interval = billingPeriod === 'monthly' ? 'MONTHLY' : 'ANNUALLY';

      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
      await tossPayments.requestBillingAuth("카드", {
        customerKey,
        successUrl: `${apiUrl}/api/subscription/billing-callback?plan=${selectedPlan.membership}&interval=${interval}&price=${price}`,
        failUrl: `${window.location.origin}/subscription/billing-fail`
      });
    } catch (error) {
      console.error(error);
      alert('결제 수단 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">구독 플랜 선택</h2>

        {/* ✅ 월간/연간 탭 */}
        <div className="flex gap-2 mb-4">
          <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded ${billingPeriod === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            월간
          </button>
          <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded ${billingPeriod === 'yearly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            연간
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {PLANS.map(plan => (
              <div key={plan.id}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={selectedPlanId === plan.id}
                      onChange={() => setSelectedPlanId(plan.id)}
                  />
                  <span>
                {plan.title} - {getPlanPrice(plan).toLocaleString()}원
              </span>
                </label>
              </div>
          ))}
        </div>

        <Button onClick={handleRegisterBilling} disabled={loading}>
          {loading ? '요청 중...' : '결제 수단 등록'}
        </Button>
      </div>
  );
}
