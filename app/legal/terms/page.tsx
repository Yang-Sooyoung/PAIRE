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
            {t('legal.terms')}
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
              {isKorean ? '??議?珥앹튃' : 'Article 1: General Provisions'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean 
                ? '蹂??쎄?? PAIR횋(?댄븯 "?쒕퉬??)瑜??댁슜?섎뒗 紐⑤뱺 ?ъ슜?먯뿉寃??곸슜?⑸땲?? ?쒕퉬???댁슜 ??蹂??쎄????숈쓽??寃껋쑝濡?媛꾩＜?⑸땲??'
                : 'These terms apply to all users of PAIR횋 (the "Service"). By using the Service, you agree to these terms.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '??議??쒕퉬???ㅻ챸' : 'Article 2: Service Description'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? 'PAIR횋???뚯떇 ?ъ쭊??珥ъ쁺?섎㈃ AI媛 ?뚯떇???몄떇?섍퀬, ?ъ슜?먯쓽 ?곹솴怨?痍⑦뼢??留욌뒗 理쒖쟻???뚮즺瑜?異붿쿇?댁＜???쒕퉬?ㅼ엯?덈떎.'
                : 'PAIR횋 is a service that uses AI to recognize food from photos and recommend the perfect drinks based on your situation and preferences.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '??議??뚯썝 媛?? : 'Article 3: Membership'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '?뚯썝? 蹂??쎄????숈쓽?섍퀬 ?꾩슂???뺣낫瑜??쒓났?섏뿬 媛?낇븷 ???덉뒿?덈떎. ?덉쐞 ?뺣낫 ?쒓났 ???쒕퉬???댁슜???쒗븳?????덉뒿?덈떎.'
                : 'Members can sign up by agreeing to these terms and providing required information. Providing false information may result in service restrictions.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '??議??쒕퉬???댁슜' : 'Article 4: Service Usage'}
            </h2>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? 'FREE ?뚯썝: ?섎（ 1??異붿쿇 媛?? : 'FREE members: 1 recommendation per day'}</li>
              <li>{isKorean ? 'PREMIUM ?뚯썝: 臾댁젣??異붿쿇 媛?? : 'PREMIUM members: Unlimited recommendations'}</li>
              <li>{isKorean ? '鍮꾨줈洹몄씤 ?ъ슜?? ?섎（ 1??異붿쿇 媛?? : 'Non-logged-in users: 1 recommendation per day'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '??議?湲덉? ?됱쐞' : 'Article 5: Prohibited Actions'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '?ㅼ쓬???됱쐞??湲덉??⑸땲??' : 'The following actions are prohibited:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? '遺덈쾿?곸씤 肄섑뀗痢??낅줈?? : 'Uploading illegal content'}</li>
              <li>{isKorean ? '?쒕퉬???쒖뒪???댄궧 ?먮뒗 遺???댁슜' : 'Hacking or unauthorized use of the service'}</li>
              <li>{isKorean ? '??몄쓽 媛쒖씤?뺣낫 ?꾩슜' : 'Stealing others\' personal information'}</li>
              <li>{isKorean ? '?쒕퉬??諛⑺빐 ?됱쐞' : 'Interfering with the service'}</li>
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