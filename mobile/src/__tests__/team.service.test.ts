import { createTeam, regenerateTeamCode, getLocalTeams, deleteTeam } from '../services/team.service';
import * as SQLiteService from '../services/sqlite.service';
import * as AuthService from '../services/auth.service';
import { v4 as uuidv4 } from 'uuid';
import { syncService } from '../services/sync.service';
import * as SQLite from 'expo-sqlite';

// Mock SQLite service
jest.mock('../services/sqlite.service', () => ({
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
  saveTeamCode: jest.fn(),
  getTeamCode: jest.fn()
}));

// Mock sync service
jest.mock('../services/sync.service', () => ({
  syncService: {
    queueForSync: jest.fn()
  }
}));

// Mock SQLite
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn().mockReturnValue({
    runAsync: jest.fn(),
    getAllAsync: jest.fn().mockResolvedValue([{ 
      id: 'test-team-id',
      name: 'Test Team',
      sport: 'Football',
      team_code: 'TEST123',
      created_at: new Date().toISOString(),
      owner_id: 'user123',
      players: JSON.stringify([]),
      status: 'active',
      updated_at: null
    }])
  })
}));

// Create a factory function for the mock supabase
const createMockSupabase = () => {
  const mockChain = {
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    insert: jest.fn().mockReturnThis()
  };

  const mockSupabase = {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { 
          user: { 
            id: 'user123' 
          } 
        },
        error: null
      })
    },
    from: jest.fn((tableName: string) => {
      // Simulate method chaining
      mockChain.select.mockReturnValue(mockChain);
      mockChain.update.mockReturnValue(mockChain);
      mockChain.delete.mockReturnValue(mockChain);
      mockChain.upsert.mockReturnValue(mockChain);
      mockChain.match.mockReturnValue(mockChain);
      mockChain.eq.mockReturnValue(mockChain);
      mockChain.limit.mockReturnValue(mockChain);
      mockChain.insert.mockReturnValue(mockChain);

      // Add a mock resolution to the last method in the chain
      jest.spyOn(mockChain, 'select').mockResolvedValue({
        data: [{ 
          id: 'test-team-id', 
          team_code: 'TEST123',
          name: 'Test Team',
          description: 'Test Description',
          sport: 'Football',
          owner_id: 'user123'
        }],
        error: null
      });

      jest.spyOn(mockChain, 'upsert').mockResolvedValue({
        data: [{
          id: 'test-team-id',
          name: 'Test Team',
          team_code: 'NEW123'
        }],
        error: null
      });

      jest.spyOn(mockChain, 'delete').mockResolvedValue({
        data: null,
        error: null
      });

      jest.spyOn(mockChain, 'update').mockResolvedValue({
        data: [{
          id: 'test-team-id',
          team_code: 'NEW123'
        }],
        error: null
      });

      jest.spyOn(mockChain, 'insert').mockResolvedValue({
        data: [{
          id: 'test-team-id',
          name: 'Test Team',
          team_code: 'NEW123'
        }],
        error: null
      });

      return {
        select: jest.fn().mockReturnValue(mockChain),
        update: jest.fn().mockReturnValue(mockChain),
        delete: jest.fn().mockReturnValue(mockChain),
        upsert: jest.fn().mockReturnValue(mockChain),
        match: jest.fn().mockReturnValue(mockChain),
        eq: jest.fn().mockReturnValue(mockChain),
        limit: jest.fn().mockReturnValue(mockChain),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        insert: jest.fn().mockReturnValue(mockChain)
      };
    })
  };

  return mockSupabase;
};

// Create a mock supabase instance
const supabase = createMockSupabase();

// Reset mocks before each test
beforeEach(() => {
  // Reset mocks to default behavior
  jest.clearAllMocks();

  // Reset authentication mock
  (supabase.auth.getUser as jest.Mock).mockClear();
  (supabase.auth.getUser as jest.Mock).mockResolvedValue({
    data: { 
      user: { 
        id: 'user123' 
      } 
    },
    error: null
  });

  // Reset Supabase mocks
  (supabase.from('teams').select as jest.Mock).mockClear();
  (supabase.from('teams').select as jest.Mock).mockResolvedValue({
    data: [{ 
      id: 'test-team-id', 
      team_code: 'TEST123',
      name: 'Test Team',
      description: 'Test Description',
      sport: 'Football',
      owner_id: 'user123'
    }],
    error: null
  });

  (supabase.from('teams').update as jest.Mock).mockClear();
  (supabase.from('teams').update as jest.Mock).mockResolvedValue({
    data: [{ 
      id: 'test-team-id', 
      team_code: 'NEW123' 
    }],
    error: null
  });

  (supabase.from('teams').delete as jest.Mock).mockClear();
  (supabase.from('teams').delete as jest.Mock).mockResolvedValue({
    data: null,
    error: null
  });

  (supabase.from('teams').insert as jest.Mock).mockClear();
  (supabase.from('teams').insert as jest.Mock).mockResolvedValue({
    data: [{
      id: 'test-team-id',
      name: 'Test Team',
      team_code: 'NEW123'
    }],
    error: null
  });
});

jest.mock('../services/supabase', () => ({
  supabase: createMockSupabase()
}));

describe('Team Service', () => {
  const teamData = {
    name: 'Test Team',
    description: 'Test Description',
    sport: 'Football'
  };

  const mockTeamId = 'test-team-id';

  describe('createTeam', () => {
    it('should create a team successfully', async () => {
      // Mock SQLite operations
      (SQLiteService.runAsync as jest.Mock).mockResolvedValue(true);
      (SQLiteService.saveTeamCode as jest.Mock).mockResolvedValue(true);

      // Mock Supabase operations
      (supabase.from('teams').insert as jest.Mock).mockResolvedValue({
        data: [{
          id: expect.any(String),
          name: 'Test Team',
          description: 'Test Description',
          sport: 'Football',
          team_code: expect.any(String),
          owner_id: 'user123',
          players: '[]'
        }],
        error: null
      });

      const result = await createTeam(teamData, 'user123');
      
      // Verify Supabase insertion
      expect(supabase.from('teams').insert).toHaveBeenCalled();
      
      // Verify SQLite operations
      expect(SQLiteService.runAsync).toHaveBeenCalled();
      expect(SQLiteService.saveTeamCode).toHaveBeenCalled();
      
      // Verify result
      expect(result.data).toBeTruthy();
      expect(result.data?.name).toBe('Test Team');
      expect(result.error).toBeNull();
    });

    it('handles team creation failure', async () => {
      // Simulate authentication failure
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: null,
        error: { code: 'AUTH_ERROR', message: 'Authentication failed' }
      });

      const result = await createTeam(teamData, 'user123');
      
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      if (result.error instanceof Error) {
        expect(result.error.message).toContain('Error code');
      }
    });
  });

  describe('regenerateTeamCode', () => {
    it('generates a new team code', async () => {
      // Simulate successful team code regeneration
      (supabase.from('teams').select as jest.Mock).mockResolvedValue({
        data: [{ 
          id: 'test-team-id', 
          name: 'Test Team',
          owner_id: 'user123'
        }],
        error: null
      });

      (supabase.from('teams').update as jest.Mock).mockResolvedValue({
        data: [{ 
          id: 'test-team-id', 
          team_code: 'NEW123' 
        }],
        error: null
      });

      const result = await regenerateTeamCode(mockTeamId);
      
      expect(result).toBeTruthy();
      expect(result).toBe('NEW123');
    });

    it('handles Supabase errors', async () => {
      // Simulate Supabase error during team code regeneration
      (supabase.from('teams').select as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Team not found' }
      });

      const result = await regenerateTeamCode(mockTeamId);
      
      expect(result).toBeNull();
    });
  });

  describe('getLocalTeams', () => {
    it('retrieves local teams', async () => {
      const localTeams = await getLocalTeams();
      
      expect(localTeams).toBeTruthy();
      expect(localTeams.length).toBeGreaterThan(0);
    });
  });

  describe('deleteTeam', () => {
    it('deletes a team successfully', async () => {
      // Simulate successful team deletion
      (supabase.from('teams').select as jest.Mock).mockResolvedValue({
        data: [{ 
          id: 'test-team-id', 
          owner_id: 'user123'
        }],
        error: null
      });

      (supabase.from('teams').delete as jest.Mock).mockResolvedValue({
        data: null,
        error: null
      });

      const result = await deleteTeam(mockTeamId);
      
      expect(result).toBe(true);
    });

    it('handles delete team failure', async () => {
      // Simulate team not found
      (supabase.from('teams').select as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Team not found' }
      });

      const result = await deleteTeam(mockTeamId);
      
      expect(result).toBe(false);
    });
  });
});
