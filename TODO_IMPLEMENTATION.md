# PAIRÉ 미구현 기능 목록

## 🔴 Critical (핵심 기능 - 즉시 구현 필요)

### 1. 프론트엔드 → 백엔드 API 연결 ⚠️
**현재 상태:** 프론트엔드가 하드코딩된 샘플 데이터 사용
**문제:** 
- `recommendation-screen.tsx`에서 `sampleDrinks` 사용
- 실제 백엔드 API 호출 안 함
- Vision API로 음식 인식해도 프론트에서 사용 안 함

**해야 할 것:**
```typescript
// app/page.tsx에서
const handlePreferenceSubmit = async (prefs) => {
  setPreferences(prefs);
  
  // 백엔드 API 호출
  const response = await fetch(`${API_URL}/recommendation/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // 로그인 시
    },
    body: JSON.stringify({
      imageUrl: capturedImage,
      occasion: prefs.occasion,
      tastes: prefs.tastes
    })
  });
  
  const data = await response.json();
  setRecommendedDrinks(data.recommendation.drinks);
  setScreen("recommendation");
};
```

### 2. 이미지 업로드 처리
**현재 상태:** 로컬 base64만 처리
**필요:** 
- 이미지를 서버에 업로드 (Supabase Storage 또는 Cloudinary)
- 공개 URL 생성
- Vision API에 URL 전달

### 3. 결제 수단 UI 개선
**현재 상태:** 등록 후에도 등록 버튼만 보임
**필요:**
- 등록된 결제 수단 표시 (카드 마지막 4자리)
- 제거 버튼 추가
- 구독 상태 표시

---

## 🟠 Important (중요 - 곧 구현 필요)

### 4. 추천 히스토리
**백엔드:** ✅ 구현됨 (`GET /api/recommendation/history`)
**프론트엔드:** ❌ UI 없음

### 5. 결제 수단 제거
**백엔드:** ❌ 엔드포인트 없음
**프론트엔드:** ❌ UI 없음

### 6. 구독 취소 플로우
**백엔드:** ✅ 구현됨 (`POST /api/subscription/cancel`)
**프론트엔드:** ❌ UI 미완성

### 7. 자동 갱신 (Cron Job)
**현재 상태:** 코드만 있고 실행 안 됨
**필요:** 
- Railway Cron Job 설정
- 또는 별도 스케줄러 서비스

---

## 🟡 Nice to Have (추가 기능)

### 8. 공유 기능
**상태:** 미구현
**필요:** 추천 결과 공유 (카카오톡, 링크 복사)

### 9. 즐겨찾기
**상태:** 미구현
**필요:** 좋아하는 음료 저장

### 10. TTS (음성 안내)
**상태:** 미구현
**필요:** 페어레 요정 음성으로 추천 설명

### 11. 다국어 지원 완성
**현재 상태:** 구조만 있고 번역 미완성
**필요:** 모든 텍스트 한/영 번역

---

## 🔧 버그 & 개선

### 12. 환경 변수 관리
- ✅ 백엔드: Railway 설정 완료
- ⚠️ 프론트엔드: `.env.local` 파일 필요 (로컬 개발용)

### 13. 에러 처리
- 네트워크 에러 시 사용자 친화적 메시지
- 로딩 상태 표시 개선

### 14. 보안
- JWT 토큰 만료 처리
- Refresh Token 자동 갱신
- CORS 설정 프로덕션용으로 변경 (현재 모든 origin 허용)

---

## 📊 우선순위 요약

**즉시 (이번 주):**
1. ✅ Vision API 경로 수정 (완료)
2. ✅ Seed 데이터 자동 실행 (완료)
3. ❌ 프론트엔드 API 연결 (가장 중요!)
4. ❌ 이미지 업로드 처리

**다음 주:**
5. 결제 수단 UI 개선
6. 추천 히스토리 UI
7. 구독 취소 플로우

**나중에:**
8. 공유 기능
9. 즐겨찾기
10. TTS

---

## 🎯 다음 단계

1. **프론트엔드 API 연결** - 가장 중요!
   - `app/api/recommendation.ts` 생성
   - `app/page.tsx`에서 API 호출
   - `recommendation-screen.tsx`에서 실제 데이터 사용

2. **이미지 업로드**
   - Supabase Storage 설정
   - 업로드 함수 구현
   - Vision API에 URL 전달

3. **테스트**
   - 실제 음식 사진으로 테스트
   - 다양한 상황/취향 조합 테스트
   - 추천 결과 검증
