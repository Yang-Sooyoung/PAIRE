'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { Button } from '@/components/ui/button';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { motion } from 'framer-motion';
import { ArrowLeft, Coffee, Heart, MessageSquare, Briefcase, Send, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';
import { detectCountryByIP, getRegionConfig } from '@/lib/region-detector';

export default function SupportPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { language } = useI18n();
  const isKorean = language === 'ko';
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isStripe, setIsStripe] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{ type: 'info' | 'success' | 'warning' | 'error', title: string, description: string }>({
    type: 'info',
    title: '',
    description: ''
  });

  useEffect(() => {
    detectCountryByIP().then(country => {
      setIsStripe(getRegionConfig(country).paymentProvider === 'stripe');
    });
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setDialogConfig({
        type: 'warning',
        title: isKorean ? '?낅젰 ?꾩슂' : 'Input Required',
        description: isKorean ? '硫붿떆吏瑜??낅젰?댁＜?몄슂!' : 'Please enter a message!'
      });
      setShowDialog(true);
      return;
    }

    setSending(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

      const response = await fetch(`${API_URL}/support/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          email: email || user?.email,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      alert(isKorean ? '硫붿떆吏媛 ?꾨떖?섏뿀?댁슂! 媛먯궗?⑸땲???뮎' : 'Message sent! Thank you ?뮎');
      setMessage('');
      setEmail('');
    } catch (error) {
      console.error('Send message error:', error);
      alert(isKorean ? '?꾩넚 ?ㅽ뙣... ?ㅼ떆 ?쒕룄?댁＜?몄슂!' : 'Failed to send... Please try again!');
    } finally {
      setSending(false);
    }
  };

  // KRW 湲덉븸 ??USD ?쒖떆 (1400 KRW = 1 USD)
  const formatSupportAmount = (krwAmount: number): string => {
    if (isStripe) {
      return `$${(krwAmount / 1400).toFixed(2)}`;
    }
    return `??{krwAmount.toLocaleString()}`;
  };

  const handleSupport = async (krwAmount: number) => {
    if (!user) {
      setDialogConfig({
        type: 'warning',
        title: isKorean ? '濡쒓렇???꾩슂' : 'Login Required',
        description: isKorean ? '?꾩썝?섎젮硫?濡쒓렇?몄씠 ?꾩슂?⑸땲??' : 'Please login to support.'
      });
      setShowDialog(true);
      return;
    }

    try {
      setLoading(true);

      if (isStripe) {
        const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');
        const currentToken = useUserStore.getState().token;
        const response = await fetch(`${BASE_URL}/stripe/create-support-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentToken}` },
          body: JSON.stringify({
            krwAmount,
            successUrl: `${window.location.origin}/support/success?amount=${krwAmount}`,
            cancelUrl: `${window.location.origin}/support`,
          }),
        });
        if (!response.ok) throw new Error('Stripe session creation failed');
        const { url } = await response.json();
        if (url) window.location.href = url;
        return;
      }

      // ?쒓뎅: ?좎뒪?섏씠癒쇱툩
      const { loadTossPayments } = await import('@tosspayments/sdk');
      const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_TEST_CLIENT_KEY!);
      const orderId = `support_${user.id}_${Date.now()}`;
      const orderName = `PAIR횋 媛쒕컻???꾩썝 ${krwAmount.toLocaleString()}??;

      await tossPayments.requestPayment('移대뱶', {
        amount: krwAmount,
        orderId,
        orderName,
        customerName: user.nickname || user.username,
        customerEmail: user.email,
        successUrl: `${window.location.origin}/support/success?amount=${krwAmount}`,
        failUrl: `${window.location.origin}/support/fail`,
      });
    } catch (error) {
      console.error('Support payment error:', error);
      setDialogConfig({
        type: 'error',
        title: isKorean ? '寃곗젣 ?ㅻ쪟' : 'Payment Error',
        description: isKorean ? '寃곗젣 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.' : 'An error occurred during payment.'
      });
      setShowDialog(true);
    } finally {
      setLoading(false);
    }
  };

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
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={cn(
            "text-lg font-medium text-foreground tracking-wide",
            isKorean && "font-[var(--font-noto-kr)] tracking-normal"
          )}>
            {isKorean ? '媛쒕컻??吏?먰븯湲? : 'Support Developer'}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12 relative z-10 space-y-6">
        {/* ?몄궗留?*/}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-4xl mb-4">?몝</div>
          <h2 className={cn(
            "text-2xl font-light text-foreground mb-2",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean ? '?덈뀞?섏꽭??' : 'Hello!'}
          </h2>
          <p className={cn(
            "text-muted-foreground",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean
              ? 'PAIR횋瑜?留뚮뱺 媛쒕컻?먯엯?덈떎. ?щ윭遺꾩쓽 ?묒썝?????섏씠 ?⑸땲???뮎'
              : "I'm the developer of PAIR횋. Your support means a lot ?뮎"
            }
          </p>
        </motion.div>

        {/* 而ㅽ뵾 ?꾩썝 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Coffee className="w-6 h-6 text-gold" />
            <h3 className={cn(
              "text-lg font-light text-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '媛쒕컻?먯뿉寃??????ъ＜湲? : 'Buy me a drink'}
            </h3>
          </div>
          <p className={cn(
            "text-muted-foreground text-sm mb-6",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean
              ? '而ㅽ뵾 ???붿쓽 ?ъ쑀濡?媛쒕컻?먮? ?묒썝?댁＜?몄슂! ??
              : 'Support the developer with a cup of coffee! ??
            }
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={() => handleSupport(3000)}
              className={cn(
                "bg-secondary hover:bg-gold/20 text-foreground border border-border",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">??/div>
                <div className="text-xs">{formatSupportAmount(3000)}</div>
              </div>
            </Button>
            <Button
              onClick={() => handleSupport(5000)}
              className={cn(
                "bg-secondary hover:bg-gold/20 text-foreground border border-border",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">?뜼</div>
                <div className="text-xs">{formatSupportAmount(5000)}</div>
              </div>
            </Button>
            <Button
              onClick={() => handleSupport(10000)}
              className={cn(
                "bg-secondary hover:bg-gold/20 text-foreground border border-border",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">?띃</div>
                <div className="text-xs">{formatSupportAmount(10000)}</div>
              </div>
            </Button>
          </div>
        </motion.section>

        {/* 諛⑸챸濡?*/}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-gold" />
            <h3 className={cn(
              "text-lg font-light text-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '諛⑸챸濡??④린湲? : 'Leave a message'}
            </h3>
          </div>
          <p className={cn(
            "text-muted-foreground text-sm mb-4",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean
              ? '?묒썝???쒕쭏?? 媛쒖꽑 ?꾩씠?붿뼱, 萸먮뱺 醫뗭븘?? ?뱷'
              : 'Words of encouragement, ideas, anything! ?뱷'
            }
          </p>
          <div className="space-y-3">
            {!user && (
              <input
                type="email"
                placeholder={isKorean ? '?대찓??(?좏깮)' : 'Email (optional)'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
              />
            )}
            <textarea
              placeholder={isKorean ? '硫붿떆吏瑜??낅젰?섏꽭??..' : 'Enter your message...'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className={cn(
                "w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            />
            <Button
              onClick={handleSendMessage}
              disabled={sending}
              className={cn(
                "w-full bg-gold hover:bg-gold-light text-background",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              {sending ? (
                isKorean ? '?꾩넚 以?..' : 'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {isKorean ? '硫붿떆吏 蹂대궡湲? : 'Send Message'}
                </>
              )}
            </Button>
          </div>
        </motion.section>

        {/* ?묒뾽 臾몄쓽 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-6 h-6 text-gold" />
            <h3 className={cn(
              "text-lg font-light text-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '?묒뾽 & 鍮꾩쫰?덉뒪 臾몄쓽' : 'Collaboration & Business'}
            </h3>
          </div>
          <p className={cn(
            "text-muted-foreground text-sm mb-4",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean
              ? '?쒗쑕, 愿묎퀬, ?묒뾽 ?쒖븞? ?대찓?쇰줈 ?곕씫二쇱꽭?? ?뮳'
              : 'For partnerships, ads, or collaborations, email me! ?뮳'
            }
          </p>
          <Button
            onClick={() => window.location.href = 'mailto:ruckyrosie@gmail.com?subject=PAIR횋 ?묒뾽 臾몄쓽'}
            variant="outline"
            className={cn(
              "w-full border-gold/30 text-gold hover:bg-gold/10",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            ruckyrosie@gmail.com
          </Button>
        </motion.section>

        {/* ?뚯뀥 留곹겕 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-gold" />
            <h3 className={cn(
              "text-lg font-light text-foreground",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {isKorean ? '媛쒕컻??SNS' : 'Follow Me'}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => window.open('https://github.com/Yang-Sooyoung', '_blank')}
              variant="outline"
              className={cn(
                "border-border hover:bg-gold/10",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              <span className="mr-2">?뮲</span> GitHub
            </Button>
            <Button
              onClick={() => window.open('https://www.instagram.com/labs_de_luna?igsh=MXgwbmxidm84d2w5dg%3D%3D&utm_source=qr', '_blank')}
              variant="outline"
              className={cn(
                "border-border hover:bg-gold/10",
                isKorean && "font-[var(--font-noto-kr)]"
              )}
            >
              <span className="mr-2">?벝</span> Instagram
            </Button>
          </div>
        </motion.section>

        {/* 媛먯궗 硫붿떆吏 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8"
        >
          <Heart className="w-8 h-8 text-gold mx-auto mb-3" />
          <p className={cn(
            "text-muted-foreground text-sm",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {isKorean
              ? 'PAIR횋瑜??ъ슜?댁＜?붿꽌 媛먯궗?⑸땲???뮎'
              : 'Thank you for using PAIR횋 ?뮎'
            }
          </p>
        </motion.div>
      </div>

      {/* Custom Dialog */}
      <CustomDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        type={dialogConfig.type}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmText="?뺤씤"
      />
    </div>
  );
}