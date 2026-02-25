# Vercel로 백엔드 이전 가이드 (무료) 🆓

## ⚠️ 주의: 이 방법은 비추천

**Railway Hobby Plan ($5/월)을 강력히 추천합니다.**

이유:
- Vercel Serverless는 제약이 많음
- NestJS 구조 변경 필요
- 마이그레이션 시간 2-3일
- Cold start 문제
- 10초 타임아웃

**하지만 정말 무료로 하고 싶다면...**

---

## 📋 Vercel Serverless Functions 제약사항

### 1. 타임아웃
```
무료: 10초
Pro: 60초

→ Vision API + Gemini AI는 10초 초과 가능
→ 사용자 경험 나쁨
```

### 2. Cold Start
```
첫 요청: 3-5초 지연
→ 사용자 이탈 증가
```

### 3. 메모리
```
무료: 1GB
→ 이미지 처리 시 부족할 수 있음
```

### 4. 구조 변경
```
NestJS → Express/Next.js API Routes
→ 코드 대폭 수정 필요
```

---

## 🚀 마이그레이션 방법 (간단 버전)

### 1단계: API Routes로 변환

#### 기존 (NestJS)
```typescript
// backend/src/recommendation/recommendation.controller.ts
@Controller('api/recommendation')
export class RecommendationController {
  @Post('create')
  async createRecommendation(@Body() dto: any) {
    // ...
  }
}
```

#### 변환 후 (Next.js API Routes)
```typescript
// app/api/recommendation/create/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const dto = await request.json();
  // ... 로직 복사
  return NextResponse.json({ recommendation });
}
```

### 2단계: 서비스 로직 이동
```
backend/src/recommendation/recommendation.service.ts
→ lib/services/recommendation.service.ts
```

### 3단계: Prisma 설정
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 4단계: 환경 변수
```
Vercel Dashboard → Settings → Environment Variables
- DATABASE_URL
- JWT_SECRET
- SUPABASE_URL
- SUPABASE_KEY
- GEMINI_API_KEY
```

---

## 📁 새로운 프로젝트 구조

```
paire/
├── app/
│   ├── api/                    # API Routes (백엔드)
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── signup/route.ts
│   │   ├── recommendation/
│   │   │   ├── create/route.ts
│   │   │   └── history/route.ts
│   │   ├── subscription/
│   │   └── favorite/
│   ├── page.tsx                # 프론트엔드
│   └── ...
├── lib/
│   ├── services/               # 비즈니스 로직
│   │   ├── recommendation.service.ts
│   │   ├── auth.service.ts
│   │   └── ...
│   ├── prisma.ts
│   └── ...
├── prisma/
│   └── schema.prisma
└── package.json
```

---

## ⏱️ 예상 작업 시간

```
1. API Routes 변환: 4-6시간
2. 서비스 로직 이동: 2-3시간
3. 테스트: 2-3시간
4. 배포 및 디버깅: 2-3시간

총: 10-15시간 (2-3일)
```

---

## 💰 비용 비교

### Railway Hobby Plan
```
비용: $5/월
시간: 5분
안정성: ⭐⭐⭐⭐⭐
성능: ⭐⭐⭐⭐⭐
```

### Vercel 무료
```
비용: $0/월
시간: 10-15시간 (2-3일)
안정성: ⭐⭐⭐
성능: ⭐⭐⭐
```

### 시간 가치 계산
```
개발자 시급: 30,000원 (최소)
마이그레이션 시간: 15시간
시간 비용: 450,000원

Railway 1년 비용: 78,000원

→ Railway가 372,000원 저렴!
```

---

## 🎯 최종 결론

### Railway를 선택하세요!

**이유:**
1. **시간 절약** - 5분 vs 15시간
2. **안정성** - 프로덕션 준비 완료
3. **성능** - Cold start 없음
4. **비용 효율** - 시간 가치 고려 시 훨씬 저렴
5. **확장성** - 사용자 증가해도 OK

**무료에 집착하지 마세요!**
- 마이그레이션 시간에 마케팅하면 사용자 100명 확보 가능
- 쿠팡 파트너스로 첫 달에 Railway 비용 회수
- 시간은 돈보다 귀합니다

---

## 🚀 지금 바로 실행

### 1. Railway 업그레이드 (5분)
```bash
1. railway.app 접속
2. Billing → Upgrade to Hobby
3. 카드 등록 ($5/월)
4. 완료!
```

### 2. 마케팅 시작 (남은 시간)
```bash
1. 쿠팡 파트너스 가입
2. 인스타그램 계정 생성
3. 푸드 블로거 컨택
4. 강남 레스토랑 제휴
```

### 3. 첫 달 목표
```bash
- 사용자 1,000명
- 쿠팡 수익 60,000원
- Railway 비용 회수
- 순이익 53,500원
```

---

## 💡 현명한 선택

**"무료"는 가장 비싼 선택입니다.**

- 시간 낭비: 15시간
- 기회 비용: 450,000원
- 스트레스: 무한대
- 안정성: 낮음

**"$5/월"은 가장 저렴한 선택입니다.**

- 시간 절약: 15시간
- 기회 활용: 마케팅/개발
- 스트레스: 제로
- 안정성: 최고

**현명한 개발자는 시간을 삽니다!** 🚀
