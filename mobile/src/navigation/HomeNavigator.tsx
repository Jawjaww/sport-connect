import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IconButton } from 'react-native-paper';
import type { HomeStackParamList } from '../types/navigationTypes';
import HomeScreen from '../screens/Home/HomeScreen';
import MatchDetailsScreen from '../screens/Match/MatchDetailsScreen';
import TournamentDetailsScreen from '../screens/Tournament/TournamentDetailsScreen';
import TeamCreationScreen from '../screens/Team/TeamCreationScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<HomeStackParamList>();

// Define props for each screen
export type HomeScreenProps = NativeStackScreenProps<HomeStackParamList, 'Home'>;
export type MatchDetailsScreenProps = NativeStackScreenProps<HomeStackParamList, 'MatchDetails'>;
export type TournamentDetailsScreenProps = NativeStackScreenProps<HomeStackParamList, 'TournamentDetails'>;
export type TeamCreationScreenProps = NativeStackScreenProps<HomeStackParamList, 'TeamCreation'>;
export type ProfileScreenProps = NativeStackScreenProps<HomeStackParamList, 'Profile'>;

const HomeNavigator = () => {
  console.log('HomeNavigator accessed');
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
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
