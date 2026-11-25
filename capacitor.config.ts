import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pdfpilot5u.app',
  appName: 'PDF Pilot 5U',
  webDir: 'android-web',
  server: {
    url: 'https://pdfpilot5u.vercel.app',
    cleartext: false
  }
};

export default config;
