'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 px-4">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-full p-4">
              <AlertCircle className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          <h1 className="text-3xl font-light text-white mb-2">페이지를 찾을 수 없어요</h1>
          <p className="text-slate-400 mb-8">
            요청하신 페이지가 존재하지 않습니다.
            <br />
            다른 페이지로 이동해주세요.
          </p>

          <div className="space-y-3">
            <Button
                onClick={() => router.back()}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3"
            >
              이전 페이지
            </Button>
            <Button
                onClick={() => router.push('/')}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3"
            >
              홈으로 이동
            </Button>
          </div>
        </div>
      </div>
  );
}
