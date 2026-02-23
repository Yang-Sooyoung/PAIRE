'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

export default function NotFound() {
  const router = useRouter();
  const { language } = useI18n();
  const isKorean = language === 'ko';

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md relative z-10"
      >
        {/* 로고 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-light text-foreground tracking-widest mb-2">PAIRÉ</h1>
          <div className="h-px w-24 bg-gold/30 mx-auto" />
        </motion.div>

        {/* 404 아이콘 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="mb-6 flex justify-center"
        >
          <div className="bg-gold/10 border border-gold/30 rounded-full p-4">
            <Search className="w-12 h-12 text-gold" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="mb-4">
            <span className="text-6xl font-light text-gold/50">404</span>
          </div>
          
          <h2 className={cn(
            "text-2xl font-light text-foreground mb-3",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean ? '페이지를 찾을 수 없어요' : 'Page Not Found'}
          </h2>
          <p className={cn(
            "text-muted-foreground mb-8",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean ? (
              <>
                요청하신 페이지가 존재하지 않습니다.
                <br />
                다른 페이지로 이동해주세요.
              </>
            ) : (
              <>
                The page you're looking for doesn't exist.
                <br />
                Please navigate to another page.
              </>
            )}
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => router.back()}
              className={cn(
                "w-full bg-gold hover:bg-gold-light text-background py-3",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {isKorean ? '이전 페이지' : 'Go Back'}
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className={cn(
                "w-full border-border text-foreground hover:bg-secondary py-3",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              <Home className="w-4 h-4 mr-2" />
              {isKorean ? '홈으로 이동' : 'Go Home'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
