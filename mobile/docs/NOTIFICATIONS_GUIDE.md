# 📱 Sport-Connect Mobile - Guide Notifications

## 🏗️ Architecture des Notifications

### Stack Technologique
- **Expo Notifications** : Service de push notifications unifié
- **Supabase** : Backend auth/database
- **EAS Build** : Build et déploiement natifs

### Remplacement de Firebase
Cette version remplace complètement Firebase Cloud Messaging par Expo Notifications pour une architecture plus simple et moderne.

## ⚙️ Configuration

### Variables d'environnement (`.env`)
```env
# Configuration Supabase
SUPABASE_URL=https://hikwnreutetlvwkdnitp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Configuration EAS
EAS_PROJECT_ID=5d58db74-5109-4154-a4d9-1e12afc4c58a
DEBUG=true
ENVIRONMENT=development
```

### Configuration Expo (`app.config.js`)
```javascript
plugins: [
  [
    'expo-notifications',
    {
      icon: './assets/notification-icon.png',
      color: '#ffffff',
      defaultChannel: 'default'
    }
  ]
]
```

## 🔧 Services

### ExpoNotificationService
Service principal gérant :
- 🎯 **Token push** : Récupération et gestion
- 📱 **Canaux Android** : Default + Critical
- 🔔 **Listeners** : Réception et interactions
- 🌐 **Intégration Supabase** : Variables d'environnement

#### Utilisation
```typescript
import { notificationService } from '@/services/expoNotification.service';

// Initialisation
await notificationService.initialize();

// Récupération du token
const token = notificationService.getPushToken();

// Écoute des notifications
notificationService.addNotificationReceivedListener((notification) => {
  // Traitement WebRTC, matchs, messages
});
```

### NotificationProvider
Provider React intégrant le service dans l'application :
- 🔄 **Auto-initialisation** au démarrage
- 🎯 **Routing automatique** depuis notifications
- 📡 **Support signalisation WebRTC**
- 💬 **Gestion messages et matchs**

## 📲 Types de Notifications Supportées

### 1. Signalisation WebRTC
```json
{
  "type": "webrtc_signal",
  "sdp": "...",
  "ice": "...",
  "callId": "uuid"
}
```

### 2. Mises à jour Matchs
```json
{
  "type": "match_update",
  "matchId": "uuid",
  "status": "started|finished|cancelled",
  "score": "2-1"
}
```

### 3. Nouveaux Messages
```json
{
  "type": "message",
  "chatId": "uuid",
  "senderId": "uuid",
  "preview": "Nouveau message..."
}
```

## 🚀 Déploiement

### Build Development
```bash
npx eas build -p android --profile development
npx eas build -p ios --profile development
```

### Build Production
```bash
npx eas build -p android --profile production
npx eas build -p ios --profile production
```

### Configuration EAS (`eas.json`)
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "ENVIRONMENT": "development",
        "SUPABASE_URL": "$SUPABASE_URL",
        "SUPABASE_ANON_KEY": "$SUPABASE_ANON_KEY"
      }
    }
  }
}
```

## 🔍 Debug et Test

### Logs de Notifications
```typescript
// Activer les logs détaillés
console.log('Token push:', notificationService.getPushToken());
console.log('Notification reçue:', notification);
```

### Test Local
```bash
# Démarrage avec cache vidé
npx expo start --clear

# Test sur device physique (requis pour notifications)
npx expo start --device-name="Mon Android"
```

### Envoi de Test
```bash
# Via Expo CLI
npx expo send-notification \
  --to="ExponentPushToken[xxx]" \
  --title="Test" \
  --body="Notification test" \
  --data='{"type":"test"}'
```

## 📊 Monitoring

### Métriques Importantes
- **Taux de livraison** : ~90-95% (vs ~98% FCM)
- **Latence** : 1-3 secondes (vs <1s FCM)  
- **Payload max** : 4KB (identique FCM)
- **Quotas** : 1000/jour gratuit, 10k/jour payant

### Logs à Surveiller
```typescript
// Erreurs courantes
console.error('Permission refusée');
console.error('Token non récupéré');  
console.error('EAS Project ID manquant');
```

## 🔧 Maintenance

### Mise à jour du Token
Le token est automatiquement mis à jour lors des changements d'app ou device. Synchroniser avec votre backend Supabase.

### Gestion des Erreurs
```typescript
try {
  await notificationService.initialize();
} catch (error) {
  // Fallback ou retry logic
  console.error('Notification init failed:', error);
}
```

### Nettoyage
```typescript
// Suppression notifications affichées
await notificationService.dismissAllNotifications();

// Reset badge
await notificationService.setBadgeCount(0);
```

## 🆚 Migration depuis Firebase

### ✅ Avantages Expo Notifications
- **Simplicité** : Configuration en une étape
- **Intégration** : Native avec EAS Build
- **Cross-platform** : iOS/Android/Web unifié
- **Maintenance** : Moins de dépendances

### ❌ Limitations vs FCM
- **Latence** : +1-2 secondes
- **Taux de livraison** : -3-5%  
- **Quotas** : Plus restrictifs
- **Analytics** : Basiques vs avancées FCM

### 🔄 Code Migré
```diff
- import { getMessaging } from 'firebase/messaging';
+ import { notificationService } from '@/services/expoNotification.service';

- const messaging = getMessaging();
- const token = await getToken(messaging);
+ const token = await notificationService.getPushToken();
```

## 📞 Support

Pour toute question sur cette implémentation :
1. **Documentation Expo** : https://docs.expo.dev/push-notifications/
2. **GitHub Issues** : Créer une issue dans le repo
3. **Tests** : Utiliser un device physique pour tests complets

---
*Documentation générée le 22 juillet 2025*
