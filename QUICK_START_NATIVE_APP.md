# PAIRÉ 네이티브 앱 빠른 시작 🚀

## 5분 안에 앱 실행하기

### 1. 빌드 (1분)

```bash
# Next.js 정적 빌드
npm run build

# Capacitor 동기화
npx cap sync
```

### 2. iOS 실행 (macOS만)

```bash
# Xcode 열기
npx cap open ios

# Xcode에서 ▶️ 버튼 클릭
# 시뮬레이터에서 앱 실행!
```

### 3. Android 실행

```bash
# Android Studio 열기
npx cap open android

# Run 버튼 클릭
# 에뮬레이터에서 앱 실행!
```

---

## 주요 명령어

```bash
# 웹 빌드
npm run build

# 동기화 (빌드 후 항상 실행)
npx cap sync

# iOS 열기
npx cap open ios

# Android 열기
npx cap open android

# 플러그인 추가
npm install @capacitor/[plugin-name]
npx cap sync
```

---

## 파일 구조

```
PAIRE/
├── capacitor.config.ts    # Capacitor 설정
├── next.config.mjs        # output: 'export' 설정
├── out/                   # 빌드 결과 (Capacitor가 사용)
├── ios/                   # iOS 프로젝트 (자동 생성)
│   └── App/
│       └── App.xcodeproj
└── android/               # Android 프로젝트 (자동 생성)
    └── app/
        └── build.gradle
```

---

## 개발 워크플로우

### 코드 수정 시

```bash
# 1. 코드 수정
# 2. 빌드
npm run build

# 3. 동기화
npx cap sync

# 4. 앱 새로고침 (Xcode/Android Studio에서 재실행)
```

### 라이브 리로드 (개발 중)

```bash
# 1. 개발 서버 실행
npm run dev

# 2. capacitor.config.ts 수정
server: {
  url: 'http://localhost:3000',
  cleartext: true
}

# 3. 동기화 및 실행
npx cap sync
npx cap open ios  # 또는 android
```

---

## 자주 사용하는 플러그인

### 이미 설치됨 ✅
- `@capacitor/camera` - 카메라
- `@capacitor/share` - 공유
- `@capacitor/splash-screen` - 스플래시
- `@capacitor/status-bar` - 상태바
- `@capacitor/app` - 앱 정보

### 추가 가능
```bash
# 푸시 알림
npm install @capacitor/push-notifications

# 로컬 알림
npm install @capacitor/local-notifications

# 파일 시스템
npm install @capacitor/filesystem

# 네트워크 상태
npm install @capacitor/network

# 동기화
npx cap sync
```

---

## 디버깅

### iOS (Safari)
1. Safari → 개발자 → 시뮬레이터 → localhost
2. 웹 인스펙터 사용

### Android (Chrome)
1. Chrome → `chrome://inspect`
2. 기기 선택
3. DevTools 사용

---

## 문제 해결

### "out 폴더가 없습니다"
```bash
npm run build
```

### "iOS 프로젝트가 없습니다"
```bash
npx cap add ios
```

### "Android 프로젝트가 없습니다"
```bash
npx cap add android
```

### 빌드 오류
```bash
# 캐시 삭제
rm -rf out .next

# 재빌드
npm run build
npx cap sync
```

---

## 다음 단계

1. ✅ 로컬에서 앱 실행 완료
2. 📱 실제 기기에서 테스트
3. 🎨 아이콘 및 스플래시 스크린 추가
4. 📝 앱스토어 등록 정보 준비
5. 🚀 앱스토어 제출

**자세한 내용**: `APP_STORE_DEPLOYMENT_GUIDE.md` 참고

---

## 도움말

- Capacitor 문서: https://capacitorjs.com/docs
- 커뮤니티: https://ionic.io/community
- GitHub: https://github.com/ionic-team/capacitor

**행운을 빕니다!** 🍀
