'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import axios from 'axios';

export default function SubscriptionStatusPage() {
  const router = useRouter();
  const { user, token } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);

  useEffect(() => {
    if (!user || !token) {
      router.push('/login');
      return;
    }

    // 구독 정보 조회
    (async () => {
      try {
        const res = await axios.get('/api/subscription/status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubscriptionInfo(res.data);
      } catch (err) {
        console.error('Failed to fetch subscription status:', err);
      }
    })();
  }, [user, token, router]);

  const handleCancel = async () => {
    if (!token) return;

    try {
      setLoading(true);
      await axios.post(
          '/api/subscription/cancel',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('구독이 취소되었습니다.');
      router.push('/user-info');
    } catch (err: any) {
      alert(err?.response?.data?.message || '구독 취소 실패');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
    );
  }

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-white mb-2">구독 관리</h1>
            <p className="text-slate-400">현재 PREMIUM 멤버십 중입니다</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-slate-300 mb-2">현재 플랜</h2>
                <p className="text-2xl font-light text-white">PREMIUM</p>
              </div>

              {subscriptionInfo && (
                  <>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-300 mb-2">갱신 날짜</h2>
                      <p className="text-white">
                        {new Date(subscriptionInfo.nextBillingDate).toLocaleDateString('ko-KR')}
                      </p>
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-slate-300 mb-2">결제 수단</h2>
                      <p className="text-white">
                        {subscriptionInfo.paymentMethod || '등록된 결제 수단'}
                      </p>
                    </div>
                  </>
              )}

              <div className="pt-6 border-t border-slate-700">
                <h2 className="text-sm font-semibold text-slate-300 mb-4">PREMIUM 혜택</h2>
                <ul className="space-y-2 text-slate-300">
                  <li>✓ 무제한 음료 추천</li>
                  <li>✓ 상황별 맞춤 추천</li>
                  <li>✓ 추천 히스토리 저장</li>
                  <li>✓ 즐겨찾기 기능</li>
                  <li>✓ 공유 기능</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
                onClick={() => router.push('/')}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3"
            >
              추천 계속하기
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                    className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-700 py-3"
                >
                  구독 취소
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-800 border-slate-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">구독을 취소하시겠어요?</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    구독을 취소하면 다음 갱신일부터 FREE 플랜으로 변경됩니다.
                    현재 남은 기간은 계속 사용할 수 있습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-3">
                  <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600">
                    계속 구독
                  </AlertDialogCancel>
                  <AlertDialogAction
                      onClick={handleCancel}
                      disabled={loading}
                      className="bg-red-900 hover:bg-red-800 text-white"
                  >
                    {loading ? '처리 중...' : '구독 취소'}
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="text-center mt-6">
            <button
                onClick={() => router.push('/user-info')}
                className="text-slate-400 hover:text-slate-300 transition"
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
  );
}
