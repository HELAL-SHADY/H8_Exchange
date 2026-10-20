import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.h8exchange.app',
  appName: 'H8 Exchange',
  webDir: 'out',
  server: {
    url: 'https://h8-exchange.vercel.app',
    cleartext: true
  }
};

export default config;