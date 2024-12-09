import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../types';

type NotificationsScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Notifications'>;

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {/* Add notifications list here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default NotificationsScreen;
