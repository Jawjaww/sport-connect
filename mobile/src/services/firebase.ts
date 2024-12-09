import { initializeApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from 'firebase/messaging';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID
} from '@env';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

export const initializeMessaging = async () => {
  try {
    if (await isSupported()) {
      const messaging = getMessaging(app);
      const token = await getToken(messaging);
      return { token, error: null };
    }
    return { token: null, error: 'Messaging not supported' };
  } catch (error) {
    return { token: null, error };
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export default app;
