import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TeamService } from '../services/team.service';
import { supabase } from '../services/supabase';
import type {
  CreateTeamRequest,
  UpdateTeamRequest,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  Team,
  TeamStatus
} from '../types/database';

export const useTeam = () => {
  const queryClient = useQueryClient();

  // Queries
  const userTeams = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const teams = await TeamService.getUserTeams();
      return teams.map(team => ({
        ...team,
        players: team.players || []
      }));
    }
  });

  const getTeam = (teamId: string) => useQuery({
    queryKey: ['teams', teamId],
    queryFn: async () => {
      const team = await TeamService.getTeam(teamId);
      return {
        ...team,
        players: team.players || []
      };
    },
    enabled: !!teamId
  });

  const getTeamMembers = (teamId: string) => useQuery({
    queryKey: ['teams', teamId, 'members'],
    queryFn: () => TeamService.getTeamMembers(teamId),
    enabled: !!teamId
  });

  // Mutations
  const createTeam = useMutation({
    mutationFn: async (data: CreateTeamRequest) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      return TeamService.createTeam(data, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    }
  });

  const updateTeam = useMutation({
    mutationFn: async ({ teamId, data }: { teamId: string; data: UpdateTeamRequest }) => {
      return TeamService.updateTeam(teamId, data);
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    }
  });

  const addPlayer = useMutation({
    mutationFn: async ({ teamId, data }: { teamId: string; data: CreatePlayerRequest }) => {
      return TeamService.addPlayer(teamId, data);
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
    }
  });

  const updatePlayer = useMutation({
    mutationFn: async ({ teamId, playerId, data }: { teamId: string; playerId: string; data: UpdatePlayerRequest }) => {
      return TeamService.updatePlayer(teamId, playerId, data);
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
    }
  });

  const removePlayer = useMutation({
    mutationFn: async ({ teamId, playerId }: { teamId: string; playerId: string }) =>
      TeamService.removePlayer(teamId, playerId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
    }
  });

  const joinTeamWithCode = useMutation({
    mutationFn: (code: string) => TeamService.joinTeamWithCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    }
  });

  const handleJoinRequest = useMutation({
    mutationFn: ({ teamId, userId, accept }: { teamId: string; userId: string; accept: boolean }) =>
      TeamService.handleJoinRequest(teamId, userId, accept),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] });
    }
  });

  return {
    userTeams,
    getTeam,
    getTeamMembers,
    createTeam,
    updateTeam,
    addPlayer,
    updatePlayer,
    removePlayer,
    joinTeamWithCode,
    handleJoinRequest
  };
};
