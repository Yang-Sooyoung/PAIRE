# PAIRÉ 확장 계획 및 우선순위 📋

## 📊 현재 상태 분석

### ✅ 완성된 핵심 기능 (90%)
- 인증 시스템 (로그인/회원가입/OAuth)
- AI 음료 추천 (Vision API + Gemini)
- 구독 시스템 (Toss Payments)
- 크레딧 시스템
- 즐겨찾기
- 추천 히스토리
- 스티커 시스템 (백엔드만)
- 다국어 지원

### ⚠️ 미완성/개선 필요
- 이미지 업로드 (현재 base64만)
- 스티커 UI (백엔드만 구현)
- 소셜 기능 (없음)
- 위치 기반 기능 (없음)

---

## 🎯 우선순위별 구현 계획

### 🔴 P0 - 즉시 수정 필요 (1-2일)

#### 1. ✅ 이미지 업로드 시스템 완성 (완료!)
**현재 문제**: ~~base64로만 처리, 서버 저장 안 됨~~
**해결책**: Supabase Storage 연동 완료

**구현 위치**:
- `backend/src/storage/storage.service.ts` ✅
- `backend/src/recommendation/recommendation.service.ts` ✅

**완료 시간**: 2-3시간

---

#### 2. ✅ 스티커 UI (완료!)
**현재 상태**: 백엔드 완성, 프론트 완성
**기능**:
- 스티커 수집 페이지 (`/stickers`) ✅
- 달성 조건 표시 ✅
- 잠금/해제 상태 ✅
- 애니메이션 효과 ✅
- 자동 해제 로직 ✅

**스티커 종류** (백엔드 구현 완료):
- 🎉 첫 추천 (first-recommendation)
- 🍷 와인 러버 (wine-lover) - 와인 추천 5회
- 🌙 야행성 (night-owl) - 밤 11시 이후 추천
- 🔥 열정적 (week-warrior) - 7일 연속 추천
- 💎 프리미엄 (premium-member) - 구독 시작
- 🎯 완벽주의자 (collector) - 즐겨찾기 10개
- 🗺️ 탐험가 (explorer) - 5가지 음료 타입
- 🦋 소셜 버터플라이 (social-butterfly) - 친구 모임 10회

**완료 시간**: 4-5시간

---

### 🟠 P1 - 단기 개선 (3-5일)

#### 3. 프로필 시스템
**목적**: 사용자 개성 표현, 소셜 기능 준비

**기능**:
- 프로필 이미지 업로드
- 닉네임 수정
- 자기소개 (bio)
- 선호 음료 타입 표시
- 수집한 스티커 표시
- 통계 (총 추천 횟수, 즐겨찾기 수)

**DB 스키마 추가**:
```prisma
model User {
  // 기존 필드...
  profileImage String?
  bio          String?
  favoriteTypes String[] // wine, whiskey, cocktail
  
  // 통계
  totalRecommendations Int @default(0)
  totalFavorites      Int @default(0)
}
```

**페이지**:
- `/profile` - 내 프로필 (수정 가능)
- `/profile/[userId]` - 다른 사용자 프로필 (읽기 전용)

**예상 시간**: 6-8시간

---

#### 4. 공유 기능 강화
**현재**: 기본 웹 공유만 있음
**추가**:
- 카카오톡 공유 (Kakao SDK)
- 인스타그램 스토리 공유
- 이미지로 저장 (html2canvas)
- 공유 시 추천 코드 포함 (바이럴)

**공유 이미지 디자인**:
```
┌─────────────────────┐
│  [음식 사진]         │
│                     │
│  PAIRÉ가 추천하는   │
│  🍷 [음료 이름]     │
│                     │
│  "페어리의 한마디"   │
│                     │
│  paire.app          │
└─────────────────────┘
```

**예상 시간**: 4-6시간

---

### 🟡 P2 - 중기 확장 (1-2주)

#### 5. 디저트 추천 (To Be Continued) 🍰
**목적**: 식사 후 달콤한 마무리 제안

**컨셉**: "완벽한 식사의 마침표"
```
사용자 플로우:
1. 디저트 사진 촬영 또는 선택
2. 분위기 선택 (로맨틱/캐주얼/혼자)
3. AI가 어울리는 음료 추천
   - 디저트 와인 (Moscato, Port, Ice Wine)
   - 커피 (에스프레소, 라떼, 콜드브루)
   - 차 (얼그레이, 루이보스, 허브티)
   - 리큐르 (Baileys, Amaretto, Kahlua)
```

**페이지 구조**:
```
/desserts
├── 디저트 카테고리 선택
│   ├── 케이크 🍰
│   ├── 초콜릿 🍫
│   ├── 과일 🍓
│   ├── 아이스크림 🍨
│   └── 기타 디저트
├── 사진 촬영/업로드
├── 분위기 선택
└── 추천 결과
    ├── 음료 3가지
    ├── 페어링 이유
    └── 구매 링크
```

**DB 스키마 추가**:
```prisma
model DessertRecommendation {
  id          String @id @default(cuid())
  userId      String?
  dessertType String // cake, chocolate, fruit, ice-cream
  imageUrl    String?
  mood        String // romantic, casual, solo
  drinks      Json   // 추천 음료 목록
  fairyMessage String
  createdAt   DateTime @default(now())
}
```

**특별 기능**:
- 디저트 카페 위치 안내
- 디저트 + 음료 세트 할인 정보
- 홈 베이킹 레시피 연동

**예상 시간**: 8-10시간

---

#### 6. 소셜 기능 (선택적 - 신중하게)
**고민 포인트**: PAIRÉ는 "개인의 순간"에 집중하는 서비스
- 친구 추가가 필요한가?
- 아니면 "공유"만으로 충분한가?

**제안: 가벼운 소셜 (추천)**
```
❌ 친구 시스템 (복잡함)
✅ 팔로우 시스템 (간단함)
✅ 공개 프로필
✅ 추천 공유 피드 (선택적)
```

**구현 범위**:
- 사용자 검색
- 팔로우/언팔로우
- 공개 프로필 보기
- 공유된 추천 보기 (피드)

**DB 스키마**:
```prisma
model Follow {
  id         String @id @default(cuid())
  followerId String
  followingId String
  follower   User @relation("Follower", fields: [followerId], references: [id])
  following  User @relation("Following", fields: [followingId], references: [id])
  createdAt  DateTime @default(now())
  
  @@unique([followerId, followingId])
}

model Recommendation {
  // 기존 필드...
  isPublic Boolean @default(false) // 공개 여부
  likes    Int @default(0)
  views    Int @default(0)
}
```

**예상 시간**: 10-12시간

---

#### 7. 위치 기반 기능 (맛집 연동)
**목적**: 추천 음료를 살 수 있는 곳 안내

**기능**:
- 근처 와인샵/주류 매장 표시
- 음료 구매 가능한 레스토랑
- 지도에 마커 표시
- 거리 계산

**구현**:
```typescript
// 카카오맵 API 사용
- 현재 위치 가져오기
- 주변 주류 매장 검색
- 지도에 표시
- 길찾기 연동
```

**DB 스키마**:
```prisma
model Store {
  id        String @id @default(cuid())
  name      String
  address   String
  lat       Float
  lng       Float
  type      String // wine-shop, restaurant, bar
  phone     String?
  hours     String?
  
  // 취급 음료
  drinkTypes String[] // wine, whiskey, cocktail
  
  createdAt DateTime @default(now())
}
```

**페이지**:
- `/stores` - 주변 매장 목록
- `/stores/[id]` - 매장 상세
- 추천 결과에 "구매처 찾기" 버튼

**예상 시간**: 8-10시간

---

### 🟢 P3 - 장기 확장 (2-4주)

#### 8. 커뮤니티 기능 (선택적)
**고민**: PAIRÉ의 정체성과 맞는가?

**제안: 최소한의 커뮤니티**
```
❌ 게시판 (너무 복잡)
❌ 댓글 시스템 (관리 부담)
✅ 추천 리액션 (좋아요만)
✅ 북마크 (나중에 보기)
```

**구현 (최소)**:
```prisma
model RecommendationLike {
  id              String @id @default(cuid())
  userId          String
  recommendationId String
  createdAt       DateTime @default(now())
  
  @@unique([userId, recommendationId])
}
```

**예상 시간**: 6-8시간

---

#### 9. 고급 추천 기능
**현재**: 기본 추천만
**추가**:
- 추천 이유 상세 설명
- 대체 음료 제안
- 가격대별 필터
- 재고 확인 (쿠팡 API)
- 리뷰 연동

**예상 시간**: 12-15시간

---

## 🎨 PAIRÉ 서비스 방향성 제안

### 현재 정체성
```
"테이블 위의 요정 소믈리에"
- 개인적이고 친밀한 경험
- 우아하고 절제된 분위기
- 지식이 아닌 감성
```

### 확장 방향 제안

#### ✅ 추천: 개인 중심 유지
```
1. 프로필 시스템 (개인 취향 기록)
2. 스티커 수집 (개인 성취)
3. 가벼운 공유 (선택적)
4. 위치 기반 (실용적)
```

#### ⚠️ 신중: 소셜 기능
```
- 팔로우는 OK (가벼움)
- 댓글/게시판은 NO (분위기 해침)
- 좋아요만 OK (간단함)
```

#### ❌ 비추천: 커뮤니티 중심
```
- 게시판
- 채팅
- 그룹
- 이벤트
→ PAIRÉ의 정체성과 맞지 않음
```

---

## 📅 4주 로드맵

### Week 1: 기본 완성
- [ ] 이미지 업로드 시스템
- [ ] 스티커 UI
- [ ] 프로필 기본 기능

### Week 2: 소셜 준비
- [ ] 프로필 완성
- [ ] 공유 기능 강화
- [ ] 공개 프로필

### Week 3: 확장 기능
- [ ] 팔로우 시스템 (선택)
- [ ] 위치 기반 기능
- [ ] 추천 피드 (선택)

### Week 4: 고도화
- [ ] 성능 최적화
- [ ] SEO 개선
- [ ] 분석 도구 추가
- [ ] 버그 수정

---

## 💡 최종 제안

### 즉시 구현 (필수) ✅
1. ✅ 이미지 업로드 (완료!)
2. ✅ 스티커 UI (완료!)
3. ✅ 프로필 시스템 (기본 완료)

### 단기 구현 (1-2주)
4. 🍰 디저트 추천 (To Be Continued)
5. ⚠️ 공유 기능 강화 (카카오톡 SDK)

### 선택적 구현 (서비스 방향에 따라)
6. ⚠️ 가벼운 소셜 (팔로우만)
7. ⚠️ 위치 기반 (실용적)
8. ❌ 커뮤니티 (비추천)

### PAIRÉ는 이대로도 충분합니다
현재 90% 완성도로 **핵심 가치는 모두 구현**되었어요:
- ✅ AI 추천
- ✅ 구독 시스템
- ✅ 즐겨찾기
- ✅ 히스토리

**추가 기능은 "있으면 좋은" 수준**이지 필수는 아닙니다.

---

## 🎯 결론

### 최소 MVP (현재 상태) ✅
```
현재 기능 완료!
→ 즉시 출시 가능
```

### 권장 버전 (2주 추가)
```
MVP + 디저트 추천 + 공유 강화 + 위치 기능
→ 완성도 높은 서비스
```

### 풀 버전 (4주 추가)
```
권장 + 가벼운 소셜 + 고급 추천
→ 장기 운영 가능
```

**제 제안: 디저트 추천 추가하고 바로 출시하세요!**
소셜 기능은 사용자 반응 보고 결정해도 늦지 않아요.
