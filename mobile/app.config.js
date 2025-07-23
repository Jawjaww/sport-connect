module.exports = {
  expo: {
    name: 'sport-connect',
    slug: 'sport-connect',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    newArchEnabled: true,
    userInterfaceStyle: 'light',
    extra: {
      eas: {
        projectId: '5d58db74-5109-4154-a4d9-1e12afc4c58a'
      },
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    },
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.sportconnect.app',
      googleServicesFile: './GoogleService-Info.plist'
    },
    android: {
      package: 'com.sportconnect.app',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      googleServicesFile: './google-services.json'
    },
    plugins: [
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#ffffff',
          defaultChannel: 'default'
        }
      ],
      [
        '@react-native-firebase/app'
      ],
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: '34.0.0',
            kotlinVersion: '1.8.0'
          },
          ios: {
            deploymentTarget: '15.1'
          }
        }
      ]
    ],
    web: {
      favicon: './assets/favicon.png'
    }
  }
};
