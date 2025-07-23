import { useState, useEffect } from 'react';
import { Team, TeamResponse } from '../types/sharedTypes';
import { teamService } from '../services/team.service';

export const useTeams = (teamId?: string) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [error, setError] = useState<string | Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const result = await teamService.getAllTeams();
      if (result.error) {
        setError(result.error);
        setTeams([]);
      } else {
        setTeams(result.data || []);
        setError(null);
      }
    } catch (err) {
      setError('Erreur lors de la récupération des équipes');
      setTeams([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTeamById = async (id: string) => {
    try {
      setLoading(true);
      const team = teams.find(t => t.id === id);
      if (team) {
        setCurrentTeam(team);
      } else {
        setError('Équipe non trouvée');
      }
    } catch (err) {
      setError('Erreur lors de la récupération de l\'équipe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      getTeamById(teamId);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTeams();
  }, []);

  return {
    teams,
    currentTeam,
    error,
    isLoading,
    loading,
    setTeams,
    refreshTeams: fetchTeams
  };
};
