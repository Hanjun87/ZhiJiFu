import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zhijifu.app',
  appName: '知己肤',
  webDir: 'dist',
  server: {
    cleartext: true,
    allowNavigation: ['192.168.43.3', '192.168.43.1', 'localhost', '127.0.0.1', '*']
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
