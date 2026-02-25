'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/app/api/auth';
import { useUserStore } from '@/app/store/userStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken, setRefreshToken } = useUserStore();
  const { language, t } = useI18n();
  const isKorean = language === 'ko';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login({ email, password });

      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);

      setUser(res.user);
      setToken(res.accessToken);
      setRefreshToken(res.refreshToken);
      
      console.log('✅ Login successful, token saved:', res.accessToken.substring(0, 20) + '...');

      router.push('/user-info');
    } catch (err: any) {
      setError(err.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'kakao') => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    window.location.href = `${API_URL}/auth/${provider}`;
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
            src="/images/pairy_main.png"
            alt="PAIRÉ Fairy"
            className="w-48 h-auto opacity-80 drop-shadow-lg"
          />
        </motion.div>

        {/* 폼 */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-card backdrop-blur-sm border border-border rounded-xl p-8 space-y-6"
        >
          <h2 className={cn(
            "text-2xl font-light text-foreground text-center mb-8",
            isKorean && "font-[var(--font-noto-kr)]"
          )}>
            {t('auth.loginTitle')}
          </h2>

          {/* 이메일 */}
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

          {/* 비밀번호 */}
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

          {/* 에러 메시지 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/20 border border-destructive/30 text-destructive text-sm p-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          {/* 로그인 버튼 */}
          <Button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full bg-gold hover:bg-gold-light text-background font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {loading ? t('auth.loggingIn') : t('auth.login')}
          </Button>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className={cn(
                "px-3 bg-card text-muted-foreground uppercase tracking-widest",
                isKorean && "font-[var(--font-noto-kr)] normal-case tracking-normal"
              )}>
                {isKorean ? '또는' : 'OR'}
              </span>
            </div>
          </div>

          {/* 소셜 로그인 버튼 */}
          <div className="space-y-3">
            <Button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-all duration-300 border border-gray-300 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className={cn(isKorean && "font-[var(--font-noto-kr)]")}>
                {isKorean ? 'Google로 계속하기' : 'Continue with Google'}
              </span>
            </Button>

            <Button
              type="button"
              onClick={() => handleOAuthLogin('kakao')}
              className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-medium py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#000000" d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7-.2.8-.7 2.8-.8 3.2-.1.5.2.5.4.4.3-.1 3.7-2.5 4.3-2.9.5.1 1 .1 1.4.1 5.5 0 10-3.6 10-8S17.5 3 12 3z"/>
              </svg>
              <span className={cn(isKorean && "font-[var(--font-noto-kr)]")}>
                {isKorean ? '카카오로 계속하기' : 'Continue with Kakao'}
              </span>
            </Button>
          </div>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
          </div>

          {/* 회원가입 버튼 */}
          <Button
            type="button"
            onClick={() => router.push('/signup')}
            className={cn(
              "w-full bg-secondary border border-border hover:bg-secondary/80 hover:border-gold/40 text-foreground font-medium py-3 rounded-lg transition-all duration-300",
              isKorean && "font-[var(--font-noto-kr)]"
            )}
          >
            {t('auth.signup')}
          </Button>
        </motion.form>

        {/* 하단 텍스트 */}
        <p className={cn(
          "text-center text-muted-foreground text-xs mt-8 tracking-wide",
          isKorean && "font-[var(--font-noto-kr)] tracking-normal"
        )}>
          {t('auth.noAccount')}{' '}
          <button
            onClick={() => router.push('/signup')}
            className="text-gold hover:text-gold-light transition font-medium"
          >
            {t('auth.signup')}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
