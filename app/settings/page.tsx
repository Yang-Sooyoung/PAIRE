'use client';

import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';
import { ChevronRight, LogOut, Trash2, Mail, FileText, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import { LanguageToggle } from '@/components/paire/language-toggle';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useUserStore();
  const { language, t } = useI18n();
  const isKorean = language === 'ko';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/user/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Í≥ÑÏ†ï ??†ú ?§Ìå®');
      }

      logout();
      router.push('/');
    } catch (error) {
      alert('Í≥ÑÏ†ï ??†ú Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-foreground text-2xl font-light mb-4">PAIR√â</div>
          <div className={cn(
            "text-muted-foreground text-sm",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {t('common.loading')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Î∞∞Í≤Ω ?®Í≥º */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      {/* ?§Îçî */}
      <div className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4 relative z-20">
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
            {t('settings.title')}
          </h1>
        </div>
      </div>

      {/* ÏΩòÌÖêÏ∏?*/}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 relative z-10">
        {/* ?∏Ïñ¥ ?§Ï†ï */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-card backdrop-blur-sm border border-border rounded-xl p-6"
        >
          <h2 className={cn(
            "text-xs text-gold-dim uppercase tracking-widest font-light mb-4",
            isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
          )}>
            {isKorean ? '?∏Ïñ¥ ?§Ï†ï' : 'Language'}
          </h2>
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-muted-foreground text-sm",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '?úÏãú ?∏Ïñ¥' : 'Display Language'}
            </span>
            <LanguageToggle />
          </div>
          <p className={cn(
            "text-xs text-muted-foreground/70 mt-2",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean
              ? 'Ï∂îÏ≤ú Í≤∞Í≥º???†ÌÉù???∏Ïñ¥Î°??Ä?•Îê©?àÎã§. ?∏Ïñ¥Î•?Î≥ÄÍ≤ΩÌïòÎ©??¥ÌõÑ Ï∂îÏ≤úÎ∂Ä???ÅÏö©?©Îãà??'
              : 'Recommendations are saved in the selected language. Changes apply to future recommendations.'}
          </p>
        </motion.section>

        {/* Í≥ÑÏ†ï ?ïÎ≥¥ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-card backdrop-blur-sm border border-border rounded-xl p-6 space-y-4"
        >
          <h2 className={cn(
            "text-xs text-gold-dim uppercase tracking-widest font-light",
            isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
          )}>
            {t('settings.accountInfo')}
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-secondary rounded-lg border border-border">
              <span className={cn(
                "text-muted-foreground text-sm",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {t('common.email')}
              </span>
              <span className="text-foreground font-light">{user.email}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary rounded-lg border border-border">
              <span className={cn(
                "text-muted-foreground text-sm",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {t('common.nickname')}
              </span>
              <span className="text-foreground font-light">{user.nickname || user.username}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary rounded-lg border border-border">
              <span className={cn(
                "text-muted-foreground text-sm",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {t('userInfo.membership')}
              </span>
              <span className={user.membership === 'PREMIUM' ? 'text-gold font-semibold' : 'text-muted-foreground'}>
                {user.membership === 'PREMIUM' ? 'PREMIUM' : 'FREE'}
              </span>
            </div>
          </div>
        </motion.section>

        {/* ?ΩÍ? & ?ïÏ±Ö */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-card backdrop-blur-sm border border-border rounded-xl overflow-hidden"
        >
          <h2 className={cn(
            "text-xs text-gold-dim uppercase tracking-widest font-light px-6 pt-6 pb-4",
            isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
          )}>
            {isKorean ? '???úÎèô' : 'My Activity'}
          </h2>
          <div className="divide-y divide-border">
            <button
              onClick={() => router.push('/stickers')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gold/5 transition text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">??/span>
                <span className={cn(
                  "text-foreground/80 group-hover:text-foreground transition",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {isKorean ? '?§Ìã∞Ïª?Ïª¨Î†â?? : 'Sticker Collection'}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-gold/60 transition" />
            </button>
          </div>
        </motion.section>

        {/* ?ΩÍ? & ?ïÏ±Ö */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-card backdrop-blur-sm border border-border rounded-xl overflow-hidden"
        >
          <h2 className={cn(
            "text-xs text-gold-dim uppercase tracking-widest font-light px-6 pt-6 pb-4",
            isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
          )}>
            {t('settings.termsAndPolicies')}
          </h2>
          <div className="divide-y divide-border">
            <button
              onClick={() => router.push('/legal/terms')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gold/5 transition text-left group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gold/60 group-hover:text-gold transition" />
                <span className={cn(
                  "text-foreground/80 group-hover:text-foreground transition",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {t('settings.terms')}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-gold/60 transition" />
            </button>

            <button
              onClick={() => router.push('/legal/privacy')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gold/5 transition text-left group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gold/60 group-hover:text-gold transition" />
                <span className={cn(
                  "text-foreground/80 group-hover:text-foreground transition",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {t('settings.privacy')}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-gold/60 transition" />
            </button>

            <button
              onClick={() => router.push('/legal/payment')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gold/5 transition text-left group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gold/60 group-hover:text-gold transition" />
                <span className={cn(
                  "text-foreground/80 group-hover:text-foreground transition",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {t('settings.payment')}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-gold/60 transition" />
            </button>
          </div>
        </motion.section>

        {/* Í≥†Í∞ù ÏßÄ??*/}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-card backdrop-blur-sm border border-border rounded-xl overflow-hidden"
        >
          <h2 className={cn(
            "text-xs text-gold-dim uppercase tracking-widest font-light px-6 pt-6 pb-4",
            isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
          )}>
            {t('settings.customerSupport')}
          </h2>
          <button
            onClick={() => window.location.href = 'mailto:ruckyrosie@gmail.com?subject=PAIR√â Î¨∏Ïùò'}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gold/5 transition text-left group"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gold/60 group-hover:text-gold transition" />
              <span className={cn(
                "text-foreground/80 group-hover:text-foreground transition",
                isKorean && "font-[var(--font-noto-kr)]"
              )}>
                {t('settings.contact')}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-gold/60 transition" />
          </button>
        </motion.section>

        {/* Í∞úÎ∞ú??ÏßÄ??*/}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="bg-gradient-to-r from-gold/10 to-gold/5 backdrop-blur-sm border border-gold/20 rounded-xl overflow-hidden"
        >
          <h2 className={cn(
            "text-xs text-gold uppercase tracking-widest font-light px-6 pt-6 pb-4",
            isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
          )}>
            {isKorean ? 'Í∞úÎ∞ú??ÏßÄ???íõ' : 'Support Developer ?íõ'}
          </h2>
          <button
            onClick={() => router.push('/support')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gold/10 transition text-left group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">??/span>
              <div>
                <div className={cn(
                  "text-foreground/90 group-hover:text-foreground transition",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {isKorean ? 'Í∞úÎ∞ú?êÏóêÍ≤??????¨Ï£ºÍ∏? : 'Buy me a drink'}
                </div>
                <div className={cn(
                  "text-xs text-muted-foreground",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {isKorean ? '?ëÏõê Î©îÏãúÏßÄ, ?ëÏóÖ Î¨∏Ïùò' : 'Messages, collaborations'}
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gold/60 group-hover:text-gold transition" />
          </button>
        </motion.section>

        {/* ?ÑÌóò ?ÅÏó≠ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-card backdrop-blur-sm border border-destructive/20 rounded-xl overflow-hidden"
        >
          <h2 className={cn(
            "text-xs text-destructive/70 uppercase tracking-widest font-light px-6 pt-6 pb-4",
            isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
          )}>
            {t('settings.dangerZone')}
          </h2>
          <div className="divide-y divide-destructive/10">
            <button
              onClick={handleLogout}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-destructive/5 transition text-left group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-destructive/60 group-hover:text-destructive transition" />
                <span className={cn(
                  "text-destructive/80 group-hover:text-destructive transition",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}>
                  {t('auth.logout')}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-destructive/40 group-hover:text-destructive/60 transition" />
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-destructive/5 transition text-left group">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-destructive/60 group-hover:text-destructive transition" />
                    <span className={cn(
                      "text-destructive/80 group-hover:text-destructive transition",
                      isKorean && "font-[var(--font-noto-kr)]"
                    )}>
                      {t('settings.deleteAccount')}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-destructive/40 group-hover:text-destructive/60 transition" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border border-destructive/20">
                <AlertDialogHeader>
                  <AlertDialogTitle className={cn(
                    "text-foreground text-xl",
                    isKorean && "font-[var(--font-noto-kr)]"
                  )}>
                    {t('settings.deleteConfirmTitle')}
                  </AlertDialogTitle>
                  <AlertDialogDescription className={cn(
                    "text-muted-foreground text-sm",
                    isKorean && "font-[var(--font-noto-kr)]"
                  )}>
                    {t('settings.deleteConfirmDesc')}
                    <ul className="mt-4 space-y-2 text-muted-foreground text-xs">
                      <li>??{t('settings.deleteItems.account')}</li>
                      <li>??{t('settings.deleteItems.history')}</li>
                      <li>??{t('settings.deleteItems.subscription')}</li>
                      <li>??{t('settings.deleteItems.data')}</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-3 pt-4">
                  <AlertDialogCancel className={cn(
                    "bg-secondary hover:bg-secondary/80 text-foreground border-border",
                    isKorean && "font-[var(--font-noto-kr)]"
                  )}>
                    {t('settings.cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className={cn(
                      "bg-destructive/50 hover:bg-destructive text-destructive-foreground border border-destructive/30",
                      isKorean && "font-[var(--font-noto-kr)]"
                    )}
                  >
                    {t('settings.delete')}
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.section>

        {/* Î≤ÑÏ†Ñ ?ïÎ≥¥ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-muted-foreground text-xs py-8 space-y-1"
        >
          <p className="font-light">{t('settings.version')}</p>
          <p className="text-muted-foreground/50">{t('settings.copyright')}</p>
        </motion.div>
      </div>
    </div>
  );
}


