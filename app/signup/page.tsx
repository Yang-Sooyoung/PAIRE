'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signup, login } from '@/app/api/auth';
import { useUserStore } from '@/app/store/userStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

export default function SignUpPage() {
  const router = useRouter();
  const { setUser, setToken, setRefreshToken } = useUserStore();
  const { language, t } = useI18n();
  const isKorean = language === 'ko';

  const [step, setStep] = useState(1); // 1: 기본정보, 2: 추가정보
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOAuthLogin = (provider: 'google' | 'kakao') => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setStep(2);
      setError('');
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await signup({ email, password, username, nickname });
      setSuccess(t('auth.signupSuccess'));

      setTimeout(async () => {
        try {
          const res = await login({ email, password });

          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);

          setUser(res.user);
          setToken(res.accessToken);
          setRefreshToken(res.refreshToken);

          router.push('/user-info');
        } catch (loginErr: any) {
          setError(loginErr.message || t('auth.loginError'));
          setTimeout(() => router.push('/login'), 2000);
        }
      }, 1000);
    } catch (e: any) {
      setError(e.message || t('auth.signupError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        {/* 헤더 */}
        <div className="text-center mb-12">
          <motion.button
            onClick={() => router.push('/')}
            className="inline-block hover:opacity-80 transition mb-6"
            title={isKorean ? '홈으로 이동' : 'Go to Home'}
            whileHover={{ scale: 1.05 }}
          >
            <h1 className="text-4xl font-light text-foreground tracking-widest">PAIRÉ</h1>
          </motion.button>
          <p className="text-gold-dim text-sm tracking-wide font-light">Your Table's Fairy Sommelier</p>
        </div>

        {/* 요정 이미지 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 flex justify-center"
        >
          <img
            src="/images/paire-fairy.png"
            alt="PAIRÉ Fairy"
            className="w-48 h-auto opacity-80 drop-shadow-lg"
          />
        </motion.div>

        {/* 폼 */}
        <motion.form
          onSubmit={step === 1 ? handleStep1Submit : onSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-card backdrop-blur-sm border border-border rounded-xl p-8 space-y-6"
        >
          <div className="flex items-center justify-between mb-8">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-gold hover:text-gold-light transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className={cn(
              "text-2xl font-light text-foreground flex-1 text-center",
              isKorean && "font-[var(--font-noto-kr)]"
            )}>
              {step === 1 ? t('auth.signupTitle') : t('auth.profileSetup')}
            </h2>
            {step === 2 && <div className="w-5" />}
          </div>

          {/* Step 1: 기본 정보 */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className={cn(
                  "block text-xs text-gold-dim uppercase tracking-widest font-light",
                  isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
                )}>
                  {t('common.email')}
                </label>
                <Input
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary border border-border text-foreground placeholder-muted-foreground rounded-lg focus:border-gold/50 focus:bg-secondary/70 transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className={cn(
                  "block text-xs text-gold-dim uppercase tracking-widest font-light",
                  isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
                )}>
                  {t('common.password')}
                </label>
                <Input
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary border border-border text-foreground placeholder-muted-foreground rounded-lg focus:border-gold/50 focus:bg-secondary/70 transition"
                  required
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/20 border border-destructive/30 text-destructive text-sm p-3 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                className={cn(
                  "w-full bg-gold hover:bg-gold-light text-background font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold/20",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
              >
                {t('auth.next')}
              </Button>
            </motion.div>
          )}

          {/* Step 2: 추가 정보 */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className={cn(
                  "block text-xs text-gold-dim uppercase tracking-widest font-light",
                  isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
                )}>
                  {t('common.name')}
                </label>
                <Input
                  type="text"
                  placeholder={t('auth.namePlaceholder')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-secondary border border-border text-foreground placeholder-muted-foreground rounded-lg focus:border-gold/50 focus:bg-secondary/70 transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className={cn(
                  "block text-xs text-gold-dim uppercase tracking-widest font-light",
                  isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
                )}>
                  {t('auth.nicknameOptional')}
                </label>
                <Input
                  type="text"
                  placeholder={t('auth.nicknamePlaceholder')}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="bg-secondary border border-border text-foreground placeholder-muted-foreground rounded-lg focus:border-gold/50 focus:bg-secondary/70 transition"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/20 border border-destructive/30 text-destructive text-sm p-3 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-900/20 border border-green-600/30 text-green-300 text-sm p-3 rounded-lg"
                >
                  {success}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full bg-gold hover:bg-gold-light text-background font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50",
                  isKorean && "font-[var(--font-noto-kr)]"
                )}
              >
                {loading ? t('auth.signingUp') : t('auth.complete')}
              </Button>
            </motion.div>
          )}
        </motion.form>

        {/* 하단 텍스트 */}
        <p className={cn(
          "text-center text-muted-foreground text-xs mt-8 tracking-wide",
          isKorean && "font-[var(--font-noto-kr)] tracking-normal"
        )}>
          {t('auth.hasAccount')}{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-gold hover:text-gold-light transition font-medium"
          >
            {t('auth.login')}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
