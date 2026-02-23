'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function TermsPage() {
  const router = useRouter();
  const { language, t } = useI18n();
  const isKorean = language === 'ko';

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      {/* 헤더 */}
      <div className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gold hover:text-gold-light transition"
            title={t('common.back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={cn(
            "text-2xl font-light text-foreground tracking-wide",
            isKorean && "font-[var(--font-noto-kr)] tracking-normal"
          )}>
            {t('legal.terms')}
          </h1>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6 text-foreground space-y-6 prose prose-invert max-w-none"
        >
          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '제1조 총칙' : 'Article 1: General Provisions'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean 
                ? '본 약관은 PAIRÉ(이하 "서비스")를 이용하는 모든 사용자에게 적용됩니다. 서비스 이용 시 본 약관에 동의한 것으로 간주됩니다.'
                : 'These terms apply to all users of PAIRÉ (the "Service"). By using the Service, you agree to these terms.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '제2조 서비스 설명' : 'Article 2: Service Description'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? 'PAIRÉ는 음식 사진을 촬영하면 AI가 음식을 인식하고, 사용자의 상황과 취향에 맞는 최적의 음료를 추천해주는 서비스입니다.'
                : 'PAIRÉ is a service that uses AI to recognize food from photos and recommend the perfect drinks based on your situation and preferences.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '제3조 회원 가입' : 'Article 3: Membership'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '회원은 본 약관에 동의하고 필요한 정보를 제공하여 가입할 수 있습니다. 허위 정보 제공 시 서비스 이용이 제한될 수 있습니다.'
                : 'Members can sign up by agreeing to these terms and providing required information. Providing false information may result in service restrictions.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '제4조 서비스 이용' : 'Article 4: Service Usage'}
            </h2>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? 'FREE 회원: 하루 1회 추천 가능' : 'FREE members: 1 recommendation per day'}</li>
              <li>{isKorean ? 'PREMIUM 회원: 무제한 추천 가능' : 'PREMIUM members: Unlimited recommendations'}</li>
              <li>{isKorean ? '비로그인 사용자: 하루 1회 추천 가능' : 'Non-logged-in users: 1 recommendation per day'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '제5조 금지 행위' : 'Article 5: Prohibited Actions'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '다음의 행위는 금지됩니다:' : 'The following actions are prohibited:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '불법적인 콘텐츠 업로드' : 'Uploading illegal content'}</li>
              <li>{isKorean ? '서비스 시스템 해킹 또는 부정 이용' : 'Hacking or unauthorized use of the service'}</li>
              <li>{isKorean ? '타인의 개인정보 도용' : 'Stealing others\' personal information'}</li>
              <li>{isKorean ? '서비스 방해 행위' : 'Interfering with the service'}</li>
            </ul>
          </section>

          <section className="pt-6 border-t border-border">
            <p className={cn(
              "text-sm text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {t('legal.lastUpdated')}
            </p>
          </section>
        </motion.div>

        <div className="mt-8 mb-8">
          <Button
            onClick={() => router.back()}
            className={cn(
              "w-full bg-secondary hover:bg-secondary/80 text-foreground border border-border py-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {t('legal.goBack')}
          </Button>
        </div>
      </div>
    </div>
  );
}
