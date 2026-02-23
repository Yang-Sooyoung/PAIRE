'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 px-4">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="bg-red-500/20 border border-red-500 rounded-full p-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>

          <h1 className="text-3xl font-light text-white mb-2">문제가 발생했어요</h1>
          <p className="text-slate-400 mb-8">
            예상치 못한 오류가 발생했습니다.
            <br />
            다시 시도해주세요.
          </p>

          {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-900/20 border border-red-700 rounded p-4 mb-6 text-left">
                <p className="text-red-300 text-sm font-mono break-words">
                  {error.message}
                </p>
              </div>
          )}

          <div className="space-y-3">
            <Button
                onClick={reset}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3"
            >
              다시 시도
            </Button>
            <Button
                onClick={() => window.location.href = '/'}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3"
            >
              홈으로 이동
            </Button>
          </div>
        </div>
      </div>
  );
}
