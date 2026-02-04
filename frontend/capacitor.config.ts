import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gvbh.transport',
  appName: 'GVBH Transport',
  webDir: 'dist',
  server: {
    url: 'http://192.168.0.22:3000',
    cleartext: true
  }
};

export default config;
