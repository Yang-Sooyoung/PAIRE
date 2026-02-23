"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function RegisterDonePage() {
  const searchParams = useSearchParams();
  const billingAuthKey = searchParams.get("billingAuthKey");
  const customerKey = searchParams.get("customerKey");

  useEffect(() => {
    if (billingAuthKey && customerKey) {
      fetch("/api/subscription/register-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingAuthKey, customerKey }),
      }).then(async (res) => {
        if (res.ok) {
          alert("결제수단 등록 성공");
          // ✅ 이후 플랜선택 페이지나 구독확인 페이지로 이동
        } else {
          alert("결제수단 등록 실패");
        }
      });
    }
  }, [billingAuthKey, customerKey]);

  return <p>결제수단 등록 중입니다...</p>;
}
