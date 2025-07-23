import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { CreateTeamRequest, UpdateTeamRequest, Team, Player } from '../types/sharedTypes';
import { teamService } from '../services/team.service';

export interface CreatePlayerRequest {
  name: string;
  position?: string;
  number?: string;
  status?: 'active' | 'inactive';
}

export interface UpdatePlayerRequest extends Partial<CreatePlayerRequest> {
  id: string;
  name: string;
}

export const useTeam = (teamId: string) => {
  const queryClient = useQueryClient();

  // Queries
  const userTeams = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await teamService.getAllTeams();
      if (error) throw new Error(error);
      return data?.map(team => ({
        ...team,
        players: team.players || []
      })) || [];
    }
  });

  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamService.getTeamById(teamId),
  });

  const { data: members = [], isLoading: isMembersLoading } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: () => teamService.getTeamPlayers(teamId),
    enabled: !!teamId,
  });

  // Mutations
  const createTeam = useMutation({
    mutationFn: async (data: CreateTeamRequest) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      return teamService.createTeam(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    }
  });

  const updateTeam = useMutation({
    mutationFn: async ({ teamId, data }: { teamId: string; data: UpdateTeamRequest }) => {
      return teamService.updateTeam(teamId, data);
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    }
  });

  const addPlayer = useMutation({
    mutationFn: (playerData: CreatePlayerRequest) => {
      if (!team) throw new Error('Team not found');
      return teamService.createTeamPlayer(teamId, playerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
    },
  });

  const updatePlayer = useMutation({
    mutationFn: ({ playerId, updates }: { playerId: string; updates: UpdatePlayerRequest }) => {
      if (!team) throw new Error('Team not found');
      if (!updates.name) throw new Error('Player name is required');
      return teamService.updateTeamPlayer(teamId, playerId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
    },
  });

  const removePlayer = useMutation({
    mutationFn: (playerId: string) => {
      if (!team) throw new Error('Team not found');
      return teamService.deleteTeamPlayer(teamId, playerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
    },
  });

  const joinTeam = useMutation({
    mutationFn: (code: string) => {
      return teamService.joinTeam(teamId, code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
    },
  });

  const handleJoinRequest = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'accepted' | 'rejected' }) => {
      if (!team) throw new Error('Team not found');
      return teamService.processJoinRequest(teamId, userId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
    },
  });

  const handleJoinRequestMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'accepted' | 'rejected' }) => {
      if (!team) throw new Error('Team not found');
      if (!team?.data?.[0]?.id) throw new Error('Team ID not found');
      return await teamService.processJoinRequest(team.data[0].id, userId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
    },
  });

  return {
    userTeams,
    team,
    members,
    isLoading: isTeamLoading || isMembersLoading,
    createTeam,
    updateTeam,
    addPlayer,
    updatePlayer,
    removePlayer,
    joinTeam,
    handleJoinRequest,
    handleJoinRequestMutation,
  };
};
