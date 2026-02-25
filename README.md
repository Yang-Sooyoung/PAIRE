# PAIRÉ - Your Table's Fairy Sommelier 🧚‍♀️

음식이 놓인 테이블 위에 나타나 가장 우아한 한 잔을 골라주는 테이블의 요정 소믈리에.

## 🎯 서비스 개요

**PAIRÉ**는 음식 사진을 촬영하면 AI가 음식을 인식하고, 사용자의 상황과 취향에 맞는 최적의 음료를 추천해주는 서비스입니다.

### 핵심 가치
- **모든 사람을 위한 고급스러운 페어링**: 와인/위스키 지식이 없어도 괜찮아요
- **"센스"를 빌려주는 서비스**: 전문 지식이 아닌 감성적인 추천
- **음식 경험을 한 단계 끌어올리는 작은 마법**: 데이트, 혼술, 캠핑, 집들이 등 모든 순간에

## 🎨 브랜드 정체성

### 캐릭터: 페어레 (PAIRÉ Fairy)
- **역할**: 취향을 읽어주는 요정 
- **성격**: 우아함, 다정함, 절제된 자신감
- **말투**: 부드럽고 여백 있는 문장, 단정하지만 따뜻함

### 디자인 컨셉
- **톤앤매너**: Luxury, Elegant, Magical Minimalism
- **색상**: 딥 차콜 블랙, 다크 네이비, 샴페인 골드 포인트
- **분위기**: 부티크 와인바, 저녁의 정적, 은은한 조명

## 🏗️ 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Shadcn/ui
- **State Management**: Zustand (userStore)
- **Payment**: Toss Payments (토스 페이먼츠)
- **Vision API**: Google Cloud Vision (음식 인식)
- **Fonts**: Cormorant Garamond (영문), Noto Sans KR (한글)

## 📋 기능 우선순위

### 🔴 1순위 (무조건 필요)
- [ ] 로그인 / 비로그인 구분
- [ ] 사진 업로드 (카메라 또는 갤러리)
- [ ] Vision API → 메뉴 추출
- [ ] 추천 결과 표시

### 🟠 2순위 (MVP 완성선)
- [ ] 상황 선택 (데이트/혼술/캠핑/집들이/혼밥)
- [ ] 취향 선택 (알콜/논알콜, 단맛/쓴맛/산미, 가벼움/묵직함)
- [ ] 무료/유료 제한 (무료: 하루 1회, 유료: 무제한)
- [ ] 결제 (Toss Payments)
- [ ] 추천 상세 설명

### 🟡 3순위 (고급화)
- [x] 추천 히스토리 (상세 보기 포함)
- [x] 즐겨찾기 (상세 보기 포함)
- [ ] 공유 기능
- [ ] TTS (음성 안내)

## 🔐 인증 & 멤버십 & 결제

### 인증 플로우
```
비로그인 사용자
  ↓
  → 하루 1회 무료 추천 가능
  → 추가 추천 시 로그인 유도
  ↓
로그인 사용자 (FREE)
  ↓
  → 하루 1회 무료 추천
  → 추가 추천 시 구독 유도
  ↓
구독 사용자 (PREMIUM)
  ↓
  → 무제한 추천
```

### 멤버십 타입
- **FREE**: 기본 사용자 (하루 1회 추천)
- **PREMIUM**: 구독 사용자 (무제한 추천)

### 권한 체크 위치
**중요**: 프론트엔드에서 UI만 제어하고, 실제 권한 체크는 **백엔드 API에서 수행**

```typescript
// 추천 API 호출 시 백엔드에서 검증
POST /api/recommendation/create
- 비로그인: 일일 한도 체크
- FREE: 일일 한도 체크
- PREMIUM: 무제한 허용
```

### 결제 플로우
```
구독 페이지
  ↓
결제 수단 등록 (Toss Billing Auth)
  ↓
구독 생성 (API)
  ↓
결제 성공 → 멤버십 PREMIUM 활성화
  ↓
구독 상태 페이지 (구독 관리/해지)
```

### 결제 성공 후 처리
1. **웹훅 수신**: Toss Payments → Backend
2. **멤버십 업데이트**: `user.membership = 'PREMIUM'`
3. **구독 정보 저장**: 구독 ID, 결제 수단, 갱신 날짜
4. **프론트엔드 동기화**: userStore 업데이트

## 📁 프로젝트 구조

```
app/
├── page.tsx                    # 메인 페이지 (추천 플로우)
├── layout.tsx                  # 루트 레이아웃
├── globals.css                 # 전역 스타일
├── login/page.tsx              # 로그인
├── signup/page.tsx             # 회원가입
├── user-info/page.tsx          # 내 정보
├── subscription/
│   ├── page.tsx                # 구독 플랜 선택
│   ├── status/page.tsx         # 구독 상태 (구독 중)
│   ├── success/page.tsx        # 구독 성공
│   ├── cancel/page.tsx         # 구독 취소
│   ├── fail/page.tsx           # 구독 실패
│   ├── register/
│   │   ├── SubscribeRegister.tsx
│   │   └── done/page.tsx
│   └── constants/
│       └── subscriptionPlans.ts
├── history/
│   ├── page.tsx                # 추천 히스토리 목록
│   └── [id]/page.tsx           # 추천 상세 보기
├── favorites/
│   ├── page.tsx                # 즐겨찾기 목록
│   └── [id]/page.tsx           # 즐겨찾기 음료 상세
├── payment/
│   ├── page.tsx                # 결제 페이지
│   ├── success/page.tsx        # 결제 성공
│   └── cancel/page.tsx         # 결제 취소
└── utils/
    └── tokenStorage.ts         # 토큰 저장소

components/
├── paire/                      # PAIRÉ 핵심 컴포넌트
│   ├── home-screen.tsx         # 홈 화면
│   ├── capture-screen.tsx      # 사진 촬영
│   ├── loading-screen.tsx      # 로딩 (Vision API 처리)
│   ├── preference-screen.tsx   # 상황/취향 선택
│   ├── recommendation-screen.tsx # 추천 결과
│   ├── drink-detail-screen.tsx # 음료 상세
│   └── menu-input-screen.tsx   # 메뉴 텍스트 입력
├── ui/                         # Shadcn UI 컴포넌트
└── theme-provider.tsx          # 테마 제공자

lib/
├── i18n/context.tsx            # 다국어 지원
└── utils.ts                    # 유틸리티

hooks/
├── use-mobile.ts               # 모바일 감지
└── use-toast.ts                # 토스트 알림
```

## 🚀 시작하기

### 설치
```bash
pnpm install
```

### 개발 서버 실행
```bash
pnpm dev
```

### 빌드
```bash
pnpm build
pnpm start
```

### 린트
```bash
pnpm lint
```

## 🔧 환경 변수

```env
# Toss Payments
NEXT_PUBLIC_TOSS_TEST_CLIENT_KEY=your_toss_client_key

# Google Cloud Vision API
NEXT_PUBLIC_GOOGLE_VISION_API_KEY=your_vision_api_key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 📝 API 엔드포인트 (예상)

### 인증
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/refresh` - 토큰 갱신

### 추천
- `POST /api/recommendation/create` - 추천 생성 (권한 체크 포함)
- `GET /api/recommendation/history` - 추천 히스토리
- `GET /api/recommendation/:id` - 추천 상세 조회

### 즐겨찾기
- `POST /api/favorite/:drinkId` - 즐겨찾기 추가
- `DELETE /api/favorite/:drinkId` - 즐겨찾기 제거
- `GET /api/favorite` - 즐겨찾기 목록
- `GET /api/favorite/check/:drinkId` - 즐겨찾기 상태 확인

### 음료
- `GET /api/drink/:id` - 음료 상세 정보

### 구독
- `GET /api/subscription/methods` - 등록된 결제 수단 조회
- `POST /api/subscription/create` - 구독 생성
- `GET /api/subscription/status` - 구독 상태 조회
- `POST /api/subscription/cancel` - 구독 취소

### 결제
- `POST /api/payment/webhook` - Toss Payments 웹훅

## ⚠️ 주의사항

### 비로그인 체험
- 비로그인 사용자는 **하루 1회만** 추천 가능
- 추가 추천 시 로그인 유도
- 로컬스토리지에 일일 한도 기록 (서버 검증 필수)

### 멤버십 권한 체크
- **프론트엔드**: UI 제어만 (버튼 활성화/비활성화)
- **백엔드**: 실제 권한 검증 (API 호출 시)
- 예: 무료 사용자가 API 직접 호출 시 거부

### 결제 보안
- 결제 수단 등록 시 **Toss Billing Auth** 사용
- 실제 결제는 **백엔드에서만** 처리
- 웹훅으로 결제 상태 동기화

## 📚 참고 자료

- [Toss Payments 문서](https://docs.tosspayments.com)
- [Google Cloud Vision API](https://cloud.google.com/vision/docs)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Shadcn/ui 컴포넌트](https://ui.shadcn.com)

---

**마지막 업데이트**: 2026년 2월 5일
