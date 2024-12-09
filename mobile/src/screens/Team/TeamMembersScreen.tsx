import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  List,
  Avatar,
  Button,
  FAB,
  useTheme,
  IconButton,
  Menu,
  Divider,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TeamStackParamList, TeamMember, User } from '../../types';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

type Props = NativeStackScreenProps<TeamStackParamList, 'TeamMembers'>;

interface MemberWithUser extends TeamMember {
  user: User;
}

const TeamMembersScreen: React.FC<Props> = ({ route, navigation }) => {
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

      if (error) throw error;
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

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      loadMembers();
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  const renderMemberItem = ({ item }: { item: MemberWithUser }) => (
    <List.Item
      title={item.user.username}
      description={item.role.charAt(0).toUpperCase() + item.role.slice(1)}
      left={() => (
        <Avatar.Image
          size={40}
          source={
            item.user.avatar_url
              ? { uri: item.user.avatar_url }
              : { uri: 'https://via.placeholder.com/100x100.png?text=Avatar' }
          }
        />
      )}
      right={() =>
        isManager && item.user_id !== user?.id ? (
          <Menu
            visible={menuVisible === item.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(item.id)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                handleChangeRole(item.id, 'player');
                setMenuVisible(null);
              }}
              title="Définir comme joueur"
            />
            <Menu.Item
              onPress={() => {
                handleChangeRole(item.id, 'coach');
                setMenuVisible(null);
              }}
              title="Définir comme coach"
            />
            <Menu.Item
              onPress={() => {
                handleChangeRole(item.id, 'manager');
                setMenuVisible(null);
              }}
              title="Définir comme manager"
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                handleRemoveMember(item.id);
                setMenuVisible(null);
              }}
              title="Retirer de l'équipe"
              titleStyle={{ color: theme.colors.error }}
            />
          </Menu>
        ) : null
      }
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={members}
        renderItem={renderMemberItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={Divider}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.title}>
              Membres de l'équipe ({members.length})
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    opacity: 0.7,
  },
});

export default TeamMembersScreen;
