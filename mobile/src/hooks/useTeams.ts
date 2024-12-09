import { useState, useEffect } from 'react';
import { databaseService } from '../services/database.service';
import { logger } from '../utils/logger';

// Interface pour définir la structure d'une équipe
export interface Team {
  id: string;
  name: string;
  description?: string;
  sport?: string;
  owner_id: string;
  logo_url?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export const useTeams = (teamId?: string) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Récupérer toutes les équipes
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const query = 'SELECT * FROM teams ORDER BY created_at DESC';
      const fetchedTeams = databaseService.getAll<Team>(query);
      setTeams(fetchedTeams);
      
      if (teamId) {
        const team = fetchedTeams.find(t => t.id === teamId);
        setCurrentTeam(team || null);
      }
    } catch (err) {
      logger.error('Erreur lors de la récupération des équipes', { 
        error: err instanceof Error ? err.message : err 
      });
      setError(err instanceof Error ? err : new Error('Erreur de récupération des équipes'));
    } finally {
      setLoading(false);
    }
  };

  // Récupérer une équipe spécifique par ID
  const fetchTeamById = async (id: string) => {
    try {
      setLoading(true);
      const query = 'SELECT * FROM teams WHERE id = ?';
      const team = databaseService.getFirst<Team>(query, [id]);
      setCurrentTeam(team);
    } catch (err) {
      logger.error('Erreur lors de la récupération de l\'équipe', { 
        teamId: id, 
        error: err instanceof Error ? err.message : err 
      });
      setError(err instanceof Error ? err : new Error('Erreur de récupération de l\'équipe'));
    } finally {
      setLoading(false);
    }
  };

  // Créer une nouvelle équipe
  const createTeam = async (teamData: Omit<Team, 'created_at' | 'updated_at'>) => {
    try {
      databaseService.createTeam(teamData);
      await fetchTeams(); // Mettre à jour la liste des équipes
    } catch (err) {
      logger.error('Erreur lors de la création de l\'équipe', { 
        teamData, 
        error: err instanceof Error ? err.message : err 
      });
      setError(err instanceof Error ? err : new Error('Erreur de création de l\'équipe'));
    }
  };

  // Effet pour charger les équipes au montage du composant
  useEffect(() => {
    fetchTeams();
  }, []);

  return {
    teams,
    currentTeam,
    loading,
    error,
    fetchTeams,
    fetchTeamById,
    createTeam
  };
};
