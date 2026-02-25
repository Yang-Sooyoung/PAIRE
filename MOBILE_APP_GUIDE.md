# PAIRÉ 모바일 앱 가이드

## Capacitor 설정 완료 ✅

iOS와 Android 플랫폼이 추가되었습니다!

## 빌드 및 실행

### 1. 웹 빌드 및 동기화

```bash
# Next.js 빌드 + Capacitor 동기화
npm run mobile:build

# 또는 개별 실행
npm run build
npx cap sync
```

### 2. iOS 앱 실행

```bash
# Xcode 열기
npm run mobile:ios

# 또는
npx cap open ios
```

**Xcode에서**:
1. Signing & Capabilities에서 Team 선택
2. Bundle Identifier 변경 (com.paire.app)
3. 시뮬레이터 또는 실제 기기 선택
4. Run 버튼 클릭

### 3. Android 앱 실행

```bash
# Android Studio 열기
npm run mobile:android

# 또는
npx cap open android
```

**Android Studio에서**:
1. Gradle 동기화 완료 대기
2. 에뮬레이터 또는 실제 기기 선택
3. Run 버튼 클릭

## 개발 워크플로우

### 코드 변경 후

```bash
# 1. Next.js 빌드
npm run build

# 2. Capacitor 동기화
npx cap sync

# 3. 앱 재실행 (Xcode/Android Studio에서)
```

### 빠른 개발 (웹뷰만 업데이트)

```bash
# 웹 빌드만
npm run build

# 특정 플랫폼만 동기화
npx cap copy ios
npx cap copy android
```

## 주요 기능 확인

### 1. 국가 감지
- Capacitor Device 플러그인으로 자동 감지
- 브라우저 콘솔에서 "Detected country" 로그 확인

### 2. 외부 링크 (쇼핑)
- Capacitor Browser로 인앱 브라우저 열림
- 쿠팡, Amazon, Vivino 링크 테스트

### 3. 카메라 (음식 촬영)
- Capacitor Camera 플러그인 사용
- iOS: Info.plist에 권한 추가 필요
- Android: AndroidManifest.xml에 권한 추가 필요

## 권한 설정

### iOS (ios/App/App/Info.plist)

```xml
<key>NSCameraUsageDescription</key>
<string>음식 사진을 촬영하여 와인 추천을 받습니다</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>갤러리에서 음식 사진을 선택합니다</string>
```

### Android (android/app/src/main/AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET" />
```

## 앱 아이콘 및 스플래시 스크린

### 아이콘 생성

1. 1024x1024 PNG 이미지 준비
2. https://icon.kitchen 또는 https://appicon.co 사용
3. 생성된 파일을 각 플랫폼 폴더에 복사

**iOS**: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
**Android**: `android/app/src/main/res/`

### 스플래시 스크린

`capacitor.config.ts`에서 설정:

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    backgroundColor: "#1a1a1a",
    showSpinner: false,
  },
}
```

## 배포

### iOS (App Store)

1. Xcode에서 Archive 생성
2. Product → Archive
3. Distribute App → App Store Connect
4. App Store Connect에서 앱 정보 입력
5. 심사 제출

### Android (Google Play)

1. Android Studio에서 APK/AAB 생성
2. Build → Generate Signed Bundle / APK
3. Keystore 생성 (처음만)
4. Release 빌드 생성
5. Google Play Console에서 업로드

## 문제 해결

### iOS 빌드 실패
- Xcode 버전 확인 (최신 버전 권장)
- CocoaPods 업데이트: `cd ios/App && pod install`
- Clean Build: Xcode → Product → Clean Build Folder

### Android 빌드 실패
- Gradle 버전 확인
- Android Studio에서 Invalidate Caches / Restart
- `android/gradle.properties` 확인

### 웹뷰가 비어있음
- `npm run build` 실행했는지 확인
- `out` 폴더가 생성되었는지 확인
- `npx cap sync` 실행

### API 호출 실패
- CORS 설정 확인 (백엔드)
- HTTPS 사용 확인
- 네트워크 권한 확인 (Android)

## 유용한 명령어

```bash
# 플랫폼 추가
npx cap add ios
npx cap add android

# 플랫폼 제거
npx cap remove ios
npx cap remove android

# 플러그인 목록
npx cap ls

# Capacitor 업데이트
npm install @capacitor/core@latest @capacitor/cli@latest
npx cap sync
```

## 참고 자료

- Capacitor 공식 문서: https://capacitorjs.com/docs
- iOS 개발 가이드: https://developer.apple.com/ios/
- Android 개발 가이드: https://developer.android.com/
