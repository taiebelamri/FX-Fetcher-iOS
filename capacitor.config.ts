import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tyoubalabs.fxfetcher',
  appName: 'Fx Fetcher',
  webDir: 'dist',
  ios: {
    useLegacySwiftPackageManager: false
	
  }
};

export default config;
