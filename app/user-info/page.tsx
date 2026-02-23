'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Crown, Zap, ArrowRight, LogOut } from 'lucide-react';

export default function UserInfoPage() {
  const router = useRouter();
  const { user, loading, initialized, setLoading, initializeUser } = useUserStore();

  useEffect(() => {
    if (!initialized) {
      setLoading(true);
      initializeUser().finally(() => {
        setLoading(false);
      });
    }
  }, [initialized, setLoading, initializeUser]);

  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-2xl font-light mb-4">PAIRÉ</div>
          <div className="text-amber-200/50 text-sm">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-light text-white mb-6">로그인이 필요합니다</h2>
          <Button
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold px-8 py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20"
          >
            로그인 페이지로 이동
          </Button>
        </motion.div>
      </div>
    );
  }

  const { id, email, username, roles, membership } = user;
  const isPremium = membership === 'PREMIUM';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-12 relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-amber-500/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto relative z-10"
      >
        {/* 헤더 */}
        <div className="text-center mb-12">
          <button
            onClick={() => router.push('/')}
            className="inline-block hover:opacity-80 transition mb-6"
            title="홈으로 이동"
          >
            <h1 className="text-4xl font-light text-white tracking-widest">PAIRÉ</h1>
          </button>
          <p className="text-amber-200/60 text-sm tracking-wide font-light">내 정보</p>
        </div>

        {/* 메인 카드 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-amber-600/20 rounded-2xl p-8 mb-8 space-y-8"
        >
          {/* 멤버십 상태 */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-amber-600/10 to-amber-500/5 border border-amber-600/20 rounded-xl">
            <div className="flex items-center gap-4">
              {isPremium ? (
                <Crown className="w-8 h-8 text-amber-400" />
              ) : (
                <Zap className="w-8 h-8 text-amber-300" />
              )}
              <div>
                <p className="text-xs text-amber-200/70 uppercase tracking-widest font-light">멤버십</p>
                <p className="text-2xl font-light text-white">
                  {isPremium ? 'PREMIUM' : 'FREE'}
                </p>
              </div>
            </div>
            {!isPremium && (
              <Button
                onClick={() => router.push('/subscription')}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold px-6 py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 flex items-center gap-2"
              >
                업그레이드 <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* 사용자 정보 */}
          <div className="space-y-4">
            <h3 className="text-xs text-amber-200/70 uppercase tracking-widest font-light">계정 정보</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 이메일 */}
              <div className="p-4 bg-slate-800/30 border border-amber-600/10 rounded-lg">
                <p className="text-xs text-amber-200/50 uppercase tracking-widest font-light mb-2">이메일</p>
                <p className="text-white font-light break-all">{email}</p>
              </div>

              {/* 이름 */}
              <div className="p-4 bg-slate-800/30 border border-amber-600/10 rounded-lg">
                <p className="text-xs text-amber-200/50 uppercase tracking-widest font-light mb-2">이름</p>
                <p className="text-white font-light">{username}</p>
              </div>

              {/* ID */}
              <div className="p-4 bg-slate-800/30 border border-amber-600/10 rounded-lg">
                <p className="text-xs text-amber-200/50 uppercase tracking-widest font-light mb-2">사용자 ID</p>
                <p className="text-white font-light text-sm">{id}</p>
              </div>

              {/* 권한 */}
              <div className="p-4 bg-slate-800/30 border border-amber-600/10 rounded-lg">
                <p className="text-xs text-amber-200/50 uppercase tracking-widest font-light mb-2">권한</p>
                <p className="text-white font-light">{Array.isArray(roles) ? roles.join(', ') : roles}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 액션 버튼들 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* 추천 시작 */}
          <Button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20"
          >
            추천 시작
          </Button>

          {/* 구독 관리 */}
          <Button
            onClick={() => {
              if (isPremium) {
                router.push('/subscription/status');
              } else {
                router.push('/subscription');
              }
            }}
            variant="outline"
            className="border border-amber-600/20 text-amber-400 hover:bg-amber-600/10 hover:border-amber-500/40 font-semibold py-3 rounded-lg transition-all duration-300"
          >
            {isPremium ? '구독 관리' : '구독하기'}
          </Button>

          {/* 설정 */}
          <Button
            onClick={() => router.push('/settings')}
            variant="outline"
            className="border border-amber-600/20 text-amber-400 hover:bg-amber-600/10 hover:border-amber-500/40 font-semibold py-3 rounded-lg transition-all duration-300"
          >
            설정
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
