import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gvbh.transport',
  appName: 'GVBH Transport',
  webDir: 'dist',
  server: {
    url: 'http://127.0.0.1:3000',
    cleartext: true
  }
};

export default config;
