import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IconButton } from 'react-native-paper';
import type { HomeStackParamList } from '../types/navigation';
import HomeScreen from '../screens/Home';
import MatchDetailsScreen from '../screens/Match/MatchDetailsScreen';
import TournamentDetailsScreen from '../screens/Tournament/TournamentDetailsScreen';
import TeamCreationScreen from '../screens/Team/TeamCreationScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen as any} 
        options={({ navigation }) => ({
          title: 'Accueil',
          headerRight: () => (
            <IconButton
              icon="account"
              size={24}
              onPress={() => navigation.navigate('Profile')}
            />
          ),
        })}
      />
      <Stack.Screen
        name="MatchDetails"
        component={MatchDetailsScreen}
        options={{ title: 'Détails du match' }}
      />
      <Stack.Screen
        name="TournamentDetails"
        component={TournamentDetailsScreen}
        options={{ title: 'Détails du tournoi' }}
      />
      <Stack.Screen
        name="TeamCreation"
        component={TeamCreationScreen}
        options={{ title: 'Créer une équipe' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Stack.Navigator>
  );
};

export default HomeNavigator;
