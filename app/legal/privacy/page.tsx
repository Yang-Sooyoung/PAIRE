'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  const router = useRouter();

  return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        {/* 헤더 */}
        <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
                onClick={() => router.back()}
                className="text-slate-400 hover:text-white transition"
            >
              ←
            </button>
            <h1 className="text-xl font-light text-white">개인정보처리방침</h1>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-slate-300 space-y-6 prose prose-invert max-w-none">
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">1. 개인정보의 수집</h2>
              <p>PAIRÉ는 다음의 개인정보를 수집합니다:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>이메일 주소</li>
                <li>사용자명, 닉네임</li>
                <li>비밀번호 (암호화 저장)</li>
                <li>음식 사진 (추천 목적)</li>
                <li>추천 기록 및 취향 정보</li>
                <li>결제 정보 (결제 수단 토큰)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">2. 개인정보의 이용</h2>
              <p>수집된 개인정보는 다음의 목적으로만 이용됩니다:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>서비스 제공 및 개선</li>
                <li>사용자 인증 및 계정 관리</li>
                <li>추천 알고리즘 개선</li>
                <li>결제 및 구독 관리</li>
                <li>고객 지원 및 문의 응답</li>
                <li>법적 의무 이행</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">3. 개인정보의 보호</h2>
              <p>
                PAIRÉ는 개인정보 보호를 위해 다음의 조치를 취합니다:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>암호화 저장 (비밀번호, 결제 정보)</li>
                <li>HTTPS 통신</li>
                <li>접근 제어 및 권한 관리</li>
                <li>정기적인 보안 감시</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">4. 개인정보의 제3자 제공</h2>
              <p>
                PAIRÉ는 사용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
                단, 다음의 경우는 예외입니다:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>법적 요청 또는 법원 명령</li>
                <li>결제 처리 (결제 대행사)</li>
                <li>서비스 제공 (클라우드 호스팅 등)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">5. 개인정보의 보유 및 삭제</h2>
              <p>
                개인정보는 서비스 이용 기간 동안 보유됩니다.
                계정 삭제 시 모든 개인정보는 즉시 삭제됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">6. 사용자의 권리</h2>
              <p>사용자는 다음의 권리를 가집니다:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>개인정보 열람 요청</li>
                <li>개인정보 수정 요청</li>
                <li>개인정보 삭제 요청</li>
                <li>개인정보 처리 정지 요청</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">7. 쿠키 및 추적 기술</h2>
              <p>
                PAIRÉ는 사용자 경험 개선을 위해 쿠키를 사용할 수 있습니다.
                사용자는 브라우저 설정에서 쿠키를 거부할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">8. 미성년자 보호</h2>
              <p>
                PAIRÉ는 14세 미만의 미성년자 개인정보를 수집하지 않습니다.
                미성년자가 가입한 경우 즉시 삭제됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">9. 정책 변경</h2>
              <p>
                본 정책은 변경될 수 있으며, 변경 시 서비스 내에서 공지합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">10. 문의</h2>
              <p>
                개인정보 처리에 관한 문의는 support@paire.app으로 연락주세요.
              </p>
            </section>

            <section className="pt-6 border-t border-slate-700">
              <p className="text-sm text-slate-500">
                마지막 업데이트: 2026년 2월 5일
              </p>
            </section>
          </div>

          <div className="mt-8 mb-8">
            <Button
                onClick={() => router.back()}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3"
            >
              돌아가기
            </Button>
          </div>
        </div>
      </div>
  );
}
