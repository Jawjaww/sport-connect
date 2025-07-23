import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { initializeFirebaseForNotifications } from '../config/firebase';

// Configuration du gestionnaire de notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Service de gestion des notifications push avec Expo Notifications
 * Remplace Firebase Cloud Messaging pour une intégration native Expo
 */
export class ExpoNotificationService {
  private static instance: ExpoNotificationService;
  private pushToken: string | null = null;

  private constructor() {}

  public static getInstance(): ExpoNotificationService {
    if (!ExpoNotificationService.instance) {
      ExpoNotificationService.instance = new ExpoNotificationService();
    }
    return ExpoNotificationService.instance;
  }

  /**
   * Initialise le service de notifications
   * Configure les canaux Android et demande les permissions
   */
  async initialize(): Promise<void> {
    try {
      // Initialiser Firebase pour le support Expo Notifications
      initializeFirebaseForNotifications();

      // Configuration du canal Android
      if (Platform.OS === 'android') {
        await this.setupAndroidChannel();
      }

      // Tentative de récupération du token (ne fait pas planter l'app si échec)
      await this.registerForPushNotifications();
      
      console.log('✅ Service de notifications initialisé');
    } catch (error) {
      // Log l'erreur mais continue l'exécution
      console.warn('⚠️ Initialisation notifications partielle:', error);
    }
  }

  /**
   * Configure le canal de notification Android
   */
  private async setupAndroidChannel(): Promise<void> {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Sport Connect',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });

    // Canal pour les notifications critiques (matchs, urgences)
    await Notifications.setNotificationChannelAsync('critical', {
      name: 'Notifications Critiques',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#FF0000',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
  }

  /**
   * Demande les permissions et récupère le token push
   */
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.warn('Notifications push disponibles uniquement sur device physique');
      return null;
    }

    try {
      // Vérification des permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Permission de notification refusée');
        return null; // Ne pas throw d'erreur, juste retourner null
      }

      // Récupération du token Expo Push
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.warn('EAS Project ID non trouvé dans la configuration');
        return null; // Ne pas throw d'erreur
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId
      });

      this.pushToken = tokenData.data;
      console.log('✅ Token push récupéré:', this.pushToken);
      
      return this.pushToken;
    } catch (error) {
      // Log l'erreur mais ne pas faire planter l'app
      console.warn('⚠️ Notifications push non disponibles:', error);
      return null;
    }
  }

  /**
   * Récupère le token push actuel
   */
  getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Ajoute un listener pour les notifications reçues en premier plan
   */
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Ajoute un listener pour les interactions avec les notifications
   */
  addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Planifie une notification locale
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: trigger || null,
    });
  }

  /**
   * Annule une notification planifiée
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Annule toutes les notifications planifiées
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Met à jour le badge de l'application
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Efface toutes les notifications affichées
   */
  async dismissAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }
}

// Export de l'instance singleton
export const notificationService = ExpoNotificationService.getInstance();
