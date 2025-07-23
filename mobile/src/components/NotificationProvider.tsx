import React, { useEffect } from 'react';
import { notificationService } from '../services/expoNotification.service';
import * as Notifications from 'expo-notifications';

interface NotificationProviderProps {
  children: React.ReactNode;
}

/**
 * Provider pour gérer l'initialisation et les listeners des notifications
 * Remplace l'ancien système Firebase
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  useEffect(() => {
    let notificationListener: Notifications.Subscription;
    let responseListener: Notifications.Subscription;

    const initializeNotifications = async () => {
      try {
        // Initialiser le service de notifications
        await notificationService.initialize();
        
        // Listener pour les notifications reçues en premier plan
        notificationListener = notificationService.addNotificationReceivedListener((notification) => {
          console.log('Notification reçue:', notification);
          
          // Traitement du payload pour signalisation WebRTC
          const { data } = notification.request.content;
          if (data?.type === 'webrtc_signal') {
            handleWebRTCSignaling(data);
          } else if (data?.type === 'match_update') {
            handleMatchUpdate(data);
          } else if (data?.type === 'message') {
            handleNewMessage(data);
          }
        });

        // Listener pour les interactions avec les notifications
        responseListener = notificationService.addNotificationResponseReceivedListener((response) => {
          console.log('Notification tapée:', response);
          
          const { data } = response.notification.request.content;
          if (data?.screen) {
            // Navigation vers l'écran spécifié
            handleNotificationNavigation(data.screen, data.params);
          }
        });

      } catch (error) {
        console.error('Erreur initialisation notifications:', error);
      }
    };

    // Fonctions de traitement des différents types de notifications
    const handleWebRTCSignaling = (data: any) => {
      // Traitement de la signalisation WebRTC (SDP, ICE)
      if (data.sdp || data.ice) {
        // Transmettre au service WebRTC
        console.log('Signalisation WebRTC reçue:', data);
        // TODO: Intégrer avec votre service WebRTC
      }
    };

    const handleMatchUpdate = (data: any) => {
      // Traitement des mises à jour de match
      console.log('Mise à jour match:', data);
      // TODO: Mettre à jour le state local ou déclencher un refetch
    };

    const handleNewMessage = (data: any) => {
      // Traitement des nouveaux messages
      console.log('Nouveau message:', data);
      // TODO: Mettre à jour les conversations
    };

    const handleNotificationNavigation = (screen: string, params?: any) => {
      // Navigation vers l'écran spécifié
      console.log('Navigation vers:', screen, params);
      // TODO: Intégrer avec React Navigation
    };

    initializeNotifications();

    // Cleanup
    return () => {
      if (notificationListener) {
        notificationListener.remove();
      }
      if (responseListener) {
        responseListener.remove();
      }
    };
  }, []);

  return <>{children}</>;
};

export default NotificationProvider;
