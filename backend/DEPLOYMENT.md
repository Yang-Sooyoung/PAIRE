# PAIRÉ Backend 배포 가이드

## 옵션 1: Supabase (추천 - 무료)

### 1. Supabase 프로젝트 생성
1. https://supabase.com 접속 및 회원가입
2. "New Project" 클릭
3. 프로젝트 이름: `paire`
4. Database Password 설정 (저장해두기!)
5. Region: Northeast Asia (Seoul) 선택
6. "Create new project" 클릭

### 2. 연결 정보 가져오기
1. 프로젝트 대시보드 → Settings → Database
2. "Connection string" 섹션에서 "URI" 복사
3. `[YOUR-PASSWORD]`를 실제 비밀번호로 변경

예시:
```
postgresql://postgres.xxxxx:YOUR-PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

### 3. 환경 변수 업데이트

**로컬 (.env)**
```env
DATABASE_URL="postgresql://postgres.xxxxx:YOUR-PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"
```

**Vercel (프론트엔드)**
```bash
vercel env add DATABASE_URL
# 위의 연결 문자열 입력
```

### 4. 마이그레이션 실행
```bash
cd backend
npx prisma migrate deploy
```

---

## 옵션 2: Vercel Postgres

### 1. Vercel Postgres 생성
```bash
cd PAIRE
vercel postgres create
```

또는 Vercel 대시보드:
1. https://vercel.com/dashboard
2. 프로젝트 선택 → Storage → Create Database → Postgres
3. 데이터베이스 이름 입력 후 생성

### 2. 환경 변수 자동 설정
Vercel이 자동으로 다음 환경 변수를 설정합니다:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

### 3. .env 업데이트
```env
DATABASE_URL="${POSTGRES_PRISMA_URL}"
```

### 4. 마이그레이션
```bash
cd backend
npx prisma migrate deploy
```

---

## 옵션 3: Railway (무료 티어)

### 1. Railway 프로젝트 생성
1. https://railway.app 접속
2. "Start a New Project" → "Provision PostgreSQL"
3. 프로젝트 이름: `paire-db`

### 2. 연결 정보
1. PostgreSQL 서비스 클릭
2. "Connect" 탭에서 "Postgres Connection URL" 복사

### 3. 환경 변수 설정
```env
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:7432/railway"
```

---

## 옵션 4: Neon (무료, Serverless)

### 1. Neon 프로젝트 생성
1. https://neon.tech 접속
2. "Create a project" 클릭
3. 프로젝트 이름: `paire`
4. Region: AWS Asia Pacific (Seoul) 선택

### 2. 연결 문자열 복사
대시보드에서 "Connection string" 복사

### 3. 환경 변수 설정
```env
DATABASE_URL="postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

---

## 백엔드 API 배포

백엔드는 Vercel이 아닌 다른 곳에 배포해야 합니다.

### 옵션 A: Railway (추천)

```bash
# Railway CLI 설치
npm i -g @railway/cli

# 로그인
railway login

# 프로젝트 초기화
cd backend
railway init

# 배포
railway up
```

### 옵션 B: Render

1. https://render.com 접속
2. "New +" → "Web Service"
3. GitHub 저장소 연결
4. Root Directory: `backend`
5. Build Command: `npm install && npx prisma generate && npm run build`
6. Start Command: `npm run start:prod`
7. 환경 변수 추가:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `TOSS_SECRET_KEY`
   - `GOOGLE_APPLICATION_CREDENTIALS` (service-account-key.json 내용)

### 옵션 C: Fly.io

```bash
# Fly CLI 설치
curl -L https://fly.io/install.sh | sh

# 로그인
fly auth login

# 앱 생성
cd backend
fly launch

# 환경 변수 설정
fly secrets set DATABASE_URL="your-database-url"
fly secrets set JWT_SECRET="your-jwt-secret"

# 배포
fly deploy
```

---

## 프론트엔드 환경 변수 업데이트

배포 후 프론트엔드의 API URL을 업데이트하세요.

**Vercel 환경 변수**
```bash
vercel env add NEXT_PUBLIC_API_URL
# 값: https://your-backend-url.railway.app/api
```

또는 Vercel 대시보드:
1. 프로젝트 → Settings → Environment Variables
2. `NEXT_PUBLIC_API_URL` 추가
3. 값: 백엔드 배포 URL

---

## 추천 조합

**무료로 시작하기:**
- 데이터베이스: Supabase (500MB 무료)
- 백엔드: Railway (500시간/월 무료)
- 프론트엔드: Vercel (이미 배포됨)

**프로덕션:**
- 데이터베이스: Vercel Postgres 또는 Supabase Pro
- 백엔드: Railway Pro 또는 Render
- 프론트엔드: Vercel Pro

---

## 다음 단계

1. 데이터베이스 선택 및 생성
2. DATABASE_URL 환경 변수 설정
3. 마이그레이션 실행: `npx prisma migrate deploy`
4. 백엔드 배포 (Railway/Render/Fly.io)
5. 프론트엔드 환경 변수 업데이트
6. 프론트엔드 재배포: `vercel --prod`
