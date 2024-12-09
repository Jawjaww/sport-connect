import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';

/**
 * Utility function to share a link or text
 * @param link The link or text to share
 * @param title Optional dialog title for sharing
 * @returns Promise resolving to boolean indicating success
 */
export const shareContent = async (
  link: string, 
  title: string = 'Partager'
): Promise<boolean> => {
  try {
    // First, check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (isAvailable) {
      try {
        // Attempt native sharing
        await Sharing.shareAsync(link, {
          dialogTitle: title,
          mimeType: 'text/plain'
        });
        return true;
      } catch (sharingError) {
        console.warn('Native sharing failed, falling back to clipboard', sharingError);
      }
    }
    
    // Fallback to clipboard
    await Clipboard.setStringAsync(link);
    
    // Show alert about clipboard copy
    Alert.alert(
      'Lien copié', 
      'Le lien a été copié dans le presse-papiers car le partage natif n\'est pas disponible.',
      [{ text: 'OK' }]
    );
    
    return false;
  } catch (error) {
    console.error('Error in shareContent:', error);
    
    // Show error alert
    Alert.alert(
      'Erreur', 
      'Impossible de partager le contenu.',
      [{ text: 'OK' }]
    );
    
    return false;
  }
};
