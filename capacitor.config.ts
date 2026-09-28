import { CapacitorConfig } from '@capacitor/cli';

const isLocal = process.env.CAP_LOCAL === 'true';

const config: CapacitorConfig = {
  appId: 'com.paire.app',
  appName: 'PAIRÉ',
  webDir: 'out',
  server: isLocal
    ? {
        // 로컬 개발: npm run dev 후 npx cap run android
        url: 'http://10.0.2.2:3000',
        cleartext: true,
        androidScheme: 'http',
      }
    : {
        // 프로덕션: Render 배포 URL 사용
        url: 'https://your-frontend-render-url.onrender.com',
        androidScheme: 'https',
        iosScheme: 'https',
      },
  plugins: {
    Browser: {
      presentationStyle: 'popover',
    },
  },
  android: {
    // 네비게이션 바가 WebView 콘텐츠를 가리지 않도록
    adjustMarginsForEdgeToEdge: 'never',
  },
};

export default config;
