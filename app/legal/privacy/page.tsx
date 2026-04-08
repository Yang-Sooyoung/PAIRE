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
            {t('legal.privacy')}
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
              {isKorean ? '1. 媛쒖씤?뺣낫???섏쭛' : '1. Collection of Personal Information'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? 'PAIR횋???ㅼ쓬??媛쒖씤?뺣낫瑜??섏쭛?⑸땲??' : 'PAIR횋 collects the following personal information:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '?대찓??二쇱냼' : 'Email address'}</li>
              <li>{isKorean ? '?ъ슜?먮챸, ?됰꽕?? : 'Username, nickname'}</li>
              <li>{isKorean ? '鍮꾨?踰덊샇 (?뷀샇?????' : 'Password (encrypted)'}</li>
              <li>{isKorean ? '?뚯떇 ?ъ쭊 (異붿쿇 紐⑹쟻)' : 'Food photos (for recommendations)'}</li>
              <li>{isKorean ? '異붿쿇 湲곕줉 諛?痍⑦뼢 ?뺣낫' : 'Recommendation history and preferences'}</li>
              <li>{isKorean ? '寃곗젣 ?뺣낫 (寃곗젣 ?섎떒 ?좏겙)' : 'Payment information (payment method tokens)'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '2. 媛쒖씤?뺣낫???댁슜' : '2. Use of Personal Information'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '?섏쭛??媛쒖씤?뺣낫???ㅼ쓬??紐⑹쟻?쇰줈留??댁슜?⑸땲??' : 'Collected personal information is used only for the following purposes:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '?쒕퉬???쒓났 諛?媛쒖꽑' : 'Service provision and improvement'}</li>
              <li>{isKorean ? '?ъ슜???몄쬆 諛?怨꾩젙 愿由? : 'User authentication and account management'}</li>
              <li>{isKorean ? '異붿쿇 ?뚭퀬由ъ쬁 媛쒖꽑' : 'Recommendation algorithm improvement'}</li>
              <li>{isKorean ? '寃곗젣 諛?援щ룆 愿由? : 'Payment and subscription management'}</li>
              <li>{isKorean ? '怨좉컼 吏??諛?臾몄쓽 ?묐떟' : 'Customer support and inquiry responses'}</li>
              <li>{isKorean ? '踰뺤쟻 ?섎Т ?댄뻾' : 'Legal compliance'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '3. 媛쒖씤?뺣낫??蹂댄샇' : '3. Protection of Personal Information'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? 'PAIR횋??媛쒖씤?뺣낫 蹂댄샇瑜??꾪빐 ?ㅼ쓬??議곗튂瑜?痍⑦빀?덈떎:' : 'PAIR횋 takes the following measures to protect personal information:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '?뷀샇?????(鍮꾨?踰덊샇, 寃곗젣 ?뺣낫)' : 'Encrypted storage (passwords, payment info)'}</li>
              <li>{isKorean ? 'HTTPS ?듭떊' : 'HTTPS communication'}</li>
              <li>{isKorean ? '?묎렐 ?쒖뼱 諛?沅뚰븳 愿由? : 'Access control and permission management'}</li>
              <li>{isKorean ? '?뺢린?곸씤 蹂댁븞 媛먯떆' : 'Regular security monitoring'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '4. 媛쒖씤?뺣낫???????쒓났' : '4. Third-Party Disclosure'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean 
                ? 'PAIR횋???ъ슜?먯쓽 ?숈쓽 ?놁씠 媛쒖씤?뺣낫瑜????먯뿉寃??쒓났?섏? ?딆뒿?덈떎. ?? ?ㅼ쓬??寃쎌슦???덉쇅?낅땲??'
                : 'PAIR횋 does not provide personal information to third parties without user consent, except in the following cases:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '踰뺤쟻 ?붿껌 ?먮뒗 踰뺤썝 紐낅졊' : 'Legal requests or court orders'}</li>
              <li>{isKorean ? '寃곗젣 泥섎━ (寃곗젣 ??됱궗)' : 'Payment processing (payment service providers)'}</li>
              <li>{isKorean ? '?쒕퉬???쒓났 (?대씪?곕뱶 ?몄뒪????' : 'Service provision (cloud hosting, etc.)'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '5. 媛쒖씤?뺣낫??蹂댁쑀 諛???젣' : '5. Retention and Deletion'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '媛쒖씤?뺣낫???쒕퉬???댁슜 湲곌컙 ?숈븞 蹂댁쑀?⑸땲?? 怨꾩젙 ??젣 ??紐⑤뱺 媛쒖씤?뺣낫??利됱떆 ??젣?⑸땲??'
                : 'Personal information is retained during the service usage period. All personal information is immediately deleted upon account deletion.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '6. ?ъ슜?먯쓽 沅뚮━' : '6. User Rights'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '?ъ슜?먮뒗 ?ㅼ쓬??沅뚮━瑜?媛吏묐땲??' : 'Users have the following rights:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '媛쒖씤?뺣낫 ?대엺 ?붿껌' : 'Request to view personal information'}</li>
              <li>{isKorean ? '媛쒖씤?뺣낫 ?섏젙 ?붿껌' : 'Request to modify personal information'}</li>
              <li>{isKorean ? '媛쒖씤?뺣낫 ??젣 ?붿껌' : 'Request to delete personal information'}</li>
              <li>{isKorean ? '媛쒖씤?뺣낫 泥섎━ ?뺤? ?붿껌' : 'Request to stop processing personal information'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '7. 臾몄쓽' : '7. Contact'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '媛쒖씤?뺣낫 泥섎━??愿??臾몄쓽??ruckyrosie@gmail.com?쇰줈 ?곕씫二쇱꽭??'
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