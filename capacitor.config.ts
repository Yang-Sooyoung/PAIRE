import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.paire.app',
  appName: 'PAIRÉ',
  webDir: 'out',
  server: {
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
