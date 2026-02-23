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
            {t('legal.privacy')}
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
              {isKorean ? '1. 개인정보의 수집' : '1. Collection of Personal Information'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? 'PAIRÉ는 다음의 개인정보를 수집합니다:' : 'PAIRÉ collects the following personal information:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '이메일 주소' : 'Email address'}</li>
              <li>{isKorean ? '사용자명, 닉네임' : 'Username, nickname'}</li>
              <li>{isKorean ? '비밀번호 (암호화 저장)' : 'Password (encrypted)'}</li>
              <li>{isKorean ? '음식 사진 (추천 목적)' : 'Food photos (for recommendations)'}</li>
              <li>{isKorean ? '추천 기록 및 취향 정보' : 'Recommendation history and preferences'}</li>
              <li>{isKorean ? '결제 정보 (결제 수단 토큰)' : 'Payment information (payment method tokens)'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '2. 개인정보의 이용' : '2. Use of Personal Information'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '수집된 개인정보는 다음의 목적으로만 이용됩니다:' : 'Collected personal information is used only for the following purposes:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '서비스 제공 및 개선' : 'Service provision and improvement'}</li>
              <li>{isKorean ? '사용자 인증 및 계정 관리' : 'User authentication and account management'}</li>
              <li>{isKorean ? '추천 알고리즘 개선' : 'Recommendation algorithm improvement'}</li>
              <li>{isKorean ? '결제 및 구독 관리' : 'Payment and subscription management'}</li>
              <li>{isKorean ? '고객 지원 및 문의 응답' : 'Customer support and inquiry responses'}</li>
              <li>{isKorean ? '법적 의무 이행' : 'Legal compliance'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '3. 개인정보의 보호' : '3. Protection of Personal Information'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? 'PAIRÉ는 개인정보 보호를 위해 다음의 조치를 취합니다:' : 'PAIRÉ takes the following measures to protect personal information:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '암호화 저장 (비밀번호, 결제 정보)' : 'Encrypted storage (passwords, payment info)'}</li>
              <li>{isKorean ? 'HTTPS 통신' : 'HTTPS communication'}</li>
              <li>{isKorean ? '접근 제어 및 권한 관리' : 'Access control and permission management'}</li>
              <li>{isKorean ? '정기적인 보안 감시' : 'Regular security monitoring'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '4. 개인정보의 제3자 제공' : '4. Third-Party Disclosure'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean 
                ? 'PAIRÉ는 사용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 다음의 경우는 예외입니다:'
                : 'PAIRÉ does not provide personal information to third parties without user consent, except in the following cases:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '법적 요청 또는 법원 명령' : 'Legal requests or court orders'}</li>
              <li>{isKorean ? '결제 처리 (결제 대행사)' : 'Payment processing (payment service providers)'}</li>
              <li>{isKorean ? '서비스 제공 (클라우드 호스팅 등)' : 'Service provision (cloud hosting, etc.)'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '5. 개인정보의 보유 및 삭제' : '5. Retention and Deletion'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '개인정보는 서비스 이용 기간 동안 보유됩니다. 계정 삭제 시 모든 개인정보는 즉시 삭제됩니다.'
                : 'Personal information is retained during the service usage period. All personal information is immediately deleted upon account deletion.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '6. 사용자의 권리' : '6. User Rights'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '사용자는 다음의 권리를 가집니다:' : 'Users have the following rights:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '개인정보 열람 요청' : 'Request to view personal information'}</li>
              <li>{isKorean ? '개인정보 수정 요청' : 'Request to modify personal information'}</li>
              <li>{isKorean ? '개인정보 삭제 요청' : 'Request to delete personal information'}</li>
              <li>{isKorean ? '개인정보 처리 정지 요청' : 'Request to stop processing personal information'}</li>
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
                ? '개인정보 처리에 관한 문의는 support@paire.app으로 연락주세요.'
                : 'For inquiries about personal information processing, please contact support@paire.app.'}
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
