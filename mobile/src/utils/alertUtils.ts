import { Alert } from 'react-native';

export const confirmAlert = (
  title: string, 
  message: string, 
  onConfirm: () => void, 
  onCancel?: () => void
) => {
  Alert.alert(
    title,
    message,
    [
      { 
        text: 'Annuler', 
        style: 'cancel',
        onPress: onCancel 
      },
      { 
        text: 'Confirmer', 
        style: 'destructive', 
        onPress: onConfirm 
      }
    ]
  );
};
