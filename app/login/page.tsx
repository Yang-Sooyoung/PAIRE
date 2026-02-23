'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/app/api/auth';
import { useUserStore } from '@/app/store/userStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken, setRefreshToken } = useUserStore();

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

      router.push('/user-info');
    } catch (err: any) {
      setError(err.message || '로그인 실패. 이메일 또는 비밀번호를 확인하세요.');
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
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-amber-600/20 rounded-xl p-8 space-y-6"
        >
          <h2 className="text-2xl font-light text-white text-center mb-8">로그인</h2>

          {/* 이메일 */}
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

          {/* 비밀번호 */}
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

          {/* 에러 메시지 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/20 border border-red-600/30 text-red-300 text-sm p-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          {/* 로그인 버튼 */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </Button>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-600/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-slate-900/50 text-amber-200/50 uppercase tracking-widest">또는</span>
            </div>
          </div>

          {/* 회원가입 버튼 */}
          <Button
            type="button"
            onClick={() => router.push('/signup')}
            className="w-full bg-slate-800/50 border border-amber-600/20 hover:bg-slate-800/80 hover:border-amber-500/40 text-white font-medium py-3 rounded-lg transition-all duration-300"
          >
            회원가입
          </Button>
        </motion.form>

        {/* 하단 텍스트 */}
        <p className="text-center text-amber-200/50 text-xs mt-8 tracking-wide">
          계정이 없으신가요?{' '}
          <button
            onClick={() => router.push('/signup')}
            className="text-amber-400 hover:text-amber-300 transition font-medium"
          >
            가입하기
          </button>
        </p>
      </motion.div>
    </div>
  );
}
