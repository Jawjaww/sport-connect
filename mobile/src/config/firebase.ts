// src/config/firebase.ts
// Configuration Firebase avec React Native Firebase (SDK natif)
// Compatible avec Expo Notifications et EAS Build

import firebase from '@react-native-firebase/app';

/**
 * Initialise Firebase avec React Native Firebase (SDK natif)
 * Cette approche est compatible avec Expo Notifications et résout
 * l'erreur "Default FirebaseApp is not initialized"
 */
export function initializeFirebaseForNotifications() {
  try {
    // Vérifier si Firebase est déjà initialisé
    if (firebase.apps.length === 0) {
      console.log('⚠️ Firebase non initialisé automatiquement');
      // Avec React Native Firebase, l'initialisation est automatique
      // via google-services.json et GoogleService-Info.plist
    } else {
      console.log('🔥 Firebase déjà initialisé via React Native Firebase');
    }
    
    // Vérifier l'état de l'app par défaut
    const defaultApp = firebase.app();
    console.log('✅ Firebase App Name:', defaultApp.name);
    console.log('✅ Firebase Project:', defaultApp.options.projectId);
    
  } catch (error) {
    console.error('❌ Erreur initialisation Firebase:', error);
  }
}

// Export pour compatibilité
export default firebase;
