import { supabase } from './supabase';
import type {
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  TeamMember
} from '../types/database';
import { runAsync, getFirstAsync, saveTeamCode, getAllAsync } from '../utils/sqlite';
import { syncService } from './sync.service';
import { shareContent } from '../utils/sharing';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const TEAM_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted'
} as const;

type TeamStatus = typeof TEAM_STATUS[keyof typeof TEAM_STATUS];

// Database helper functions
const fetchTeamPlayers = async (teamId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('team_players')
    .select('player_id')
    .eq('team_id', teamId);

  if (error) {
    logger.error('Error fetching team players', { error, teamId });
    return [];
  }

  return data?.map(player => player.player_id) || [];
};

const fetchTeamFromDb = async (teamId: string) => {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (error) throw error;
  return data;
};

// Main service functions
const getLocalTeams = async (): Promise<Team[]> => {
  logger.debug('Fetching local teams');

  try {
    const teamsQuery = 'SELECT * FROM teams ORDER BY created_at DESC';
    const result = await getAllAsync(teamsQuery);

    const teamsPromises = (result.rows || []).map(async (row: any) => {
      try {
        const [teamCode, playerIds] = await Promise.all([
          getTeamCode(row.id),
          fetchTeamPlayers(row.id)
        ]);

        return {
          id: row.id,
          name: row.name,
          description: row.description || '',
          sport: row.sport,
          team_code: teamCode || '',
          created_at: row.created_at,
          updated_at: row.updated_at,
          owner_id: row.owner_id,
          status: row.status || TEAM_STATUS.ACTIVE,
          logo_url: row.logo_url || '',
          location: row.location || '',
          players: playerIds
        } as Team;
      } catch (error) {
        logger.error('Error processing team data', { error, teamId: row.id });
        return undefined;
      }
    });

    const teams = await Promise.all(teamsPromises);
    return teams.filter((team): team is Team => team !== undefined);
  } catch (error) {
    logger.error('Error fetching local teams', { error });
    return [];
  }
};

const deleteTeam = async (teamId: string): Promise<boolean> => {
  try {
    await Promise.all([
      supabase.from('teams').delete().eq('id', teamId),
      runAsync('DELETE FROM teams WHERE id = ?', [teamId])
    ]);
    return true;
  } catch (error) {
    logger.error('Error deleting team', { error, teamId });
    return false;
  }
};

const createTeam = async (
  teamData: CreateTeamRequest,
  ownerId: string
): Promise<{ data: Team | undefined; error: Error | null }> => {
  try {
    const teamId = uuidv4();
    const now = new Date().toISOString();
    const teamCode = await generateUniqueTeamCode();
    
    if (!teamCode) {
      throw new Error('Failed to generate team code');
    }

    // First save to local SQLite
    const team = {
      id: teamId,
      name: teamData.name,
      description: teamData.description || '',
      sport: teamData.sport || '',
      owner_id: ownerId,
      team_code: teamCode,
      logo_url: null,
      location: null,
      created_at: now,
      updated_at: now,
      status: TEAM_STATUS.ACTIVE
    };

    // Create team in SQLite
    await runAsync(
      `INSERT INTO teams (
        id, name, description, sport, owner_id, team_code, 
        logo_url, location, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        team.id, team.name, team.description, team.sport,
        team.owner_id, team.team_code, team.logo_url,
        team.location, team.status, team.created_at,
        team.updated_at
      ]
    );

    // Create team in Supabase
    const { error: supabaseError } = await supabase
      .from('teams')
      .insert([team]);

    if (supabaseError) {
      logger.error('Error saving team to Supabase', { supabaseError });
    }

    // Add owner as team member
    const memberData = {
      team_id: teamId,
      user_id: ownerId,
      role: 'owner' as const,
      joined_at: now
    };

    // Add to SQLite
    await runAsync(
      `INSERT INTO team_members (team_id, user_id, role, joined_at)
       VALUES (?, ?, ?, ?)`,
      [memberData.team_id, memberData.user_id, memberData.role, memberData.joined_at]
    );

    // Add to Supabase
    const { error: memberError } = await supabase
      .from('team_members')
      .insert([memberData]);

    if (memberError) {
      logger.error('Error saving team member to Supabase', { memberError });
    }

    return { data: { ...team, players: [] }, error: null };
  } catch (error) {
    logger.error('Error creating team', { error });
    return { data: undefined, error: error as Error };
  }
};

const generateUniqueTeamCode = async (): Promise<string> => {
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 6 }, () => 
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  };

  let code: string;
  let isUnique = false;

  do {
    code = generateCode();
    const { data } = await supabase
      .from('teams')
      .select('id')
      .eq('team_code', code);
    
    isUnique = !data || data.length === 0;
  } while (!isUnique);

  return code;
};

const getTeamCode = async (teamId: string): Promise<string | null> => {
  try {
    const result = await getFirstAsync<{ team_code: string }>(
      'SELECT team_code FROM teams WHERE id = ?',
      [teamId]
    );
    return result?.team_code || null;
  } catch (error) {
    logger.error('Error getting team code', { error });
    return null;
  }
};

const regenerateTeamCode = async (teamId: string): Promise<string | null> => {
  try {
    const newCode = await generateUniqueTeamCode();
    if (!newCode) {
      throw new Error('Failed to generate new team code');
    }

    // Update locally first
    await saveTeamCode(teamId, newCode);

    // Then sync with Supabase
    const { error } = await supabase
      .from('teams')
      .update({ team_code: newCode, updated_at: new Date().toISOString() })
      .eq('id', teamId);

    if (error) {
      logger.error('Error updating team code in Supabase', { error });
      // Don't throw here since we already updated locally
    }

    return newCode;
  } catch (error) {
    logger.error('Error regenerating team code', { error });
    return null;
  }
};

const shareTeamCode = async (teamId: string) => {
  try {
    const team = await fetchTeamFromDb(teamId);
    if (!team?.team_code) {
      throw new Error('Team code not found');
    }

    return {
      teamCode: team.team_code,
      shareLink: `https://sport-connect.app/join?code=${team.team_code}`
    };
  } catch (error) {
    logger.error('Error sharing team code', { error, teamId });
    throw error;
  }
};

const shareTeamCodeByTeamId = async (teamId: string): Promise<void> => {
  const { shareLink } = await shareTeamCode(teamId);
  if (shareLink) {
    await shareContent(shareLink, 'Sport Connect Team Code');
  }
};

// Export individual functions for direct use in components
export { 
  createTeam,
  regenerateTeamCode,
  shareTeamCode,
  shareTeamCodeByTeamId,
  getTeamCode,
  getLocalTeams,
  deleteTeam
};

// Export TeamService object for use in hooks
export const TeamService = {
  fetchTeamPlayers,
  fetchTeamFromDb,
  getLocalTeams,
  deleteTeam,
  createTeam,
  generateUniqueTeamCode,
  shareTeamCode,
  shareTeamCodeByTeamId,
  regenerateTeamCode,
  getTeamCode,
  getUserTeams: getLocalTeams,
  getTeam: fetchTeamFromDb,
  getTeamMembers: fetchTeamPlayers,
  updateTeam: async (teamId: string, data: UpdateTeamRequest) => {
    // TODO: Implement updateTeam
    throw new Error('Not implemented');
  },
  addPlayer: async (teamId: string, data: CreatePlayerRequest) => {
    // TODO: Implement addPlayer
    throw new Error('Not implemented');
  },
  updatePlayer: async (teamId: string, playerId: string, data: UpdatePlayerRequest) => {
    // TODO: Implement updatePlayer
    throw new Error('Not implemented');
  },
  removePlayer: async (teamId: string, playerId: string) => {
    // TODO: Implement removePlayer
    throw new Error('Not implemented');
  },
  joinTeamWithCode: async (code: string) => {
    // TODO: Implement joinTeamWithCode
    throw new Error('Not implemented');
  },
  handleJoinRequest: async (teamId: string, userId: string, accept: boolean) => {
    // TODO: Implement handleJoinRequest
    throw new Error('Not implemented');
  }
};