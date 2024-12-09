import { createTeam, getLocalTeams, deleteTeam, regenerateTeamCode } from '../team.service';
import * as SQLiteService from '../sqlite.service';
import { getUserId } from '../../services/auth.service';
import { supabase } from '../../services/supabase';
import { Team, CreateTeamDTO } from '../../types/database';
import * as SQLite from 'expo-sqlite';

// Enhanced Mock for SQLite
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn().mockReturnValue({
    runAsync: jest.fn(),
    getAllAsync: jest.fn(),
  }),
}));

// Mock dependencies
jest.mock('../sqlite.service', () => ({
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
  saveTeamCode: jest.fn(),
  getTeamCode: jest.fn(),
}));

jest.mock('../../services/auth.service', () => ({
  getUserId: jest.fn()
}));

jest.mock('../../services/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user123' } }
      })
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  }
}));

// Mock UUID to generate predictable IDs
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-team-id')
}));

const mockTeamId = 'test-team-id';
const mockTeamCode = 'ABC123';

describe('Team Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SQLiteService.getTeamCode as jest.Mock).mockResolvedValue(null);
    (SQLiteService.saveTeamCode as jest.Mock).mockResolvedValue(true);
    (SQLiteService.runAsync as jest.Mock).mockResolvedValue(true);
    (SQLiteService.getAllAsync as jest.Mock).mockResolvedValue([]);
  });

  describe('createTeam', () => {
    it('should create a team successfully', async () => {
      const teamData: CreateTeamDTO = {
        name: 'Test Team', 
        sport: 'Football', 
        description: 'Test Description'
      };

      // Mock Supabase insert
      (supabase.from('teams').upsert as jest.Mock).mockResolvedValue({
        data: [{
          id: mockTeamId,
          name: teamData.name,
          sport: teamData.sport,
          description: teamData.description,
          owner_id: 'user123',
          team_code: mockTeamCode,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          players: null,
          status: 'active',
          logo_url: null,
          location: null
        }],
        error: null
      });

      const result = await createTeam(teamData);
      
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(mockTeamId);
      expect(result.data?.name).toBe(teamData.name);
      expect(result.data?.sport).toBe(teamData.sport);
      expect(result.data?.team_code).toBe(mockTeamCode);
      expect(result.error).toBeNull();
    });
  });

  describe('regenerateTeamCode', () => {
    it('generates a new team code', async () => {
      // Mock Supabase upsert for team code regeneration
      (supabase.from('teams').upsert as jest.Mock).mockResolvedValue({
        data: [{ 
          id: mockTeamId, 
          team_code: mockTeamCode 
        }],
        error: null
      });

      const result = await regenerateTeamCode(mockTeamId);
      
      expect(result).toBe(mockTeamCode);
      expect(SQLiteService.runAsync).toHaveBeenCalled();
    });

    it('handles SQLite errors', async () => {
      (SQLiteService.runAsync as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      await expect(regenerateTeamCode(mockTeamId)).rejects.toThrow('Database error');
    });
  });

  describe('getLocalTeams', () => {
    it('retrieves local teams', async () => {
      const mockTeams: Team[] = [{
        id: mockTeamId,
        team_code: mockTeamCode,
        name: 'Test Team',
        sport: 'Football',
        description: 'Test Description',
        owner_id: 'user123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        players: null,
        status: 'active',
        logo_url: null,
        location: null
      }];

      // Mock getAllAsync to return mock teams
      (SQLiteService.getAllAsync as jest.Mock).mockResolvedValue(mockTeams);

      const teams = await getLocalTeams();
      
      expect(teams.length).toBeGreaterThan(0);
      expect(teams[0].id).toBe(mockTeamId);
      expect(teams[0].team_code).toBe(mockTeamCode);
    });
  });

  describe('deleteTeam', () => {
    it('deletes a team successfully', async () => {
      (supabase.from('teams').delete as jest.Mock).mockResolvedValue({
        data: null,
        error: null
      });

      const result = await deleteTeam(mockTeamId);
      expect(result).toBe(true);
    });
  });
});
