# PAIRÉ 배포 환경 변수 설정

## 백엔드 (Railway - backend 서비스)

Railway 대시보드 → backend 서비스 → Variables 탭

```env
# Database (Supabase)
DATABASE_URL=postgres://postgres.rmtazxdkvdymqciidmjj:w8cUcrju8sJiRfy9@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require

# JWT
JWT_SECRET=paire_jwt_secret_key_2026
JWT_EXPIRATION=3600
JWT_REFRESH_EXPIRATION=604800

# Toss Payments
TOSS_SECRET_KEY=test_sk_6BYq7GWPVvPnRO1ZqDEn8NE5vbo1
TOSS_CLIENT_KEY=test_ck_5OWRapdA8djmwZdJBOZAVo1zEqZK

# Supabase
SUPABASE_URL=https://rmtazxdkvdymqciidmjj.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtdGF6eGRrdmR5bXFjaWlkbWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MzgzODMsImV4cCI6MjA4NzQxNDM4M30.X1ZYn55ENtJaO-Q2eGO97XIGfggeeEGH6zV_UHpzhBg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtdGF6eGRrdmR5bXFjaWlkbWpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgzODM4MywiZXhwIjoyMDg3NDE0MzgzfQ.97ZU-XB-cjRdOQdnYrDloHs6pKGYOZJy9nltnqLOEpE

# Server
PORT=3001
NODE_ENV=production

# Frontend URL (프론트엔드 도메인으로 변경)
FRONTEND_URL=https://paire-front.up.railway.app
```

---

## 프론트엔드 (Railway - frontend 서비스)

Railway 대시보드 → frontend 서비스 → Variables 탭

```env
# Backend API URL (백엔드 도메인으로 변경)
NEXT_PUBLIC_API_URL=https://paire-back.up.railway.app/api

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://rmtazxdkvdymqciidmjj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtdGF6eGRrdmR5bXFjaWlkbWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MzgzODMsImV4cCI6MjA4NzQxNDM4M30.X1ZYn55ENtJaO-Q2eGO97XIGfggeeEGH6zV_UHpzhBg

# Toss Payments
NEXT_PUBLIC_TOSS_TEST_CLIENT_KEY=test_ck_5OWRapdA8djmwZdJBOZAVo1zEqZK
```

---

## 중요 사항

### 백엔드 도메인이 변경되면:
1. **백엔드** `FRONTEND_URL` 업데이트
2. **프론트엔드** `NEXT_PUBLIC_API_URL` 업데이트

### 프론트엔드 도메인이 변경되면:
1. **백엔드** `FRONTEND_URL` 업데이트

### 새 계정으로 배포 시:
1. Supabase 새로 생성 → 모든 `SUPABASE_*`, `DATABASE_URL` 변경
2. Toss Payments 새 키 발급 → `TOSS_*` 변경
3. Google Vision API 새 키 발급 → `service-account-key.json` 교체

---

## 배포 후 확인

### 백엔드 테스트:
```
https://paire-backend.up.railway.app/
→ {"status":"ok","message":"PAIRÉ Backend API is running"}
```

### 프론트엔드 테스트:
```
https://paire-front.up.railway.app/
→ 홈페이지 정상 표시
```

### API 연결 테스트:
프론트엔드에서 회원가입 시도 → CORS 에러 없이 정상 작동
