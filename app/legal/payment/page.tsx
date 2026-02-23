'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function PaymentPolicyPage() {
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
            <h1 className="text-xl font-light text-white">결제/환불 정책</h1>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-slate-300 space-y-6 prose prose-invert max-w-none">
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">1. 결제 방법</h2>
              <p>
                PAIRÉ는 Toss Payments를 통해 안전한 결제를 제공합니다.
                신용카드, 체크카드 등 다양한 결제 수단을 지원합니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">2. 구독 가격</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>PREMIUM 월간: ₩9,900</li>
                <li>PREMIUM 연간: ₩99,000</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">3. 자동 갱신</h2>
              <p>
                PREMIUM 구독은 자동으로 갱신됩니다.
                갱신 예정일 7일 전에 알림을 드립니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">4. 구독 취소</h2>
              <p>
                구독은 언제든지 취소할 수 있습니다.
                취소 후 남은 기간은 계속 사용할 수 있으며,
                다음 갱신일부터 FREE로 변경됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">5. 환불 정책</h2>
              <p>
                구독 취소 후 이미 결제된 금액은 환불되지 않습니다.
                단, 다음의 경우는 환불 대상입니다:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>결제 오류로 인한 중복 결제</li>
                <li>서비스 제공 불가 (7일 이상)</li>
                <li>사용자 요청 (구독 후 7일 이내)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">6. 환불 신청</h2>
              <p>
                환불을 원하시면 support@paire.app으로 문의해주세요.
                신청 후 5-7 영업일 내에 처리됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">7. 결제 실패</h2>
              <p>
                결제 실패 시 다음 날 자동으로 재시도됩니다.
                3회 연속 실패 시 구독이 일시 중단됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">8. 가격 변경</h2>
              <p>
                PAIRÉ는 가격을 변경할 수 있습니다.
                가격 변경 시 30일 전에 공지하며,
                기존 구독자는 변경 전 가격으로 1회 더 갱신됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">9. 세금</h2>
              <p>
                표시된 가격은 부가세 포함 가격입니다.
                지역에 따라 추가 세금이 부과될 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">10. 분쟁 해결</h2>
              <p>
                결제 관련 분쟁은 support@paire.app으로 문의해주세요.
                성실하게 해결하겠습니다.
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
