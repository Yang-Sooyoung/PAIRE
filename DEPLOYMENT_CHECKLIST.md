# 배포 오류 해결 체크리스트 ✅

## 🔍 배포 오류 확인 방법

### Railway 배포 로그 확인
```
1. Railway 대시보드 접속
2. 프로젝트 선택
3. Deployments 탭
4. 최신 배포 클릭
5. Logs 확인
```

---

## 🚨 흔한 배포 오류 & 해결 방법

### 1. 환경 변수 누락 ❌
```
Error: Missing environment variable
Error: DATABASE_URL is not defined
```

**해결:**
```
Railway Dashboard → Variables 탭에서 확인:

필수 환경 변수:
✅ DATABASE_URL
✅ POSTGRES_PRISMA_URL
✅ POSTGRES_URL_NON_POOLING
✅ JWT_SECRET
✅ JWT_EXPIRATION
✅ JWT_REFRESH_EXPIRATION
✅ SUPABASE_URL
✅ SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ GOOGLE_VISION_API_KEY (선택)
✅ OPENAI_API_KEY (선택)
✅ TOSS_SECRET_KEY
✅ TOSS_CLIENT_KEY
✅ FRONTEND_URL
✅ PORT (3001)
✅ NODE_ENV (production)
```

### 2. Prisma 마이그레이션 실패 ❌
```
Error: P1001: Can't reach database server
Error: Migration failed
```

**해결:**
```bash
# Railway에서 자동으로 실행되지만, 수동 실행 필요 시:
npx prisma migrate deploy

# 또는 Railway 대시보드에서:
Settings → Deploy Trigger → Redeploy
```

### 3. 빌드 타임아웃 ❌
```
Error: Build timed out
```

**해결:**
```json
// backend/railway.json 수정
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npx prisma generate && npm run build"
  }
}

// npm ci는 npm install보다 빠름
```

### 4. 메모리 부족 ❌
```
Error: JavaScript heap out of memory
```

**해결:**
```json
// backend/package.json 수정
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' nest build"
  }
}
```

### 5. 포트 충돌 ❌
```
Error: Port 3001 is already in use
```

**해결:**
```typescript
// backend/src/main.ts 확인
const port = process.env.PORT || 3001;
await app.listen(port, '0.0.0.0');

// Railway Variables에서 PORT 설정 확인
```

### 6. CORS 오류 ❌
```
Error: CORS policy blocked
```

**해결:**
```typescript
// backend/src/main.ts
app.enableCors({
  origin: [
    'https://paire-front.up.railway.app',
    'https://paire.vercel.app',
    'http://localhost:3000',
  ],
  credentials: true,
});
```

### 7. Supabase 연결 실패 ❌
```
Error: Supabase client initialization failed
```

**해결:**
```
Railway Variables 확인:
- SUPABASE_URL: https://xxx.supabase.co
- SUPABASE_ANON_KEY: eyJhbGc...
- SUPABASE_SERVICE_ROLE_KEY: eyJhbGc...

주의: 키에 공백이나 줄바꿈 없어야 함
```

### 8. JWT 토큰 오류 ❌
```
Error: jwt malformed
Error: jwt expired
```

**해결:**
```
Railway Variables 확인:
- JWT_SECRET: 최소 32자 이상
- JWT_EXPIRATION: 86400s (24시간)
- JWT_REFRESH_EXPIRATION: 2592000s (30일)

주의: 's' 접미사 필수!
```

---

## ✅ 배포 전 체크리스트

### 백엔드 (Railway)
- [ ] 모든 환경 변수 설정 완료
- [ ] DATABASE_URL 연결 테스트
- [ ] Prisma 스키마 최신 상태
- [ ] 빌드 스크립트 확인
- [ ] 포트 설정 확인 (3001)
- [ ] CORS 설정 확인
- [ ] JWT_EXPIRATION에 's' 접미사 확인

### 프론트엔드 (Vercel)
- [ ] NEXT_PUBLIC_API_URL 설정
- [ ] NEXT_PUBLIC_TOSS_TEST_CLIENT_KEY 설정
- [ ] NEXT_PUBLIC_COUPANG_PARTNER_ID 설정 (선택)
- [ ] 빌드 테스트 완료 (npm run build)
- [ ] 환경 변수 프로덕션 설정

---

## 🔧 수정된 파일

### 1. backend/railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**변경 사항:**
- ❌ 제거: `&& npx prisma db push` (빌드 시 실행하면 안 됨)
- ✅ 유지: `npm run start:prod`에서 `prisma migrate deploy` 실행

### 2. backend/package.json
```json
{
  "scripts": {
    "start:prod": "npx prisma migrate deploy && node dist/main"
  }
}
```

**이미 올바르게 설정됨!**

---

## 🚀 배포 재시도

### Railway
```bash
1. Railway 대시보드 접속
2. 프로젝트 선택
3. Settings → Deploy Trigger
4. "Redeploy" 클릭
5. Logs 확인
```

### 로컬 테스트
```bash
# 백엔드
cd backend
npm install
npx prisma generate
npm run build
npm run start:prod

# 프론트엔드
cd ..
npm install
npm run build
npm run start
```

---

## 📊 배포 상태 확인

### 백엔드 헬스 체크
```bash
curl https://paire-back.up.railway.app/api
# 응답: "PAIRÉ Backend API is running"
```

### 프론트엔드 확인
```bash
curl https://paire-front.up.railway.app
# 응답: HTML 페이지
```

### 데이터베이스 연결 확인
```bash
# Railway 대시보드에서:
Database → Connect → Test Connection
```

---

## 🆘 여전히 오류 발생 시

### 1. Railway 로그 전체 복사
```
Deployments → 최신 배포 → Logs → 전체 복사
```

### 2. 오류 메시지 확인
```
특정 오류 메시지를 찾아서:
- "Error:"로 시작하는 줄
- "Failed"가 포함된 줄
- 빨간색으로 표시된 줄
```

### 3. 환경 변수 재확인
```
Variables 탭에서:
- 모든 변수 이름 철자 확인
- 값에 공백/줄바꿈 없는지 확인
- 따옴표 없이 입력했는지 확인
```

### 4. 데이터베이스 재시작
```
Database → Settings → Restart
```

### 5. 완전 재배포
```
Settings → Delete Deployment
Settings → Deploy Trigger → Redeploy
```

---

## 💡 프로 팁

### 1. 로컬에서 프로덕션 모드 테스트
```bash
# 백엔드
NODE_ENV=production npm run start:prod

# 프론트엔드
npm run build && npm run start
```

### 2. 환경 변수 검증 스크립트
```typescript
// backend/src/main.ts에 추가
async function bootstrap() {
  // 환경 변수 검증
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'SUPABASE_URL',
  ];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
  
  // ... 나머지 코드
}
```

### 3. 배포 전 자동 체크
```json
// package.json
{
  "scripts": {
    "predeploy": "npm run lint && npm run build && npm run test"
  }
}
```

---

## 📞 추가 도움이 필요하면

1. **Railway 로그 전체 복사해서 보내주세요**
2. **오류 메시지 스크린샷**
3. **어떤 단계에서 실패했는지**

그러면 정확한 해결 방법을 알려드릴게요! 🚀
