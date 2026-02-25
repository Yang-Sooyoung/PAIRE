# AI 추천 시스템 설정 가이드

## 1. 패키지 설치

```bash
cd backend
npm install @google/generative-ai
```

## 2. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev --name add_ai_recommendation_cache
npx prisma generate
```

## 3. 환경변수 설정

Railway 백엔드 서비스에 다음 환경변수가 설정되어 있는지 확인:

- `GEMINI_API_KEY`: AIzaSyDkcmrfpakWuyXeaEejoLy9rEDlSSPipsQ

## 4. 배포

```bash
git add .
git commit -m "Add AI-powered recommendation system with Gemini"
git push
```

## 5. 작동 방식

1. **Vision API**: 음식 이미지 분석 → 키워드, 카테고리, 특징 추출
2. **Gemini AI**: 음식 분석 결과 + 음료 DB → 최적의 음료 3개 추천 + 상세 설명
3. **캐싱**: 비슷한 요청은 DB에서 즉시 반환 (성능 향상 + 비용 절감)

## 6. 특징

- ✅ Vision으로 음식 이미지 상세 분석
- ✅ Gemini로 AI 기반 음료 추천 및 페어링 설명
- ✅ 페어리 캐릭터의 친근한 추천 메시지
- ✅ 캐싱 시스템으로 빠른 응답 및 비용 절감
- ✅ AI 실패 시 기존 룰 기반 추천으로 폴백
