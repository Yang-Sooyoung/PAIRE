# Capacitor & Stripe 설정 가이드

## Capacitor 설정

### 1. Capacitor 설치

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```

### 2. 플랫폼 추가

```bash
# iOS
npm install @capacitor/ios
npx cap add ios

# Android
npm install @capacitor/android
npx cap add android
```

### 3. 필요한 플러그인 설치

```bash
# Browser 플러그인 (외부 링크 열기)
npm install @capacitor/browser

# Device 플러그인 (국가/언어 감지)
npm install @capacitor/device
```

### 4. capacitor.config.ts 설정

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.paire.app',
  appName: 'PAIRÉ',
  webDir: 'out', // Next.js static export
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    Browser: {
      presentationStyle: 'popover', // iOS
    },
  },
};

export default config;
```

### 5. Next.js Static Export 설정

`next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Capacitor용 static export
  images: {
    unoptimized: true, // static export에서는 필수
  },
};

module.exports = nextConfig;
```

### 6. 빌드 및 동기화

```bash
# Next.js 빌드
npm run build

# Capacitor 동기화
npx cap sync

# iOS 실행
npx cap open ios

# Android 실행
npx cap open android
```

## Stripe 설정

### 1. Stripe 계정 생성

1. https://stripe.com 에서 계정 생성
2. Dashboard에서 API 키 확인

### 2. 환경 변수 설정

**프론트엔드 (.env.local)**:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_YEARLY=price_...
```

**백엔드 (.env)**:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Stripe Price 생성

Stripe Dashboard에서:
1. Products → Create product
2. 월간 플랜: $9.99/month (recurring)
3. 연간 플랜: $99.99/year (recurring)
4. Price ID를 환경 변수에 추가

### 4. Webhook 설정

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-api.com/api/stripe/webhook`
3. 이벤트 선택:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Webhook Secret을 환경 변수에 추가

### 5. 테스트 카드

Stripe 테스트 모드에서 사용 가능한 카드:
- 성공: `4242 4242 4242 4242`
- 3D Secure: `4000 0027 6000 3184`
- 실패: `4000 0000 0000 0002`

만료일: 미래의 아무 날짜
CVC: 아무 3자리 숫자
ZIP: 아무 5자리 숫자

## 지역별 결제 분기

### 국가 감지 로직

```typescript
// lib/region-detector.ts
export function detectCountry(): CountryCode {
  // 1. localStorage 확인
  // 2. Capacitor Device 정보 (모바일 앱)
  // 3. 브라우저 언어
  // 4. 타임존
  return 'KR' | 'US' | 'OTHER';
}
```

### 결제 분기

- **한국 (KR)**: 토스페이먼츠
- **미국 (US)**: Stripe
- **기타 (OTHER)**: Stripe

### 쇼핑 링크 분기

- **한국**: 쿠팡
- **미국**: Amazon
- **기타**: Vivino

## Capacitor에서 외부 링크 열기

```typescript
import { openExternalLink } from '@/lib/region-detector';

// 자동으로 Capacitor Browser 또는 window.open 사용
await openExternalLink('https://example.com');
```

## 프로덕션 체크리스트

### Stripe
- [ ] 프로덕션 API 키로 변경
- [ ] Webhook 엔드포인트 프로덕션 URL로 변경
- [ ] Price ID 프로덕션 값으로 변경
- [ ] 실제 카드로 테스트

### Capacitor
- [ ] App ID 변경 (com.paire.app)
- [ ] App 아이콘 및 스플래시 스크린 설정
- [ ] iOS: Xcode에서 Signing & Capabilities 설정
- [ ] Android: build.gradle에서 버전 코드/이름 설정
- [ ] 앱 스토어 제출 준비

### 보안
- [ ] HTTPS 사용
- [ ] API 키 환경 변수로 관리
- [ ] CORS 설정 확인
- [ ] Rate limiting 설정

## 문제 해결

### Capacitor에서 API 호출 안됨
- CORS 설정 확인
- capacitor.config.ts에서 server.url 설정

### Stripe Webhook 실패
- Webhook Secret 확인
- Raw body 사용 확인 (NestJS: `rawBody: true`)

### 국가 감지 안됨
- localStorage 확인
- Capacitor Device 플러그인 설치 확인
