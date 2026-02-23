'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function PaymentPolicyPage() {
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
            {t('legal.payment')}
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
              {isKorean ? '1. 결제 방법' : '1. Payment Methods'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? 'PAIRÉ는 Toss Payments를 통해 안전한 결제를 제공합니다. 신용카드, 체크카드 등 다양한 결제 수단을 지원합니다.'
                : 'PAIRÉ provides secure payments through Toss Payments. We support various payment methods including credit cards and debit cards.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '2. 구독 가격' : '2. Subscription Pricing'}
            </h2>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? 'PREMIUM 월간: ₩9,900' : 'PREMIUM Monthly: ₩9,900'}</li>
              <li>{isKorean ? 'PREMIUM 연간: ₩99,000' : 'PREMIUM Yearly: ₩99,000'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '3. 자동 갱신' : '3. Auto-Renewal'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? 'PREMIUM 구독은 자동으로 갱신됩니다. 갱신 예정일 7일 전에 알림을 드립니다.'
                : 'PREMIUM subscriptions are automatically renewed. You will be notified 7 days before the renewal date.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '4. 구독 취소' : '4. Subscription Cancellation'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '구독은 언제든지 취소할 수 있습니다. 취소 후 남은 기간은 계속 사용할 수 있으며, 다음 갱신일부터 FREE로 변경됩니다.'
                : 'You can cancel your subscription at any time. After cancellation, you can continue using the service for the remaining period, and it will change to FREE from the next renewal date.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '5. 환불 정책' : '5. Refund Policy'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '구독 취소 후 이미 결제된 금액은 환불되지 않습니다. 단, 다음의 경우는 환불 대상입니다:'
                : 'Already paid amounts are not refunded after subscription cancellation. However, refunds are available in the following cases:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '결제 오류로 인한 중복 결제' : 'Duplicate payments due to payment errors'}</li>
              <li>{isKorean ? '서비스 제공 불가 (7일 이상)' : 'Service unavailability (7+ days)'}</li>
              <li>{isKorean ? '사용자 요청 (구독 후 7일 이내)' : 'User request (within 7 days of subscription)'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '6. 환불 신청' : '6. Refund Request'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '환불을 원하시면 support@paire.app으로 문의해주세요. 신청 후 5-7 영업일 내에 처리됩니다.'
                : 'For refund requests, please contact support@paire.app. Requests will be processed within 5-7 business days.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '7. 결제 실패' : '7. Payment Failure'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '결제 실패 시 다음 날 자동으로 재시도됩니다. 3회 연속 실패 시 구독이 일시 중단됩니다.'
                : 'If payment fails, it will be automatically retried the next day. After 3 consecutive failures, the subscription will be temporarily suspended.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '8. 가격 변경' : '8. Price Changes'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? 'PAIRÉ는 가격을 변경할 수 있습니다. 가격 변경 시 30일 전에 공지하며, 기존 구독자는 변경 전 가격으로 1회 더 갱신됩니다.'
                : 'PAIRÉ may change prices. Price changes will be announced 30 days in advance, and existing subscribers will be renewed once more at the previous price.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '9. 세금' : '9. Taxes'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '표시된 가격은 부가세 포함 가격입니다. 지역에 따라 추가 세금이 부과될 수 있습니다.'
                : 'Displayed prices include VAT. Additional taxes may apply depending on your region.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '10. 분쟁 해결' : '10. Dispute Resolution'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '결제 관련 분쟁은 support@paire.app으로 문의해주세요. 성실하게 해결하겠습니다.'
                : 'For payment-related disputes, please contact support@paire.app. We will resolve them sincerely.'}
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
