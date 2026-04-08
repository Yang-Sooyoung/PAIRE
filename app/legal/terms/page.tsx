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
      {/* 배경 ?�과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      {/* ?�더 */}
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
            "text-lg font-medium text-foreground tracking-wide",
            isKorean && "font-[var(--font-noto-kr)] tracking-normal"
          )}>
            {t('legal.terms')}
          </h1>
        </div>
      </div>

      {/* 콘텐�?*/}
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
              {isKorean ? '??�?총칙' : 'Article 1: General Provisions'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean 
                ? '�??��??� PAIRÉ(?�하 "?�비??)�??�용?�는 모든 ?�용?�에�??�용?�니?? ?�비???�용 ??�??��????�의??것으�?간주?�니??'
                : 'These terms apply to all users of PAIRÉ (the "Service"). By using the Service, you agree to these terms.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '??�??�비???�명' : 'Article 2: Service Description'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? 'PAIRÉ???�식 ?�진??촬영?�면 AI가 ?�식???�식?�고, ?�용?�의 ?�황�?취향??맞는 최적???�료�?추천?�주???�비?�입?�다.'
                : 'PAIRÉ is a service that uses AI to recognize food from photos and recommend the perfect drinks based on your situation and preferences.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '??�??�원 가?? : 'Article 3: Membership'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '?�원?� �??��????�의?�고 ?�요???�보�??�공?�여 가?�할 ???�습?�다. ?�위 ?�보 ?�공 ???�비???�용???�한?????�습?�다.'
                : 'Members can sign up by agreeing to these terms and providing required information. Providing false information may result in service restrictions.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '??�??�비???�용' : 'Article 4: Service Usage'}
            </h2>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? 'FREE ?�원: ?�루 1??추천 가?? : 'FREE members: 1 recommendation per day'}</li>
              <li>{isKorean ? 'PREMIUM ?�원: 무제??추천 가?? : 'PREMIUM members: Unlimited recommendations'}</li>
              <li>{isKorean ? '비로그인 ?�용?? ?�루 1??추천 가?? : 'Non-logged-in users: 1 recommendation per day'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '??�?금�? ?�위' : 'Article 5: Prohibited Actions'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '?�음???�위??금�??�니??' : 'The following actions are prohibited:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '불법?�인 콘텐�??�로?? : 'Uploading illegal content'}</li>
              <li>{isKorean ? '?�비???�스???�킹 ?�는 부???�용' : 'Hacking or unauthorized use of the service'}</li>
              <li>{isKorean ? '?�?�의 개인?�보 ?�용' : 'Stealing others\' personal information'}</li>
              <li>{isKorean ? '?�비??방해 ?�위' : 'Interfering with the service'}</li>
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


