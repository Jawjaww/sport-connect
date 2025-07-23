import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../types';

type TournamentsScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Tournaments'>;

const TournamentsScreen: React.FC = () => {
  const navigation = useNavigation<TournamentsScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tournaments Coming Soon</Text>
      {/* Add tournament list and functionality here */}
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

export default TournamentsScreen;
