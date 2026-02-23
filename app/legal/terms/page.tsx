'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
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
            <h1 className="text-xl font-light text-white">이용약관</h1>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-slate-300 space-y-6 prose prose-invert max-w-none">
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">제1조 총칙</h2>
              <p>
                본 약관은 PAIRÉ(이하 "서비스")를 이용하는 모든 사용자에게 적용됩니다.
                서비스 이용 시 본 약관에 동의한 것으로 간주됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">제2조 서비스 설명</h2>
              <p>
                PAIRÉ는 음식 사진을 촬영하면 AI가 음식을 인식하고, 사용자의 상황과 취향에 맞는
                최적의 음료를 추천해주는 서비스입니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">제3조 회원 가입</h2>
              <p>
                회원은 본 약관에 동의하고 필요한 정보를 제공하여 가입할 수 있습니다.
                허위 정보 제공 시 서비스 이용이 제한될 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">제4조 서비스 이용</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>FREE 회원: 하루 1회 추천 가능</li>
                <li>PREMIUM 회원: 무제한 추천 가능</li>
                <li>비로그인 사용자: 하루 1회 추천 가능</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">제5조 금지 행위</h2>
              <p>다음의 행위는 금지됩니다:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>불법적인 콘텐츠 업로드</li>
                <li>서비스 시스템 해킹 또는 부정 이용</li>
                <li>타인의 개인정보 도용</li>
                <li>서비스 방해 행위</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">제6조 책임 제한</h2>
              <p>
                PAIRÉ는 추천 결과에 대한 책임을 지지 않습니다. 추천은 참고용이며,
                최종 선택은 사용자의 판단에 따릅니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">제7조 약관 변경</h2>
              <p>
                PAIRÉ는 필요시 약관을 변경할 수 있으며, 변경 시 공지합니다.
                변경된 약관에 동의하지 않으면 서비스 이용을 중단할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">제8조 서비스 중단</h2>
              <p>
                PAIRÉ는 유지보수, 업그레이드 등의 사유로 서비스를 일시 중단할 수 있습니다.
                긴급한 경우 사전 공지 없이 중단할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">제9조 준거법</h2>
              <p>
                본 약관은 대한민국 법률에 따라 해석되며, 분쟁 발생 시 대한민국 법원에 제소합니다.
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
