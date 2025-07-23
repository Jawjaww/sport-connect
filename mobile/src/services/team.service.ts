import { 
  Team, 
  CreateTeamRequest, 
  UpdateTeamRequest, 
  TeamResponse,
  TeamCodeResponse,
  ShareTeamCodeResponse
} from '../types/sharedTypes';
import { supabase } from './supabase';
import { SQLiteService } from './sqlite.service';

const generateTeamCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

export const teamService = {

  async getAllTeams(): Promise<TeamResponse> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Save to local SQLite
      if (data && data.length > 0) {
        await Promise.all(data.map(team => 
          SQLiteService.runAsync(
            'INSERT OR REPLACE INTO teams (id, name, sport, description, owner_id, status) VALUES (?, ?, ?, ?, ?, ?)',
            [team.id, team.name, team.sport, team.description, team.owner_id, team.status]
          )
        ));
      }

      return { data, error: null };
    } catch (error) {
      console.error(error);
      return { data: null, error: 'Erreur lors de la récupération des équipes' };
    }
  },

  async createTeam(teamData: CreateTeamRequest): Promise<TeamResponse> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([teamData])
        .select()
        .single();

      if (error) throw error;

      // Save to local SQLite
      await SQLiteService.runAsync(
        'INSERT INTO teams (id, name, sport, description, owner_id, status) VALUES (?, ?, ?, ?, ?, ?)',
        [data.id, data.name, data.sport, data.description, data.owner_id, data.status]
      );

      return { data: [data], error: null };
    } catch (error) {
      console.error(error);
      return { data: null, error: 'Erreur lors de la création de l\'équipe' };
    }
  },

  async updateTeam(id: string, updates: UpdateTeamRequest): Promise<TeamResponse> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local SQLite
      await SQLiteService.runAsync(
        `UPDATE teams SET 
          name = ?, 
          sport = ?, 
          description = ?, 
          status = ? 
        WHERE id = ?`,
        [updates.name, updates.sport, updates.description, updates.status, id]
      );

      return { data: [data], error: null };
    } catch (error) {
      console.error(error);
      return { data: null, error: 'Erreur lors de la mise à jour de l\'équipe' };
    }
  },

  async deleteTeam(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Delete from local SQLite
      await SQLiteService.runAsync('DELETE FROM teams WHERE id = ?', [id]);

      return { error: null };
    } catch (error) {
      console.error(error);
      return { error: 'Erreur lors de la suppression de l\'équipe' };
    }
  },

  async getTeamCodeDetails(teamId: string): Promise<TeamCodeResponse> {
    try {
      const { data, error } = await supabase
        .from('team_codes')
        .select('*')
        .eq('team_id', teamId)
        .single();

      if (error) throw error;
      
      // Save to local SQLite
      if (data?.code) {
        await SQLiteService.saveTeamCode(teamId, data.code);
      }

      return { data: data?.code || null, error: null };
    } catch (error) {
      console.error(error);
      return { data: null, error: 'Erreur lors de la récupération du code d\'équipe' };
    }
  },

  async regenerateTeamCode(teamId: string): Promise<TeamCodeResponse> {
    try {
      const newCode = generateTeamCode();
      
      const { data, error } = await supabase
        .from('team_codes')
        .upsert({ team_id: teamId, code: newCode })
        .select()
        .single();

      if (error) throw error;

      // Save to local SQLite
      await SQLiteService.saveTeamCode(teamId, newCode);

      return { data: newCode, error: null };
    } catch (error) {
      console.error(error);
      return { data: null, error: 'Erreur lors de la régénération du code' };
    }
  },

  async shareTeamCode(teamId: string): Promise<ShareTeamCodeResponse> {
    try {
      // Get the team code
      const { data: codeData, error: codeError } = await this.getTeamCodeDetails(teamId);
      if (codeError || !codeData) {
        throw new Error(codeError || 'Aucun code trouvé');
      }

      // Generate share link
      const shareLink = `https://sportconnect.app/join?team=${teamId}&code=${codeData}`;

      return {
        teamCode: codeData,
        shareLink,
        error: null
      };
    } catch (error) {
      console.error(error);
      return {
        teamCode: null,
        shareLink: null,
        error: 'Erreur lors du partage du code'
      };
    }
  }
};
