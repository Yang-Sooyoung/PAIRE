# Stripe 빠른 설정 가이드

## 1. Stripe 계정 생성 및 API 키 발급

1. https://stripe.com 에서 계정 생성
2. Dashboard → Developers → API keys
3. 테스트 모드에서 키 복사:
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

## 2. 환경 변수 설정

### 프론트엔드 (.env.local)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_1...
NEXT_PUBLIC_STRIPE_PRICE_YEARLY=price_1...
```

### 백엔드 (.env)
```env
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 3. Stripe Price 생성

1. Dashboard → Products → Create product
2. 제품 정보 입력:
   - Name: "PAIRÉ Premium Monthly"
   - Description: "Monthly subscription"
3. Pricing 설정:
   - Price: $9.99
   - Billing period: Monthly
   - Recurring
4. Save → Price ID 복사 (`price_1...`)
5. 연간 플랜도 동일하게 생성 ($99.99/year)

## 4. Webhook 설정

1. Dashboard → Developers → Webhooks
2. Add endpoint
3. Endpoint URL: `https://your-api.com/api/stripe/webhook`
4. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Signing secret 복사 (`whsec_...`)

## 5. 테스트

### 테스트 카드
- 성공: `4242 4242 4242 4242`
- 만료일: 미래의 아무 날짜 (예: 12/34)
- CVC: 아무 3자리 (예: 123)
- ZIP: 아무 5자리 (예: 12345)

### 테스트 방법
1. 브라우저 언어를 영어로 변경 (또는 localStorage에서 `paire-country`를 `US`로 설정)
2. 구독 페이지 접속
3. Stripe 결제 UI 확인
4. 테스트 카드로 결제
5. Webhook 이벤트 확인 (Dashboard → Developers → Webhooks → Events)

## 6. 프로덕션 전환

1. Dashboard 우측 상단에서 "Test mode" → "Live mode" 전환
2. Live mode API 키 발급
3. 환경 변수를 Live 키로 변경
4. Webhook 엔드포인트를 프로덕션 URL로 변경
5. 실제 카드로 테스트

## 문제 해결

### Webhook 실패
- Webhook Secret이 올바른지 확인
- 엔드포인트 URL이 HTTPS인지 확인
- Railway 로그에서 에러 확인

### 결제 실패
- API 키가 올바른지 확인
- Price ID가 올바른지 확인
- 브라우저 콘솔에서 에러 확인

### 국가 감지 안됨
- 브라우저 언어 설정 확인
- localStorage에서 `paire-country` 확인
- 콘솔에서 "Detected country" 로그 확인
