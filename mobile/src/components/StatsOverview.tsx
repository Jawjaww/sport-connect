import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';

type Stat = {
  label: string;
  value: number | string;
  icon?: string;
};

type Props = {
  stats: Stat[];
};

export const StatsOverview = ({ stats }: Props) => {
  const theme = useTheme();

  return (
    <Animated.View 
      entering={FadeIn} 
      style={[
        styles.container,
        { backgroundColor: theme.colors.elevation.level1 }
      ]}
    >
      {stats.map((stat, index) => (
        <View 
          key={stat.label} 
          style={[
            styles.statItem,
            index < stats.length - 1 && styles.statItemWithBorder
          ]}
        >
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
            {stat.label}
          </Text>
        </View>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingVertical: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemWithBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 0, 0, 0.1)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
});
