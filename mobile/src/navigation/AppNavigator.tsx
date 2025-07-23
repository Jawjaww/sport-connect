import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import type { RootStackParamList, RootStackScreenProps } from '../types/navigationTypes';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import TeamScreen from '../screens/Team/TeamScreen';
import PlayerProfileScreen from '../screens/Player/PlayerProfileScreen';
import CreateTeamScreen from '../screens/Team/CreateTeamScreen';
import JoinTeamScreen from '../screens/Team/JoinTeamScreen';
import TeamMembersScreen from '../screens/Team/TeamMembersScreen';
import EditTeamScreen from '../screens/Team/EditTeamScreen';
import EditPlayerScreen from '../screens/Player/EditPlayerScreen';
import ManagedTeamsScreen from '../screens/ManagedTeamsScreen';
import AuthNavigator from './AuthNavigator';
import MatchDetailsScreen from '../screens/Match/MatchDetailsScreen';
import TournamentDetailsScreen from '../screens/Tournament/TournamentDetailsScreen';
import TeamCodeDetailScreen from '../screens/Team/TeamCodeDetailScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

// Define props for each screen
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type TeamScreenProps = NativeStackScreenProps<RootStackParamList, 'TeamMain'>;
export type PlayerProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'PlayerProfile'>;
export type CreateTeamScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateTeam'>;
export type JoinTeamScreenProps = NativeStackScreenProps<RootStackParamList, 'JoinTeam'>;
export type TeamMembersScreenProps = NativeStackScreenProps<RootStackParamList, 'TeamMembers'>;
export type EditTeamScreenProps = NativeStackScreenProps<RootStackParamList, 'EditTeam'>;
export type EditPlayerScreenProps = NativeStackScreenProps<RootStackParamList, 'EditPlayer'>;
export type ManagedTeamsScreenProps = NativeStackScreenProps<RootStackParamList, 'ManagedTeams'>;
export type MatchDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'MatchDetails'>;
export type TeamCodeDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'TeamCodeDetail'>;
export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;
export type TournamentDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'TournamentDetails'>;

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  console.log('AppNavigator rendered');
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  console.log('AppNavigator rendered');

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {!user ? (
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Accueil',
              headerRight: () => <TeamsButton />
            }}
          />
          <Stack.Screen
            name="ManagedTeams"
            component={ManagedTeamsScreen}
            options={{
              title: 'Mes Équipes',
              headerBackTitle: 'Retour'
            }}
          />
          <Stack.Screen
            name="TeamMain"
            component={TeamScreen}
            options={{ 
              title: 'Équipe',
              headerBackTitle: 'Retour'
            }}
          />
          <Stack.Screen
            name="PlayerProfile"
            component={PlayerProfileScreen}
            options={{ title: 'Profil du joueur' }}
          />
          <Stack.Screen
            name="CreateTeam"
            component={CreateTeamScreen}
            options={{ title: 'Créer une équipe' }}
          />
          <Stack.Screen
            name="JoinTeam"
            component={JoinTeamScreen}
            options={{ title: 'Rejoindre une équipe' }}
          />
          <Stack.Screen
            name="TeamMembers"
            component={TeamMembersScreen}
            options={{ title: 'Membres' }}
          />
          <Stack.Screen
            name="EditTeam"
            component={EditTeamScreen}
            options={{ title: 'Modifier l\'équipe' }}
          />
          <Stack.Screen
            name="EditPlayer"
            component={EditPlayerScreen}
            options={{ title: 'Modifier le joueur' }}
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
            name="TeamCodeDetail"
            component={TeamCodeDetailScreen}
            options={{ title: 'Code d\'équipe' }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'Profil' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

// Composant séparé pour le bouton de navigation
const TeamsButton = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  return (
    <TouchableOpacity 
      onPress={() => navigation.navigate('ManagedTeams')}
      style={{ marginRight: 16 }}
    >
      <MaterialIcons name="sports" size={24} color="#007AFF" />
    </TouchableOpacity>
  );
};

export default AppNavigator;
