import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AnimatedTabIcon from '../components/AnimatedTabIcon';
import { MainTabParamList } from '../types';

// Screens
import HomeScreen from '../screens/Home';
import TeamScreen from '../screens/Team';
import TournamentsScreen from '../screens/Tournaments';
import StatisticsScreen from '../screens/Statistics';
import NotificationsScreen from '../screens/Notifications';
import SettingsScreen from '../screens/Settings';

// Stack navigators for each tab
const HomeStack = createNativeStackNavigator();
const TeamStack = createNativeStackNavigator();
const TournamentsStack = createNativeStackNavigator();
const StatisticsStack = createNativeStackNavigator();

const Tab = createBottomTabNavigator<MainTabParamList>();

const HomeStackNavigator = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen
      name="HomeMain"
      component={HomeScreen as React.ComponentType<any>}
      options={{ title: 'Accueil' }}
    />
  </HomeStack.Navigator>
);

const TeamStackNavigator = () => (
  <TeamStack.Navigator>
    <TeamStack.Screen
      name="TeamMain"
      component={TeamScreen as React.ComponentType<any>}
      options={{ title: 'Mon Équipe' }}
    />
  </TeamStack.Navigator>
);

const TournamentsStackNavigator = () => (
  <TournamentsStack.Navigator>
    <TournamentsStack.Screen
      name="TournamentsMain"
      component={TournamentsScreen}
      options={{ title: 'Tournois' }}
    />
  </TournamentsStack.Navigator>
);

const StatisticsStackNavigator = () => (
  <StatisticsStack.Navigator>
    <StatisticsStack.Screen
      name="StatisticsMain"
      component={StatisticsScreen}
      options={{ title: 'Statistiques' }}
    />
  </StatisticsStack.Navigator>
);

const MainNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconName = '';

          switch (route.name) {
            case 'HomeMain':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'TeamMain':
              iconName = focused ? 'account-group' : 'account-group-outline';
              break;
            case 'Tournaments':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Statistics':
              iconName = focused ? 'chart-bar' : 'chart-bar-outline';
              break;
            case 'Notifications':
              iconName = focused ? 'bell' : 'bell-outline';
              break;
            case 'Settings':
              iconName = focused ? 'cog' : 'cog-outline';
              break;
          }

          return <AnimatedTabIcon name={iconName} focused={focused} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: theme.colors.surface,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'System',
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen
        name="HomeMain"
        component={HomeStackNavigator}
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen
        name="TeamMain"
        component={TeamStackNavigator}
        options={{ title: 'Équipe' }}
      />
      <Tab.Screen
        name="Tournaments"
        component={TournamentsStackNavigator}
        options={{ title: 'Tournois' }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsStackNavigator}
        options={{ title: 'Stats' }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Paramètres' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
