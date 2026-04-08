'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
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
            {t('legal.privacy')}
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
              {isKorean ? '1. 개인?�보???�집' : '1. Collection of Personal Information'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? 'PAIRÉ???�음??개인?�보�??�집?�니??' : 'PAIRÉ collects the following personal information:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '?�메??주소' : 'Email address'}</li>
              <li>{isKorean ? '?�용?�명, ?�네?? : 'Username, nickname'}</li>
              <li>{isKorean ? '비�?번호 (?�호???�??' : 'Password (encrypted)'}</li>
              <li>{isKorean ? '?�식 ?�진 (추천 목적)' : 'Food photos (for recommendations)'}</li>
              <li>{isKorean ? '추천 기록 �?취향 ?�보' : 'Recommendation history and preferences'}</li>
              <li>{isKorean ? '결제 ?�보 (결제 ?�단 ?�큰)' : 'Payment information (payment method tokens)'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '2. 개인?�보???�용' : '2. Use of Personal Information'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '?�집??개인?�보???�음??목적?�로�??�용?�니??' : 'Collected personal information is used only for the following purposes:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '?�비???�공 �?개선' : 'Service provision and improvement'}</li>
              <li>{isKorean ? '?�용???�증 �?계정 관�? : 'User authentication and account management'}</li>
              <li>{isKorean ? '추천 ?�고리즘 개선' : 'Recommendation algorithm improvement'}</li>
              <li>{isKorean ? '결제 �?구독 관�? : 'Payment and subscription management'}</li>
              <li>{isKorean ? '고객 지??�?문의 ?�답' : 'Customer support and inquiry responses'}</li>
              <li>{isKorean ? '법적 ?�무 ?�행' : 'Legal compliance'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '3. 개인?�보??보호' : '3. Protection of Personal Information'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? 'PAIRÉ??개인?�보 보호�??�해 ?�음??조치�?취합?�다:' : 'PAIRÉ takes the following measures to protect personal information:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '?�호???�??(비�?번호, 결제 ?�보)' : 'Encrypted storage (passwords, payment info)'}</li>
              <li>{isKorean ? 'HTTPS ?�신' : 'HTTPS communication'}</li>
              <li>{isKorean ? '?�근 ?�어 �?권한 관�? : 'Access control and permission management'}</li>
              <li>{isKorean ? '?�기?�인 보안 감시' : 'Regular security monitoring'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '4. 개인?�보???????�공' : '4. Third-Party Disclosure'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean 
                ? 'PAIRÉ???�용?�의 ?�의 ?�이 개인?�보�????�에�??�공?��? ?�습?�다. ?? ?�음??경우???�외?�니??'
                : 'PAIRÉ does not provide personal information to third parties without user consent, except in the following cases:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '법적 ?�청 ?�는 법원 명령' : 'Legal requests or court orders'}</li>
              <li>{isKorean ? '결제 처리 (결제 ?�?�사)' : 'Payment processing (payment service providers)'}</li>
              <li>{isKorean ? '?�비???�공 (?�라?�드 ?�스????' : 'Service provision (cloud hosting, etc.)'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '5. 개인?�보??보유 �???��' : '5. Retention and Deletion'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '개인?�보???�비???�용 기간 ?�안 보유?�니?? 계정 ??�� ??모든 개인?�보??즉시 ??��?�니??'
                : 'Personal information is retained during the service usage period. All personal information is immediately deleted upon account deletion.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '6. ?�용?�의 권리' : '6. User Rights'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '?�용?�는 ?�음??권리�?가집니??' : 'Users have the following rights:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '개인?�보 ?�람 ?�청' : 'Request to view personal information'}</li>
              <li>{isKorean ? '개인?�보 ?�정 ?�청' : 'Request to modify personal information'}</li>
              <li>{isKorean ? '개인?�보 ??�� ?�청' : 'Request to delete personal information'}</li>
              <li>{isKorean ? '개인?�보 처리 ?��? ?�청' : 'Request to stop processing personal information'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '7. 문의' : '7. Contact'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '개인?�보 처리??관??문의??ruckyrosie@gmail.com?�로 ?�락주세??'
                : 'For inquiries about personal information processing, please contact ruckyrosie@gmail.com.'}
            </p>
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


