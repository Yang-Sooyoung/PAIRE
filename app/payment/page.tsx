'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useUserStore } from '@/app/store/userStore';
import { Button } from '@/components/ui/button';

export default function PaymentPage() {
  const { user } = useUserStore();
  const [plan, setPlan] = useState<'월간' | '연간'>('월간');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/payment/create', { userId: user.id, plan });
      if (res.data.sessionUrl) {
        window.location.href = res.data.sessionUrl;
      } else {
        alert('결제 세션 생성 실패');
      }
    } catch (err) {
      console.error('결제 요청 실패', err);
      alert('결제 요청 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">뷰티 대시보드 구독</h1>
      <div className="flex gap-4 mb-6">
        <button onClick={() => setPlan('월간')} className={`px-6 py-3 rounded-lg border ${plan === '월간' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
          월간 ₩10,000
        </button>
        <button onClick={() => setPlan('연간')} className={`px-6 py-3 rounded-lg border ${plan === '연간' ? 'bg-blue-600 text-white' : 'bg-white'}`}>
          연간 ₩100,000
        </button>
      </div>

      <Button onClick={handlePayment} disabled={loading}>
        {loading ? '요청 중...' : `${plan} 결제하기`}
      </Button>
    </div>
  );
}
