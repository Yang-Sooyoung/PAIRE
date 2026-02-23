# PAIRÉ 앱스토어 배포 가이드 📱

## 개요

PAIRÉ를 **Capacitor**를 사용하여 네이티브 앱으로 변환하고 Apple App Store와 Google Play Store에 배포하는 가이드입니다.

---

## 1. 사전 준비

### 개발 환경

#### macOS (iOS 개발 필수)
```bash
# Xcode 설치 (App Store에서)
# Command Line Tools 설치
xcode-select --install

# CocoaPods 설치
sudo gem install cocoapods
```

#### Windows/macOS/Linux (Android 개발)
```bash
# Android Studio 설치
# https://developer.android.com/studio

# Java JDK 설치 (11 이상)
# https://www.oracle.com/java/technologies/downloads/
```

### 개발자 계정

#### Apple Developer
- 비용: $99/년
- 등록: https://developer.apple.com/
- 필요: Apple ID, 신용카드

#### Google Play Console
- 비용: $25 (1회)
- 등록: https://play.google.com/console/
- 필요: Google 계정, 신용카드

---

## 2. 프로젝트 빌드

### 2.1 Next.js 정적 빌드

```bash
# 의존성 설치
npm install

# 정적 빌드 (out 폴더 생성)
npm run build

# 빌드 확인
ls out/
```

### 2.2 Capacitor 동기화

```bash
# iOS 프로젝트 추가
npx cap add ios

# Android 프로젝트 추가
npx cap add android

# 웹 파일 동기화
npx cap sync
```

---

## 3. iOS 앱 빌드 (macOS 필수)

### 3.1 Xcode에서 프로젝트 열기

```bash
npx cap open ios
```

### 3.2 프로젝트 설정

1. **General 탭**
   - Display Name: `PAIRÉ`
   - Bundle Identifier: `com.paire.app`
   - Version: `1.0.0`
   - Build: `1`
   - Deployment Target: `iOS 13.0` 이상

2. **Signing & Capabilities**
   - Team: Apple Developer 계정 선택
   - Automatically manage signing: ✅ 체크
   - Provisioning Profile: 자동 생성

3. **Info.plist 설정**
   - Privacy - Camera Usage Description: "음식 사진을 촬영하기 위해 카메라 접근이 필요합니다"
   - Privacy - Photo Library Usage Description: "사진을 저장하기 위해 앨범 접근이 필요합니다"

### 3.3 아이콘 및 스플래시 스크린

#### 아이콘 생성
```bash
# 1024x1024 아이콘 준비
# Xcode → Assets.xcassets → AppIcon
# 각 크기별로 드래그 앤 드롭
```

**필요한 크기**:
- 20x20 (2x, 3x)
- 29x29 (2x, 3x)
- 40x40 (2x, 3x)
- 60x60 (2x, 3x)
- 76x76 (1x, 2x)
- 83.5x83.5 (2x)
- 1024x1024 (1x)

#### 스플래시 스크린
```bash
# ios/App/App/Assets.xcassets/Splash.imageset/
# splash.png, splash@2x.png, splash@3x.png
```

### 3.4 테스트

```bash
# 시뮬레이터에서 실행
# Xcode → Product → Run (⌘R)

# 실제 기기에서 테스트
# 기기 연결 → 상단에서 기기 선택 → Run
```

### 3.5 Archive 및 업로드

```bash
# 1. Archive 생성
# Xcode → Product → Archive

# 2. Organizer에서 Distribute App
# App Store Connect → Upload

# 3. App Store Connect에서 확인
# https://appstoreconnect.apple.com/
```

---

## 4. Android 앱 빌드

### 4.1 Android Studio에서 프로젝트 열기

```bash
npx cap open android
```

### 4.2 프로젝트 설정

1. **build.gradle (Module: app)**
   ```gradle
   android {
       namespace "com.paire.app"
       compileSdk 34
       
       defaultConfig {
           applicationId "com.paire.app"
           minSdk 22
           targetSdk 34
           versionCode 1
           versionName "1.0.0"
       }
   }
   ```

2. **AndroidManifest.xml**
   ```xml
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
   <uses-permission android:name="android.permission.INTERNET" />
   ```

### 4.3 아이콘 및 스플래시 스크린

#### 아이콘 생성
```bash
# Android Studio → res → New → Image Asset
# Icon Type: Launcher Icons
# Path: 1024x1024 아이콘 선택
```

**자동 생성되는 크기**:
- mipmap-mdpi (48x48)
- mipmap-hdpi (72x72)
- mipmap-xhdpi (96x96)
- mipmap-xxhdpi (144x144)
- mipmap-xxxhdpi (192x192)

#### 스플래시 스크린
```bash
# android/app/src/main/res/drawable/splash.png
# 다양한 해상도 준비
```

### 4.4 서명 키 생성

```bash
# 키스토어 생성
keytool -genkey -v -keystore paire-release-key.keystore -alias paire -keyalg RSA -keysize 2048 -validity 10000

# 정보 입력
# 비밀번호: 안전하게 보관!
# 이름, 조직, 위치 등 입력
```

### 4.5 서명 설정

**android/app/build.gradle**:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('paire-release-key.keystore')
            storePassword 'your-password'
            keyAlias 'paire'
            keyPassword 'your-password'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 4.6 APK/AAB 빌드

```bash
# AAB 빌드 (Play Store 업로드용)
cd android
./gradlew bundleRelease

# 생성 위치
# android/app/build/outputs/bundle/release/app-release.aab

# APK 빌드 (직접 배포용)
./gradlew assembleRelease

# 생성 위치
# android/app/build/outputs/apk/release/app-release.apk
```

### 4.7 Play Console 업로드

1. https://play.google.com/console/ 접속
2. 앱 만들기
3. 앱 세부정보 입력
4. 프로덕션 → 새 버전 만들기
5. AAB 파일 업로드
6. 검토 제출

---

## 5. 앱스토어 등록 정보

### 공통 정보

#### 앱 이름
- **한국어**: PAIRÉ - AI 음료 추천
- **영어**: PAIRÉ - AI Drink Pairing

#### 설명 (짧은)
- **한국어**: 음식과 완벽하게 어울리는 음료를 AI가 추천해드립니다
- **영어**: AI-powered drink recommendations for your perfect meal pairing

#### 설명 (긴)
```
음식 사진을 찍으면 AI가 완벽한 음료를 추천해드립니다.

주요 기능:
• AI 기반 음식 인식
• 상황별 맞춤 추천
• 다양한 음료 데이터베이스
• 추천 히스토리 저장
• 즐겨찾기 기능

프리미엄 혜택:
• 무제한 추천
• 추천 히스토리 무제한 저장
• 즐겨찾기 기능
• 우선 고객 지원

PAIRÉ와 함께 특별한 식사를 더욱 특별하게 만들어보세요!
```

#### 카테고리
- **주 카테고리**: Food & Drink
- **부 카테고리**: Lifestyle

#### 키워드
```
음료, 와인, 페어링, AI, 추천, 음식, 레스토랑, 소믈리에, 칵테일, 맥주
drink, wine, pairing, AI, recommendation, food, restaurant, sommelier, cocktail, beer
```

#### 연령 등급
- **4+** (모든 연령)

### 스크린샷

#### iOS (필수)
- 6.7" (iPhone 14 Pro Max): 1290 x 2796
- 5.5" (iPhone 8 Plus): 1242 x 2208

#### Android (필수)
- Phone: 1080 x 1920 (최소 2개)
- Tablet: 1920 x 1080 (선택)

**스크린샷 내용**:
1. 홈 화면
2. 음식 촬영 화면
3. 추천 결과 화면
4. 음료 상세 화면
5. 프리미엄 기능 화면

### 개인정보 처리방침

**필수!** 웹사이트에 게시 필요:
```
https://paire.app/privacy-policy
```

**내용**:
- 수집하는 정보
- 사용 목적
- 제3자 제공
- 보관 기간
- 사용자 권리

---

## 6. 심사 준비

### Apple App Store

#### 심사 정보
- **데모 계정**: 테스트용 계정 제공
- **연락처**: 긴급 연락 가능한 전화번호
- **메모**: 특별한 기능 설명

#### 심사 기간
- 평균: 1-3일
- 최대: 1주일

#### 거절 사유 (주의)
- 버그 또는 크래시
- 개인정보 처리방침 누락
- 스크린샷 불일치
- 결제 기능 문제
- 콘텐츠 가이드라인 위반

### Google Play Store

#### 심사 정보
- **콘텐츠 등급**: 설문 작성
- **타겟 연령**: 모든 연령
- **광고**: 없음 (또는 있음)

#### 심사 기간
- 평균: 수 시간 ~ 1일
- 최대: 3일

#### 거절 사유 (주의)
- 권한 남용
- 개인정보 처리방침 누락
- 콘텐츠 정책 위반
- 메타데이터 불일치

---

## 7. 업데이트 프로세스

### 코드 수정 후

```bash
# 1. Next.js 빌드
npm run build

# 2. Capacitor 동기화
npx cap sync

# 3. 버전 업데이트
# iOS: Xcode → General → Version/Build
# Android: build.gradle → versionCode/versionName

# 4. 빌드 및 업로드
# iOS: Archive → Upload
# Android: bundleRelease → Upload
```

### 버전 관리

```
Major.Minor.Patch (Build)
1.0.0 (1) → 첫 출시
1.0.1 (2) → 버그 수정
1.1.0 (3) → 새 기능
2.0.0 (4) → 대규모 변경
```

---

## 8. 비용 요약

### 개발자 계정
- Apple Developer: $99/년
- Google Play Console: $25 (1회)

### 개발 비용
- Capacitor: 무료 ✅
- 아이콘/스크린샷: $0-100
- 개인정보 처리방침: $0-50

### 유지보수
- 서버 비용: $30-50/월
- 업데이트: 무료 (직접)

**총 초기 비용**: ~$150-300
**연간 비용**: ~$500-1,000

---

## 9. 체크리스트

### 개발
- [x] Capacitor 설정
- [ ] iOS 프로젝트 생성
- [ ] Android 프로젝트 생성
- [ ] 아이콘 생성 (1024x1024)
- [ ] 스플래시 스크린 생성
- [ ] 권한 설정
- [ ] 테스트 (시뮬레이터)
- [ ] 테스트 (실제 기기)

### 앱스토어
- [ ] Apple Developer 계정
- [ ] Google Play Console 계정
- [ ] 개인정보 처리방침 작성
- [ ] 스크린샷 촬영 (5개)
- [ ] 앱 설명 작성
- [ ] 키워드 선정
- [ ] 데모 계정 준비

### 빌드
- [ ] iOS Archive
- [ ] Android AAB
- [ ] 서명 키 생성
- [ ] 버전 관리

### 제출
- [ ] App Store Connect 업로드
- [ ] Play Console 업로드
- [ ] 심사 정보 입력
- [ ] 검토 제출

---

## 10. 트러블슈팅

### iOS 빌드 실패
```bash
# CocoaPods 업데이트
cd ios/App
pod install --repo-update

# 캐시 삭제
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### Android 빌드 실패
```bash
# Gradle 캐시 삭제
cd android
./gradlew clean

# 의존성 재설치
./gradlew --refresh-dependencies
```

### 서명 오류
- 키스토어 비밀번호 확인
- 키 별칭 확인
- 유효기간 확인

---

## 11. 참고 자료

- [Capacitor 공식 문서](https://capacitorjs.com/docs)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Design Guidelines](https://developer.android.com/design)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)

---

## 12. 다음 단계

1. **아이콘 생성** (1024x1024)
2. **스크린샷 촬영** (5개)
3. **개인정보 처리방침 작성**
4. **개발자 계정 등록**
5. **iOS 빌드 및 테스트**
6. **Android 빌드 및 테스트**
7. **앱스토어 제출**

---

**예상 소요 시간**: 1-2주
**난이도**: 중급
**필요 기술**: Xcode, Android Studio 기본 지식

**준비되셨나요? 시작하세요!** 🚀
