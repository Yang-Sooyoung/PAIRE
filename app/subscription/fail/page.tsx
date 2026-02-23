'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function SubscriptionFailPage() {
  const router = useRouter();

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 px-4">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-red-500/20 border border-red-500 rounded-full p-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>

          <h1 className="text-3xl font-light text-white mb-2">구독 실패</h1>
          <p className="text-slate-400 mb-8">
            구독 처리 중 문제가 발생했습니다.
            <br />
            다시 시도해주세요.
          </p>

          <div className="space-y-3">
            <Button
                onClick={() => router.push('/subscription')}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3"
            >
              다시 시도
            </Button>
            <Button
                onClick={() => router.push('/user-info')}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3"
            >
              돌아가기
            </Button>
          </div>
        </div>
      </div>
  );
}
