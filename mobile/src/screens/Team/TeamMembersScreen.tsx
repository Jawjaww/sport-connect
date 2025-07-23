import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, List, Avatar, Menu, Divider, useTheme, Icon } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TeamStackParamList } from '../../types/navigationTypes';
import { TeamMember, User } from '../../types/sharedTypes';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

type Props = NativeStackScreenProps<TeamStackParamList, 'TeamMembers'>;

interface MemberWithUser extends TeamMember {
  user: User;
}

const TeamMembersScreen: React.FC<Props> = ({ route }) => {
  const { teamId } = route.params;
  const theme = useTheme();
  const { user } = useAuth();
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
    checkManagerStatus();
  }, []);


  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          user:user_id (
            id,
            email,
            username,
            avatar_url
          )
        `)
        .eq('team_id', teamId)
        .is('left_at', null);

      if (error) {
        console.error('Error loading team members:', error);
        return;
      }
      setMembers(data as MemberWithUser[]);
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkManagerStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .is('left_at', null)
        .single();

      if (error) throw error;
      setIsManager(data.role === 'manager' || data.role === 'admin');
    } catch (error) {
      console.error('Error checking manager status:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ left_at: new Date().toISOString() })
        .eq('id', memberId);

      if (error) throw error;
      loadMembers();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: TeamMember['role']) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      loadMembers();
      setMenuVisible(null);
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <List.Section>
        <List.Subheader>Membres de l'équipe ({members.length})</List.Subheader>
        {members.map((member) => (
          <List.Item
            key={member.id}
            title={member.user.username}
            description={member.role.charAt(0).toUpperCase() + member.role.slice(1)}
            left={() => (
              <Avatar.Image
                size={40}
                source={
                  member.user.avatar_url
                    ? { uri: member.user.avatar_url }
                    : { uri: 'https://via.placeholder.com/100x100.png?text=Avatar' }
                }
              />
            )}
            right={() =>
              isManager && member.user_id !== user?.id ? (
                <Menu
                  visible={menuVisible === member.id}
                  onDismiss={() => setMenuVisible(null)}
                  anchor={
                    <TouchableOpacity 
                      onPress={() => setMenuVisible(member.id)}
                      style={{ padding: 8 }}
                      accessibilityRole="button"
                    >
                      <Icon source="dots-vertical" size={24} />
                    </TouchableOpacity>
                  }
                >
                  <Menu.Item
                    onPress={() => handleChangeRole(member.id, 'player')}
                    title="Définir comme joueur"
                  />
                  <Menu.Item
                    onPress={() => handleChangeRole(member.id, 'coach')}
                    title="Définir comme coach"
                  />
                  <Menu.Item
                    onPress={() => handleChangeRole(member.id, 'manager')}
                    title="Définir comme manager"
                  />
                  <Divider />
                  <Menu.Item
                    onPress={() => handleRemoveMember(member.id)}
                    title="Retirer de l'équipe"
                    titleStyle={{ color: theme.colors.error }}
                  />
                </Menu>
              ) : null
            }
          />
        ))}
      </List.Section>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default TeamMembersScreen;
