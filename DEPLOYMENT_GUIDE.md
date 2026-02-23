# PAIRÉ 배포 가이드

## 환경 변수 설정

### 백엔드 (Railway)

Railway 프로젝트 설정에서 다음 환경 변수를 추가하세요:

```bash
# 데이터베이스
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# Toss Payments
TOSS_SECRET_KEY=test_sk_... (테스트) 또는 live_sk_... (프로덕션)
TOSS_CLIENT_KEY=test_ck_... (테스트) 또는 live_ck_... (프로덕션)

# Google Vision API
GOOGLE_VISION_API_KEY=your-google-vision-api-key

# Supabase Storage (이미지 업로드)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# CORS (프로덕션)
FRONTEND_URL=https://your-frontend-domain.com

# 포트
PORT=3000
```

### 프론트엔드 (Vercel)

Vercel 프로젝트 설정에서 다음 환경 변수를 추가하세요:

```bash
# 백엔드 API URL
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app/api

# Toss Payments (클라이언트 키)
NEXT_PUBLIC_TOSS_TEST_CLIENT_KEY=test_ck_...
NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_... (프로덕션)

# Kakao SDK (선택사항)
NEXT_PUBLIC_KAKAO_APP_KEY=your-kakao-app-key
```

---

## Supabase Storage 설정

### 1. Supabase 프로젝트 생성
1. https://supabase.com 접속
2. 새 프로젝트 생성
3. 프로젝트 URL과 anon key 복사

### 2. Storage Bucket 생성
1. Supabase 대시보드 → Storage
2. "Create a new bucket" 클릭
3. Bucket 이름: `paire-images`
4. Public bucket: ✅ 체크 (공개 접근 허용)
5. Create bucket

### 3. 정책 설정 (선택사항)
Storage → Policies에서 업로드/삭제 정책 설정:

```sql
-- 업로드 허용 (인증된 사용자)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'paire-images');

-- 공개 읽기 허용
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'paire-images');
```

---

## Railway Cron Job 설정

### 방법 1: Railway Cron (권장)

Railway는 자동으로 `@nestjs/schedule`의 Cron을 실행합니다.
추가 설정 불필요!

### 방법 2: 외부 Cron 서비스

만약 Railway Cron이 작동하지 않으면:

1. **Cron-job.org** 사용
   - https://cron-job.org 가입
   - 새 Cron Job 생성
   - URL: `https://your-backend.railway.app/api/subscription/auto-renew`
   - 스케줄: 매일 00:00 (KST)

2. **백엔드에 엔드포인트 추가** (선택사항)
```typescript
// subscription.controller.ts
@Post('auto-renew')
async triggerAutoRenewal(@Headers('x-cron-secret') secret: string) {
  if (secret !== process.env.CRON_SECRET) {
    throw new UnauthorizedException();
  }
  return this.subscriptionService.processAutoRenewal();
}
```

환경 변수 추가:
```bash
CRON_SECRET=your-secret-key-for-cron
```

---

## 배포 순서

### 1. 백엔드 배포 (Railway)

```bash
cd backend

# 의존성 설치
npm install

# 빌드 테스트
npm run build

# Prisma 마이그레이션
npx prisma migrate deploy

# Seed 데이터 (선택사항)
npx prisma db seed

# Git push (Railway 자동 배포)
git add .
git commit -m "Deploy backend"
git push
```

### 2. 프론트엔드 배포 (Vercel)

```bash
cd ..

# 의존성 설치
npm install

# 빌드 테스트
npm run build

# Vercel 배포
vercel --prod
```

---

## 배포 후 체크리스트

### 백엔드
- [ ] 데이터베이스 연결 확인
- [ ] API 엔드포인트 테스트
- [ ] Seed 데이터 확인
- [ ] Cron Job 로그 확인
- [ ] Supabase 이미지 업로드 테스트
- [ ] Vision API 작동 확인

### 프론트엔드
- [ ] 회원가입/로그인 테스트
- [ ] 추천 생성 테스트
- [ ] 이미지 업로드 테스트
- [ ] 구독 결제 테스트
- [ ] 공유 기능 테스트
- [ ] 모바일 반응형 확인

### 보안
- [ ] CORS 설정 확인 (프로덕션 도메인만 허용)
- [ ] JWT Secret 강력한 키로 변경
- [ ] Toss Payments 프로덕션 키로 변경
- [ ] 환경 변수 노출 확인

---

## 모니터링

### Railway 로그 확인
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 로그 확인
railway logs
```

### Cron Job 로그
```bash
# Scheduler 로그 필터링
railway logs | grep "SchedulerService"
```

### 에러 추적 (선택사항)
- Sentry 연동
- LogRocket 연동
- Google Analytics

---

## 트러블슈팅

### 이미지 업로드 실패
1. Supabase URL/Key 확인
2. Bucket 이름 확인 (`paire-images`)
3. Public bucket 설정 확인
4. Storage 정책 확인

### Cron Job 미작동
1. Railway 로그에서 "SchedulerService" 검색
2. 타임존 확인 (Asia/Seoul)
3. 외부 Cron 서비스 사용 고려

### Vision API 에러
1. API Key 확인
2. API 활성화 확인 (Google Cloud Console)
3. 할당량 확인

### 결제 실패
1. Toss Payments 키 확인 (테스트/프로덕션)
2. 콜백 URL 확인
3. Webhook 설정 확인

---

## 성능 최적화

### 이미지 최적화
- Next.js Image 컴포넌트 사용
- WebP 포맷 변환
- Lazy loading

### 캐싱
- Redis 추가 (선택사항)
- API 응답 캐싱
- CDN 사용 (Vercel 자동)

### 데이터베이스
- 인덱스 추가
- 쿼리 최적화
- Connection pooling

---

## 백업

### 데이터베이스 백업
```bash
# Railway에서 자동 백업 설정
# 또는 수동 백업
pg_dump $DATABASE_URL > backup.sql
```

### 이미지 백업
- Supabase Storage 자동 백업
- 또는 S3로 주기적 복사

---

## 비용 예상

### Railway (백엔드)
- Hobby Plan: $5/월
- Pro Plan: $20/월 (권장)

### Vercel (프론트엔드)
- Hobby: 무료
- Pro: $20/월

### Supabase (Storage)
- Free: 1GB
- Pro: $25/월 (50GB)

### Google Vision API
- 무료: 1,000 requests/월
- 유료: $1.50 / 1,000 requests

### Toss Payments
- 수수료: 3.3% (카드 결제)

**총 예상 비용**: 약 $30-50/월 (초기)

---

## 다음 단계

1. 도메인 연결
2. SSL 인증서 (자동)
3. SEO 최적화
4. 소셜 로그인 추가
5. 푸시 알림
6. 이메일 알림
7. 관리자 대시보드

---

## 지원

문제가 발생하면:
1. Railway/Vercel 로그 확인
2. GitHub Issues 생성
3. 이메일: support@paire.app
