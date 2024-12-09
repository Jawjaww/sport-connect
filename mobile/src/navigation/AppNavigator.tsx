import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import type { RootStackParamList } from '../types/navigation';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Screens
import HomeScreen from '../screens/Home';
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

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

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
