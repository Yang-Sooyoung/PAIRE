# PAIRÉ Backend API

NestJS 기반 PAIRÉ 백엔드 API 서버

## 🚀 시작하기

### 1. 설치

```bash
cd backend
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 수정하여 다음을 설정하세요:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/paire
JWT_SECRET=your_jwt_secret_key_here
TOSS_SECRET_KEY=your_toss_secret_key
GOOGLE_VISION_API_KEY=your_google_vision_api_key
```

### 3. 데이터베이스 설정

```bash
# Prisma 마이그레이션
npx prisma migrate dev --name init

# Prisma Studio (선택)
npx prisma studio
```

### 4. 개발 서버 실행

```bash
npm run start:dev
```

서버가 `http://localhost:3001`에서 실행됩니다.

## 📁 프로젝트 구조

```
backend/
├── src/
│   ├── auth/              # 인증 모듈
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── strategies/
│   │   ├── guards/
│   │   └── dto/
│   ├── user/              # 사용자 모듈
│   ├── recommendation/    # 추천 모듈
│   ├── subscription/      # 구독 모듈
│   ├── payment/           # 결제 모듈
│   ├── prisma/            # Prisma 설정
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma      # 데이터베이스 스키마
├── .env.example
├── package.json
└── tsconfig.json
```

## 🔐 API 엔드포인트

### 인증 (Auth)

- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/refresh` - 토큰 갱신
- `GET /api/auth/me` - 현재 사용자 정보

### 사용자 (User)

- `POST /api/user/delete` - 계정 삭제

### 추천 (Recommendation)

- `POST /api/recommendation/create` - 추천 생성 (TODO)
- `GET /api/recommendation/history` - 추천 히스토리 (TODO)

### 구독 (Subscription)

- `GET /api/subscription/methods` - 결제 수단 조회 (TODO)
- `POST /api/subscription/create` - 구독 생성 (TODO)
- `GET /api/subscription/status` - 구독 상태 (TODO)
- `POST /api/subscription/cancel` - 구독 취소 (TODO)

### 결제 (Payment)

- `POST /api/payment/webhook` - 결제 웹훅 (TODO)

## 📝 구현 상태

### ✅ 완료
- [x] 프로젝트 구조
- [x] Prisma 설정
- [x] Auth 모듈 (회원가입, 로그인, 토큰 갱신)
- [x] User 모듈 (계정 삭제)
- [x] JWT 인증

### ⏳ 진행 중
- [ ] Recommendation 모듈 (Vision API 연동)
- [ ] Subscription 모듈 (Toss Payments 연동)
- [ ] Payment 모듈 (웹훅 처리)

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# 통합 테스트
npm run test:e2e

# 커버리지
npm run test:cov
```

## 🔧 개발 팁

### Prisma Studio 실행

```bash
npx prisma studio
```

### 마이그레이션 생성

```bash
npx prisma migrate dev --name migration_name
```

### 타입 생성

```bash
npx prisma generate
```

## 📚 참고 자료

- [NestJS 공식 문서](https://docs.nestjs.com)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [JWT 인증](https://docs.nestjs.com/security/authentication)

## 🚀 배포

### 프로덕션 빌드

```bash
npm run build
npm run start:prod
```

### Docker 배포

```bash
docker build -t paire-backend .
docker run -p 3001:3001 paire-backend
```

## 📞 문의

개발 관련 문의: ruckyrosie@gmail.com

---

**마지막 업데이트**: 2026년 2월 5일
