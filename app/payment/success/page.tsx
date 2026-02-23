'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/user-info');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 px-4">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-green-500/20 border border-green-500 rounded-full p-4">
              <Check className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <h1 className="text-3xl font-light text-white mb-2">결제 완료</h1>
          <p className="text-slate-400 mb-8">
            결제가 성공적으로 완료되었습니다.
          </p>

          <div className="space-y-3">
            <Button
                onClick={() => router.push('/')}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3"
            >
              홈으로 이동
            </Button>
          </div>

          <p className="text-slate-500 text-sm mt-6">
            3초 후 자동으로 이동합니다...
          </p>
        </div>
      </div>
  );
}
