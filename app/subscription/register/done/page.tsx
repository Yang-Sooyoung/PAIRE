"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

function RegisterDoneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useI18n();
  const isKorean = language === 'ko';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  
  const billingAuthKey = searchParams.get("billingAuthKey");
  const customerKey = searchParams.get("customerKey");

  useEffect(() => {
    if (billingAuthKey && customerKey) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      
      fetch(`${API_URL}/subscription/register-method`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ billingAuthKey, customerKey }),
      }).then(async (res) => {
        if (res.ok) {
          setStatus('success');
          setTimeout(() => {
            router.push('/subscription');
          }, 2000);
        } else {
          setStatus('error');
          setTimeout(() => {
            router.push('/subscription');
          }, 3000);
        }
      }).catch(() => {
        setStatus('error');
        setTimeout(() => {
          router.push('/subscription');
        }, 3000);
      });
    }
  }, [billingAuthKey, customerKey, router]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center relative z-10"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-gold animate-spin mx-auto mb-4" />
            <p className={cn(
              "text-foreground text-lg",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '결제수단 등록 중입니다...' : 'Registering payment method...'}
            </p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="mb-4 flex justify-center"
            >
              <div className="bg-green-500/20 border border-green-500 rounded-full p-4">
                <Check className="w-12 h-12 text-green-500" />
              </div>
            </motion.div>
            <p className={cn(
              "text-foreground text-lg mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '결제수단 등록 완료!' : 'Payment method registered!'}
            </p>
            <p className={cn(
              "text-muted-foreground text-sm",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '구독 페이지로 이동합니다...' : 'Redirecting to subscription page...'}
            </p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <p className={cn(
              "text-destructive text-lg mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '결제수단 등록 실패' : 'Failed to register payment method'}
            </p>
            <p className={cn(
              "text-muted-foreground text-sm",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '구독 페이지로 돌아갑니다...' : 'Returning to subscription page...'}
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function RegisterDonePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-gold animate-spin" />
      </div>
    }>
      <RegisterDoneContent />
    </Suspense>
  );
}
