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
        // 프로덕션: Vercel 배포 URL 사용 (static export 빌드 불필요)
        url: 'https://drinkpaire.vercel.app',
        androidScheme: 'https',
        iosScheme: 'https',
      },
  plugins: {
    Browser: {
      presentationStyle: 'popover',
    },
  },
};

export default config;
