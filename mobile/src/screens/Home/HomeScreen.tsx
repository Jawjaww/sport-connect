import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../types/navigationTypes';
import Animated, {
  FadeInDown, 
  FadeOutUp, 
  SlideInRight,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { MatchCard } from '@components/MatchCard';
import TournamentCard from '@components/TournamentCard';
import { supabase } from '@services/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { teamService } from '@services/team.service';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { Team } from '../../types/sharedTypes'; 

interface LocalMatch {
  id: string;
  teamAId: string;
  teamBId: string;
  date: string;
  status: string;
}

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [localTeams, setLocalTeams] = useState<LocalMatch[]>([]);

  const { data: matches, isLoading: isLoadingMatches, error: errorMatches } = useQuery<any[]>({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*, home_team:teams(*), away_team:teams(*)')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  const { data: tournaments, isLoading: isLoadingTournaments, error: errorTournaments } = useQuery<any[]>({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*, teams(*)')
        .neq('status', 'completed')
        .order('start_date', { ascending: true })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
  });

  const { data: teams = [], error, isLoading } = useQuery<Team[], Error>({
    queryKey: ['teams'],
    queryFn: async () => {
      const result = await teamService.getAllTeams();
      if (result.error) throw new Error(result.error);
      return result.data || [];
    }
  });

  // Fetch local teams
  const fetchLocalTeams = async () => {
    try {
      const matches = teams.map((team, index) => ({
        id: `match-${index}`, 
        teamAId: team.id,     
        teamBId: teams[(index + 1) % teams.length]?.id, 
        date: new Date().toISOString(), 
        status: 'scheduled',   
      }));
      setLocalTeams(matches); 
    } catch (error) {
      console.error('Error fetching local teams:', error);
    }
  };

  // Listen for team sync events
  useEffect(() => {
    console.log('HomeScreen mounted');
    console.log('HomeScreen mounted');
    // Initial fetch
    fetchLocalTeams();

    // For team sync events, we should use React Native's event emitter
    const eventEmitter = new NativeEventEmitter(NativeModules.EventEmitter);
    const subscription = eventEmitter.addListener('teamSynced', () => {
      fetchLocalTeams();
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['matches'] }),
      queryClient.invalidateQueries({ queryKey: ['tournaments'] }),
      fetchLocalTeams()
    ]).finally(() => setRefreshing(false));
  }, [queryClient]);

  if (isLoadingMatches || isLoadingTournaments) {
    return (
      <Animated.View 
        entering={FadeInDown} 
        exiting={FadeOutUp}
        style={[styles.container, styles.centered]}
      >
        <LottieView
          source={require('../../assets/animations/sports-loading.json')}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
        <Text style={styles.loadingText}>Chargement des événements sportifs...</Text>
      </Animated.View>
    );
  }

  const hasError = errorMatches || errorTournaments;
  if (hasError) {
    return (
      <Animated.View 
        entering={FadeInDown} 
        style={[styles.container, styles.centered]}
      >
        <LottieView
          source={require('../../assets/animations/error.json')}
          autoPlay
          loop={false}
          style={{ width: 150, height: 150 }}
        />
        <Text style={styles.errorTitle}>Création d'équipe requise</Text>
        <Text style={styles.errorText}>
          Vous devez d'abord créer une équipe avant de pouvoir organiser des matchs et des tournois.
        </Text>
        <Button 
          mode="contained"
          onPress={() => navigation.navigate('TeamCreation')}
          style={styles.retryButton}
          icon={({ size, color }) => (
            <MaterialCommunityIcons name="plus" size={size} color={color} />
          )}
        >
          Créer une équipe
        </Button>
      </Animated.View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.headerTitle}>
            SportConnect
          </Text>
          <Text variant="bodyLarge" style={styles.headerSubtitle}>
            Restez connecté avec votre communauté sportive
          </Text>
        </View>

        <Animated.View 
          entering={SlideInRight.delay(300)} 
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons 
              name="whistle" 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.primary, marginLeft: 8, fontWeight: '600' }]}>
              Prochains matchs
            </Text>
          </View>
          
          {matches && matches.length > 0 ? (
            matches.map((match, index) => (
              <Animated.View
                key={match.id}
                entering={SlideInRight.delay(index * 100)}
              >
                <MatchCard
                  match={match}
                  onPress={() => navigation.navigate('MatchDetails', { matchId: match.id })}
                />
              </Animated.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <LottieView
                source={require('../../assets/animations/empty-state.json')}
                autoPlay
                loop
                style={{ width: 120, height: 120 }}
              />
              <Text style={styles.emptyText}>Aucun match à venir</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View 
          entering={SlideInRight.delay(600)} 
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons 
              name="trophy" 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.primary, marginLeft: 8, fontWeight: '600' }]}>
              Tournois en cours
            </Text>
          </View>

          {tournaments && tournaments.length > 0 ? (
            tournaments.map((tournament, index) => (
              <Animated.View
                key={tournament.id}
                entering={SlideInRight.delay(700 + index * 100)}
              >
                <TournamentCard
                  tournament={tournament}
                  onPress={() => navigation.navigate('TournamentDetails', { tournamentId: tournament.id })}
                />
              </Animated.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <LottieView
                source={require('../../assets/animations/empty-state.json')}
                autoPlay
                loop
                style={{ width: 120, height: 120 }}
              />
              <Text style={styles.emptyText}>Aucun tournoi en cours</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#1a237e',
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: '#ffffff',
    opacity: 0.8,
  },
  section: {
    marginBottom: 20,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    marginLeft: 10,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  retryButton: {
    marginTop: 10,
    borderRadius: 25,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;
