import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../services/team.service';
import { CreateTeamRequest, UpdateTeamRequest } from '../types/sharedTypes';

const sanitizeCreateTeamData = (data: CreateTeamRequest): CreateTeamRequest => ({
  name: data.name,
  description: data.description,
  sport: data.sport,
  status: data.status,
  owner_id: data.owner_id,
  logo_url: data.logo_url,
  location: data.location,
});

const sanitizeUpdateTeamData = (data: UpdateTeamRequest): UpdateTeamRequest => ({
  name: data.name,
  description: data.description,
  sport: data.sport,
  status: data.status,
  logo_url: data.logo_url,
  location: data.location,
});


export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        await teamService.getAllTeams();
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initDatabase();
  }, []);

  return { isInitialized };
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (teamData: CreateTeamRequest) => {
      const sanitized = sanitizeCreateTeamData(teamData);
      return await teamService.createTeam(sanitized);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateTeamRequest }) => {
        const sanitized = sanitizeUpdateTeamData(updates);
      return await teamService.updateTeam(id, sanitized);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};
