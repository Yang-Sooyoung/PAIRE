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
      {/* 諛곌꼍 ?④낵 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      {/* ?ㅻ뜑 */}
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
            {t('legal.payment')}
          </h1>
        </div>
      </div>

      {/* 肄섑뀗痢?*/}
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
              {isKorean ? '1. 寃곗젣 諛⑸쾿' : '1. Payment Methods'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? 'PAIR횋??Toss Payments瑜??듯빐 ?덉쟾??寃곗젣瑜??쒓났?⑸땲?? ?좎슜移대뱶, 泥댄겕移대뱶 ???ㅼ뼇??寃곗젣 ?섎떒??吏?먰빀?덈떎.'
                : 'PAIR횋 provides secure payments through Toss Payments. We support various payment methods including credit cards and debit cards.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '2. 援щ룆 媛寃? : '2. Subscription Pricing'}
            </h2>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? 'PREMIUM ?붽컙: ??,900' : 'PREMIUM Monthly: ??,900'}</li>
              <li>{isKorean ? 'PREMIUM ?곌컙: ??9,000' : 'PREMIUM Yearly: ??9,000'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '3. ?먮룞 媛깆떊' : '3. Auto-Renewal'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? 'PREMIUM 援щ룆? ?먮룞?쇰줈 媛깆떊?⑸땲?? 媛깆떊 ?덉젙??7???꾩뿉 ?뚮┝???쒕┰?덈떎.'
                : 'PREMIUM subscriptions are automatically renewed. You will be notified 7 days before the renewal date.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '4. 援щ룆 痍⑥냼' : '4. Subscription Cancellation'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '援щ룆? ?몄젣?좎? 痍⑥냼?????덉뒿?덈떎. 痍⑥냼 ???⑥? 湲곌컙? 怨꾩냽 ?ъ슜?????덉쑝硫? ?ㅼ쓬 媛깆떊?쇰???FREE濡?蹂寃쎈맗?덈떎.'
                : 'You can cancel your subscription at any time. After cancellation, you can continue using the service for the remaining period, and it will change to FREE from the next renewal date.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '5. ?섎텋 ?뺤콉' : '5. Refund Policy'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '援щ룆 痍⑥냼 ???대? 寃곗젣??湲덉븸? ?섎텋?섏? ?딆뒿?덈떎. ?? ?ㅼ쓬??寃쎌슦???섎텋 ??곸엯?덈떎:'
                : 'Already paid amounts are not refunded after subscription cancellation. However, refunds are available in the following cases:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '寃곗젣 ?ㅻ쪟濡??명븳 以묐났 寃곗젣' : 'Duplicate payments due to payment errors'}</li>
              <li>{isKorean ? '?쒕퉬???쒓났 遺덇? (7???댁긽)' : 'Service unavailability (7+ days)'}</li>
              <li>{isKorean ? '?ъ슜???붿껌 (援щ룆 ??7???대궡)' : 'User request (within 7 days of subscription)'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '6. ?섎텋 ?좎껌' : '6. Refund Request'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '?섎텋???먰븯?쒕㈃ ruckyrosie@gmail.com?쇰줈 臾몄쓽?댁＜?몄슂. ?좎껌 ??5-7 ?곸뾽???댁뿉 泥섎━?⑸땲??'
                : 'For refund requests, please contact ruckyrosie@gmail.com. Requests will be processed within 5-7 business days.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '7. 寃곗젣 ?ㅽ뙣' : '7. Payment Failure'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '寃곗젣 ?ㅽ뙣 ???ㅼ쓬 ???먮룞?쇰줈 ?ъ떆?꾨맗?덈떎. 3???곗냽 ?ㅽ뙣 ??援щ룆???쇱떆 以묐떒?⑸땲??'
                : 'If payment fails, it will be automatically retried the next day. After 3 consecutive failures, the subscription will be temporarily suspended.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '8. 媛寃?蹂寃? : '8. Price Changes'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? 'PAIR횋??媛寃⑹쓣 蹂寃쏀븷 ???덉뒿?덈떎. 媛寃?蹂寃???30???꾩뿉 怨듭??섎ŉ, 湲곗〈 援щ룆?먮뒗 蹂寃???媛寃⑹쑝濡?1????媛깆떊?⑸땲??'
                : 'PAIR횋 may change prices. Price changes will be announced 30 days in advance, and existing subscribers will be renewed once more at the previous price.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '9. ?멸툑' : '9. Taxes'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '?쒖떆??媛寃⑹? 遺媛???ы븿 媛寃⑹엯?덈떎. 吏??뿉 ?곕씪 異붽? ?멸툑??遺怨쇰맆 ???덉뒿?덈떎.'
                : 'Displayed prices include VAT. Additional taxes may apply depending on your region.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '10. 遺꾩웳 ?닿껐' : '10. Dispute Resolution'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '寃곗젣 愿??遺꾩웳? ruckyrosie@gmail.com?쇰줈 臾몄쓽?댁＜?몄슂. ?깆떎?섍쾶 ?닿껐?섍쿋?듬땲??'
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