'use client';

import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';
import { ChevronRight, LogOut, Trash2, Mail, FileText, ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useUserStore();

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
        throw new Error('계정 삭제 실패');
      }

      logout();
      router.push('/');
    } catch (error) {
      alert('계정 삭제 중 오류가 발생했습니다.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-2xl font-light mb-4">PAIRÉ</div>
          <div className="text-amber-200/50 text-sm">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-amber-500/3 rounded-full blur-3xl" />
      </div>

      {/* 헤더 */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-amber-600/20 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4 relative z-20">
          <button
            onClick={() => router.back()}
            className="text-amber-400 hover:text-amber-300 transition"
            title="뒤로가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-light text-white tracking-wide">설정</h1>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 relative z-10">
        {/* 계정 정보 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-amber-600/20 rounded-xl p-6 space-y-4"
        >
          <h2 className="text-xs text-amber-200/70 uppercase tracking-widest font-light">계정 정보</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-amber-600/10">
              <span className="text-amber-200/60 text-sm">이메일</span>
              <span className="text-white font-light">{user.email}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-amber-600/10">
              <span className="text-amber-200/60 text-sm">닉네임</span>
              <span className="text-white font-light">{user.nickname || user.username}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-amber-600/10">
              <span className="text-amber-200/60 text-sm">멤버십</span>
              <span className={user.membership === 'PREMIUM' ? 'text-amber-400 font-semibold' : 'text-amber-200/50'}>
                {user.membership === 'PREMIUM' ? 'PREMIUM' : 'FREE'}
              </span>
            </div>
          </div>
        </motion.section>

        {/* 약관 & 정책 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-amber-600/20 rounded-xl overflow-hidden"
        >
          <h2 className="text-xs text-amber-200/70 uppercase tracking-widest font-light px-6 pt-6 pb-4">약관 & 정책</h2>
          <div className="divide-y divide-amber-600/10">
            <button
              onClick={() => router.push('/legal/terms')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-amber-600/5 transition text-left group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-amber-400/60 group-hover:text-amber-400 transition" />
                <span className="text-amber-200/80 group-hover:text-amber-200 transition">이용약관</span>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-600/40 group-hover:text-amber-600/60 transition" />
            </button>

            <button
              onClick={() => router.push('/legal/privacy')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-amber-600/5 transition text-left group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-amber-400/60 group-hover:text-amber-400 transition" />
                <span className="text-amber-200/80 group-hover:text-amber-200 transition">개인정보처리방침</span>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-600/40 group-hover:text-amber-600/60 transition" />
            </button>

            <button
              onClick={() => router.push('/legal/payment')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-amber-600/5 transition text-left group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-amber-400/60 group-hover:text-amber-400 transition" />
                <span className="text-amber-200/80 group-hover:text-amber-200 transition">결제/환불 정책</span>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-600/40 group-hover:text-amber-600/60 transition" />
            </button>
          </div>
        </motion.section>

        {/* 고객 지원 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-amber-600/20 rounded-xl overflow-hidden"
        >
          <h2 className="text-xs text-amber-200/70 uppercase tracking-widest font-light px-6 pt-6 pb-4">고객 지원</h2>
          <button
            onClick={() => window.location.href = 'mailto:support@paire.app?subject=PAIRÉ 문의'}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-amber-600/5 transition text-left group"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-amber-400/60 group-hover:text-amber-400 transition" />
              <span className="text-amber-200/80 group-hover:text-amber-200 transition">문의하기</span>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-600/40 group-hover:text-amber-600/60 transition" />
          </button>
        </motion.section>

        {/* 위험 영역 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-red-600/20 rounded-xl overflow-hidden"
        >
          <h2 className="text-xs text-red-400/70 uppercase tracking-widest font-light px-6 pt-6 pb-4">위험 영역</h2>
          <div className="divide-y divide-red-600/10">
            <button
              onClick={handleLogout}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-red-600/5 transition text-left group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-red-400/60 group-hover:text-red-400 transition" />
                <span className="text-red-300/80 group-hover:text-red-300 transition">로그아웃</span>
              </div>
              <ChevronRight className="w-5 h-5 text-red-600/40 group-hover:text-red-600/60 transition" />
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-red-600/5 transition text-left group">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-500/60 group-hover:text-red-500 transition" />
                    <span className="text-red-400/80 group-hover:text-red-400 transition">계정 삭제</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-600/40 group-hover:text-red-600/60 transition" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-900 border border-red-600/20">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white text-xl">계정을 삭제하시겠어요?</AlertDialogTitle>
                  <AlertDialogDescription className="text-amber-200/60 text-sm">
                    이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.
                    <ul className="mt-4 space-y-2 text-amber-200/50 text-xs">
                      <li>• 계정 정보</li>
                      <li>• 추천 기록</li>
                      <li>• 구독 정보</li>
                      <li>• 모든 개인 데이터</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-3 pt-4">
                  <AlertDialogCancel className="bg-slate-800 hover:bg-slate-700 text-white border-amber-600/20">
                    취소
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-900/50 hover:bg-red-900 text-red-300 border border-red-600/30"
                  >
                    삭제
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.section>

        {/* 버전 정보 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-amber-200/40 text-xs py-8 space-y-1"
        >
          <p className="font-light">PAIRÉ v1.0.0</p>
          <p className="text-amber-200/30">© 2026 PAIRÉ. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
}
