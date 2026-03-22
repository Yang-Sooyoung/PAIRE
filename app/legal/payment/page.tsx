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
            "text-2xl font-light text-foreground tracking-wide",
            isKorean && "font-[var(--font-noto-kr)] tracking-normal"
          )}>
            {t('legal.payment')}
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
              {isKorean ? '1. 결제 방법' : '1. Payment Methods'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? 'PAIRÉ??Toss Payments�??�해 ?�전??결제�??�공?�니?? ?�용카드, 체크카드 ???�양??결제 ?�단??지?�합?�다.'
                : 'PAIRÉ provides secure payments through Toss Payments. We support various payment methods including credit cards and debit cards.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '2. 구독 가�? : '2. Subscription Pricing'}
            </h2>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? 'PREMIUM ?�간: ??,900' : 'PREMIUM Monthly: ??,900'}</li>
              <li>{isKorean ? 'PREMIUM ?�간: ??9,000' : 'PREMIUM Yearly: ??9,000'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '3. ?�동 갱신' : '3. Auto-Renewal'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? 'PREMIUM 구독?� ?�동?�로 갱신?�니?? 갱신 ?�정??7???�에 ?�림???�립?�다.'
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
                ? '구독?� ?�제?��? 취소?????�습?�다. 취소 ???��? 기간?� 계속 ?�용?????�으�? ?�음 갱신?��???FREE�?변경됩?�다.'
                : 'You can cancel your subscription at any time. After cancellation, you can continue using the service for the remaining period, and it will change to FREE from the next renewal date.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '5. ?�불 ?�책' : '5. Refund Policy'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '구독 취소 ???��? 결제??금액?� ?�불?��? ?�습?�다. ?? ?�음??경우???�불 ?�?�입?�다:'
                : 'Already paid amounts are not refunded after subscription cancellation. However, refunds are available in the following cases:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '결제 ?�류�??�한 중복 결제' : 'Duplicate payments due to payment errors'}</li>
              <li>{isKorean ? '?�비???�공 불�? (7???�상)' : 'Service unavailability (7+ days)'}</li>
              <li>{isKorean ? '?�용???�청 (구독 ??7???�내)' : 'User request (within 7 days of subscription)'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '6. ?�불 ?�청' : '6. Refund Request'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '?�불???�하?�면 ruckyrosie@gmail.com?�로 문의?�주?�요. ?�청 ??5-7 ?�업???�에 처리?�니??'
                : 'For refund requests, please contact ruckyrosie@gmail.com. Requests will be processed within 5-7 business days.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '7. 결제 ?�패' : '7. Payment Failure'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '결제 ?�패 ???�음 ???�동?�로 ?�시?�됩?�다. 3???�속 ?�패 ??구독???�시 중단?�니??'
                : 'If payment fails, it will be automatically retried the next day. After 3 consecutive failures, the subscription will be temporarily suspended.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '8. 가�?변�? : '8. Price Changes'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? 'PAIRÉ??가격을 변경할 ???�습?�다. 가�?변�???30???�에 공�??�며, 기존 구독?�는 변�???가격으�?1????갱신?�니??'
                : 'PAIRÉ may change prices. Price changes will be announced 30 days in advance, and existing subscribers will be renewed once more at the previous price.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '9. ?�금' : '9. Taxes'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '?�시??가격�? 부가???�함 가격입?�다. 지??�� ?�라 추�? ?�금??부과될 ???�습?�다.'
                : 'Displayed prices include VAT. Additional taxes may apply depending on your region.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '10. 분쟁 ?�결' : '10. Dispute Resolution'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '결제 관??분쟁?� ruckyrosie@gmail.com?�로 문의?�주?�요. ?�실?�게 ?�결?�겠?�니??'
                : 'For payment-related disputes, please contact ruckyrosie@gmail.com. We will resolve them sincerely.'}
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
