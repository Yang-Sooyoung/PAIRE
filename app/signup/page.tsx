'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signup, login } from '@/app/api/auth';
import { useUserStore } from '@/app/store/userStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { setUser, setToken, setRefreshToken } = useUserStore();

  const [step, setStep] = useState(1); // 1: 기본정보, 2: 추가정보
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
      setSuccess('회원가입이 완료되었습니다. 로그인 중...');

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
          setError(loginErr.message || '자동 로그인 실패. 로그인 페이지로 이동합니다.');
          setTimeout(() => router.push('/login'), 2000);
        }
      }, 1000);
    } catch (e: any) {
      setError(e.message || '회원가입 실패. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-amber-500/3 rounded-full blur-3xl" />
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
            title="홈으로 이동"
            whileHover={{ scale: 1.05 }}
          >
            <h1 className="text-4xl font-light text-white tracking-widest">PAIRÉ</h1>
          </motion.button>
          <p className="text-amber-200/60 text-sm tracking-wide font-light">Your Table's Fairy Sommelier</p>
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
          className="bg-slate-900/50 backdrop-blur-sm border border-amber-600/20 rounded-xl p-8 space-y-6"
        >
          <div className="flex items-center justify-between mb-8">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-amber-400 hover:text-amber-300 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-2xl font-light text-white flex-1 text-center">
              {step === 1 ? '계정 만들기' : '프로필 설정'}
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
                <label className="block text-xs text-amber-200/70 uppercase tracking-widest font-light">이메일</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800/50 border border-amber-600/20 text-white placeholder-slate-500 rounded-lg focus:border-amber-500/50 focus:bg-slate-800/70 transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-amber-200/70 uppercase tracking-widest font-light">비밀번호</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800/50 border border-amber-600/20 text-white placeholder-slate-500 rounded-lg focus:border-amber-500/50 focus:bg-slate-800/70 transition"
                  required
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-900/20 border border-red-600/30 text-red-300 text-sm p-3 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20"
              >
                다음
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
                <label className="block text-xs text-amber-200/70 uppercase tracking-widest font-light">이름</label>
                <Input
                  type="text"
                  placeholder="홍길동"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-slate-800/50 border border-amber-600/20 text-white placeholder-slate-500 rounded-lg focus:border-amber-500/50 focus:bg-slate-800/70 transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-amber-200/70 uppercase tracking-widest font-light">닉네임 (선택)</label>
                <Input
                  type="text"
                  placeholder="페어레의 친구"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="bg-slate-800/50 border border-amber-600/20 text-white placeholder-slate-500 rounded-lg focus:border-amber-500/50 focus:bg-slate-800/70 transition"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-900/20 border border-red-600/30 text-red-300 text-sm p-3 rounded-lg"
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
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50"
              >
                {loading ? '처리 중...' : '회원가입 완료'}
              </Button>
            </motion.div>
          )}
        </motion.form>

        {/* 하단 텍스트 */}
        <p className="text-center text-amber-200/50 text-xs mt-8 tracking-wide">
          이미 계정이 있으신가요?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-amber-400 hover:text-amber-300 transition font-medium"
          >
            로그인
          </button>
        </p>
      </motion.div>
    </div>
  );
}
