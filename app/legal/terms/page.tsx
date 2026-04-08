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
      {/* ë°°ê²½ ?¨ê³¼ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      {/* ?¤ë” */}
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

      {/* ì½˜í…ì¸?*/}
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
              {isKorean ? '??ì¡?ì´ì¹™' : 'Article 1: General Provisions'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean 
                ? 'ë³??½ê??€ PAIRÃ‰(?´í•˜ "?œë¹„??)ë¥??´ìš©?˜ëŠ” ëª¨ë“  ?¬ìš©?ì—ê²??ìš©?©ë‹ˆ?? ?œë¹„???´ìš© ??ë³??½ê????™ì˜??ê²ƒìœ¼ë¡?ê°„ì£¼?©ë‹ˆ??'
                : 'These terms apply to all users of PAIRÃ‰ (the "Service"). By using the Service, you agree to these terms.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '??ì¡??œë¹„???¤ëª…' : 'Article 2: Service Description'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? 'PAIRÃ‰???Œì‹ ?¬ì§„??ì´¬ì˜?˜ë©´ AIê°€ ?Œì‹???¸ì‹?˜ê³ , ?¬ìš©?ì˜ ?í™©ê³?ì·¨í–¥??ë§ëŠ” ìµœì ???Œë£Œë¥?ì¶”ì²œ?´ì£¼???œë¹„?¤ì…?ˆë‹¤.'
                : 'PAIRÃ‰ is a service that uses AI to recognize food from photos and recommend the perfect drinks based on your situation and preferences.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '??ì¡??Œì› ê°€?? : 'Article 3: Membership'}
            </h2>
            <p className={cn(
              "text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean
                ? '?Œì›?€ ë³??½ê????™ì˜?˜ê³  ?„ìš”???•ë³´ë¥??œê³µ?˜ì—¬ ê°€?…í•  ???ˆìŠµ?ˆë‹¤. ?ˆìœ„ ?•ë³´ ?œê³µ ???œë¹„???´ìš©???œí•œ?????ˆìŠµ?ˆë‹¤.'
                : 'Members can sign up by agreeing to these terms and providing required information. Providing false information may result in service restrictions.'}
            </p>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '??ì¡??œë¹„???´ìš©' : 'Article 4: Service Usage'}
            </h2>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? 'FREE ?Œì›: ?˜ë£¨ 1??ì¶”ì²œ ê°€?? : 'FREE members: 1 recommendation per day'}</li>
              <li>{isKorean ? 'PREMIUM ?Œì›: ë¬´ì œ??ì¶”ì²œ ê°€?? : 'PREMIUM members: Unlimited recommendations'}</li>
              <li>{isKorean ? 'ë¹„ë¡œê·¸ì¸ ?¬ìš©?? ?˜ë£¨ 1??ì¶”ì²œ ê°€?? : 'Non-logged-in users: 1 recommendation per day'}</li>
            </ul>
          </section>

          <section>
            <h2 className={cn(
              "text-lg font-semibold text-foreground mb-3",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '??ì¡?ê¸ˆì? ?‰ìœ„' : 'Article 5: Prohibited Actions'}
            </h2>
            <p className={cn(
              "text-muted-foreground mb-2",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '?¤ìŒ???‰ìœ„??ê¸ˆì??©ë‹ˆ??' : 'The following actions are prohibited:'}
            </p>
            <ul className={cn(
              "list-disc list-inside space-y-2 text-muted-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              <li>{isKorean ? 'ë¶ˆë²•?ì¸ ì½˜í…ì¸??…ë¡œ?? : 'Uploading illegal content'}</li>
              <li>{isKorean ? '?œë¹„???œìŠ¤???´í‚¹ ?ëŠ” ë¶€???´ìš©' : 'Hacking or unauthorized use of the service'}</li>
              <li>{isKorean ? '?€?¸ì˜ ê°œì¸?•ë³´ ?„ìš©' : 'Stealing others\' personal information'}</li>
              <li>{isKorean ? '?œë¹„??ë°©í•´ ?‰ìœ„' : 'Interfering with the service'}</li>
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


