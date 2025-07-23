import { teamService } from '../services/team.service';
import * as AuthService from '../services/auth.service';
import { v4 as uuidv4 } from 'uuid';
// import { supabase } from '../lib/supabase';
import { SQLiteService } from '../services/sqlite.service';

// Mock SQLiteService methods
jest.mock('../services/sqlite.service', () => ({
  runAsync: jest.fn().mockResolvedValue(true),
  saveTeamCode: jest.fn().mockResolvedValue(true)
}));

// Mock teamService methods
jest.mock('../services/team.service', () => ({
  __esModule: true,
  default: {
    createTeam: jest.fn(),
    regenerateTeamCode: jest.fn(),
    getAllTeams: jest.fn(),
    deleteTeam: jest.fn()
  }
}));

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset supabase mocks
  (supabase.from as jest.Mock).mockClear();
  (supabase.select as jest.Mock).mockClear();
  (supabase.insert as jest.Mock).mockClear();
  (supabase.update as jest.Mock).mockClear();
  (supabase.delete as jest.Mock).mockClear();
  (supabase.eq as jest.Mock).mockClear();
  (supabase.single as jest.Mock).mockClear();
  (supabase.rpc as jest.Mock).mockClear();
  (supabase.auth.getUser as jest.Mock).mockClear();

  // Setup default mock implementations
  (supabase.from as jest.Mock).mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis()
  });
  
  (supabase.auth.getUser as jest.Mock).mockResolvedValue({
    data: { user: { id: 'test-user-id' } },
    error: null
  });

  // Setup SQLiteService mocks
  (SQLiteService.runAsync as jest.Mock).mockResolvedValue(true);
  (SQLiteService.saveTeamCode as jest.Mock).mockResolvedValue(true);
});

const createMockSupabase = () => {
  return {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    rpc: jest.fn().mockReturnThis(),
    auth: {
      getUser: jest.fn()
    }
  };
};

jest.mock('../services/auth.service');
jest.mock('../services/supabase');
jest.mock('uuid');

describe('Team Service', () => {
  const mockTeamId = 'test-team-id';
  const mockTeamCode = 'ABC123';

  const teamData = {
    name: 'Test Team',
    description: 'Test Description',
    sport: 'Football',
    owner_id: 'user123',
    status: 'active'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    });
  });

  describe('createTeam', () => {
    it('should create a team successfully', async () => {
      (supabase.from('teams').insert as jest.Mock).mockResolvedValue({
        data: {
          id: mockTeamId,
          ...teamData,
          team_code: mockTeamCode,
          created_at: new Date().toISOString(),
        },
        error: null
      });

      const result = await teamService.createTeam(teamData);

      expect(result.data).toBeDefined();
      expect(result.data?.[0].id).toBe(mockTeamId);
      expect(result.error).toBeNull();
    });

    it('handles team creation failure', async () => {
      (supabase.from('teams').insert as jest.Mock).mockResolvedValue({
        data: null,
        error: new Error('Creation failed')
      });

      const result = await teamService.createTeam(teamData);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('regenerateTeamCode', () => {
    it('generates a new team code', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: mockTeamCode,
        error: null
      });

      const result = await teamService.regenerateTeamCode(mockTeamId);

      expect(result.data).toBe(mockTeamCode);
      expect(result.error).toBeNull();
    });

    it('handles errors', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: new Error('Failed to generate code')
      });

      const result = await teamService.regenerateTeamCode(mockTeamId);

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('getAllTeams', () => {
    it('retrieves all teams', async () => {
      const mockTeams = [{
        id: mockTeamId,
        ...teamData,
        team_code: mockTeamCode,
        created_at: new Date().toISOString()
      }];

      (supabase.from('teams').select as jest.Mock).mockResolvedValue({
        data: mockTeams,
        error: null
      });

      const result = await teamService.getAllTeams();

      expect(result.data).toBeDefined();
      expect(result.data?.length).toBeGreaterThan(0);
      });

  });
});


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
    sport: 'Football',
    owner_id: 'user123',
    status: 'active'
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
          players: '[]',
          status: 'active'
        }],
        error: null
      });

      const result = await createTeam(teamData);
      
      // Verify Supabase insertion
      expect(supabase.from('teams').insert).toHaveBeenCalled();
      
      // Verify SQLite operations
      expect(SQLiteService.runAsync).toHaveBeenCalled();
      expect(SQLiteService.saveTeamCode).toHaveBeenCalled();
      
      // Verify result
      expect(result).toBeTruthy();
      expect(result.data?.name).toBe('Test Team');
    });

    it('handles team creation failure', async () => {
      // Simulate authentication failure
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: null,
        error: { code: 'AUTH_ERROR', message: 'Authentication failed' }
      });

      const result = await createTeam(teamData);
      
      expect(result).toBeNull();
      expect(result).toBeDefined();
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

  describe('getAllTeams', () => {
    it('retrieves all teams', async () => {
      const response = await getAllTeams();
      const { data } = response;
      
      expect(data).toBeTruthy();
      expect(data.length).toBeGreaterThan(0);
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
// Removed duplicate function definition
async function regenerateTeamCode(teamId: string) {
  try {
    // Fetch the team to ensure it exists
    const { data: team, error: fetchError } = await supabase.from('teams').select('*').eq('id', teamId).single();
    if (fetchError || !team) {
      throw new Error('Team not found');
    }

    // Generate a new team code
    const newTeamCode = uuidv4().slice(0, 6).toUpperCase();

    // Update the team with the new code
    const { data: updatedTeam, error: updateError } = await supabase.from('teams').update({ team_code: newTeamCode }).eq('id', teamId).single();
    if (updateError || !updatedTeam) {
      throw new Error('Failed to update team code');
    }

    // Save the new team code in SQLite
    await SQLiteService.saveTeamCode(teamId, newTeamCode);

    return { data: newTeamCode, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
// Removed duplicate function definition
async function deleteTeam(teamId: string) {
  try {
    // Fetch the team to ensure it exists
    const { data: team, error: fetchError } = await supabase.from('teams').select('*').eq('id', teamId).single();
    if (fetchError || !team) {
      throw new Error('Team not found');
    }

    // Delete the team
    const { data: deletedData, error: deleteError } = await supabase.from('teams').delete().eq('id', teamId);
    if (deleteError) {
      throw new Error('Failed to delete team');
    }

    return { data: true, error: null };
  } catch (error) {
    return { data: false, error };
  }
}
// Removed duplicate function definition
async function createTeam(teamData: { name: string; description: string; sport: string; owner_id: string; status: string; }) {
  try {
    // Generate a unique team code
    const teamCode = uuidv4().slice(0, 6).toUpperCase();

    // Insert the new team into the database
    const { data: newTeam, error: insertError } = await supabase.from('teams').insert({
      ...teamData,
      team_code: teamCode,
      created_at: new Date().toISOString()
    }).single();

    if (insertError || !newTeam) {
      throw new Error('Failed to create team');
    }

    // Save the team code in SQLite
    await SQLiteService.saveTeamCode(newTeam.id, teamCode);

    return { data: newTeam, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
// Removed duplicate function definition
async function getAllTeams() {
  try {
    const { data: teams, error } = await supabase.from('teams').select('*');
    if (error) {
      throw new Error('Failed to retrieve teams');
    }
    return { data: teams, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
