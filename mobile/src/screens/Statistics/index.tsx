import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../types';

type StatisticsScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Statistics'>;

const StatisticsScreen: React.FC = () => {
  const navigation = useNavigation<StatisticsScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistics</Text>
      {/* Add statistics and analytics here */}
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

export default StatisticsScreen;
