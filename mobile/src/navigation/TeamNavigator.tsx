import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { TeamStackParamList } from '../types/navigationTypes';
import TeamScreen from '../screens/Team';
import PlayerDetailsScreen from '../screens/Player/PlayerDetailsScreen';
import EditPlayerScreen from '../screens/Team/EditPlayerScreen';
import EditTeamScreen from '../screens/Team/EditTeamScreen';
import TeamSettingsScreen from '../screens/Team/TeamSettingsScreen';
import TeamMembersScreen from '../screens/Team/TeamMembersScreen';
import AddPlayerScreen from '../screens/Team/AddPlayerScreen';

const Stack = createNativeStackNavigator<TeamStackParamList>();

export default function TeamNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TeamMain"
        component={TeamScreen}
        options={{ title: 'Mon équipe' }}
      />
      <Stack.Screen
        name="PlayerDetails"
        component={PlayerDetailsScreen}
        options={{ title: 'Profil du joueur' }}
      />
      <Stack.Screen
        name="EditPlayer"
        component={EditPlayerScreen}
        options={{ title: 'Modifier le joueur' }}
      />
      <Stack.Screen
        name="EditTeam"
        component={EditTeamScreen}
        options={{ title: 'Modifier l\'équipe' }}
      />
      <Stack.Screen
        name="TeamSettings"
        component={TeamSettingsScreen}
        options={{ title: 'Paramètres de l\'équipe' }}
      />
      <Stack.Screen
        name="TeamMembers"
        component={TeamMembersScreen}
        options={{ title: 'Membres de l\'équipe' }}
      />
      <Stack.Screen
        name="AddPlayer"
        component={AddPlayerScreen}
        options={{ title: 'Ajouter un joueur' }}
      />
    </Stack.Navigator>
  );
}
