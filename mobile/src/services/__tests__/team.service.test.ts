import { teamService } from '../team.service';
import { SQLiteService } from '../sqlite.service';

// Mock Supabase client with custom type
interface MockSupabaseClient {
  from: jest.Mock;
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  single: jest.Mock;
  upsert: jest.Mock;
  order: jest.Mock;
}

const supabase = jest.mocked<MockSupabaseClient>({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis()
});

// Mock data
const mockTeamId = 'team-123';
const mockTeamCode = 'ABC123';
const mockTeamData = {
  id: mockTeamId,
  name: 'Test Team',
  sport: 'Football',
  description: 'Test description',
  owner_id: 'user-123',
  status: 'active'
};

// Mock SQLiteService
jest.mock('../sqlite.service', () => ({
  SQLiteService: {
    runAsync: jest.fn(),
    saveTeamCode: jest.fn()
  }
}));

describe('Team Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configure mock responses
    supabase.select.mockResolvedValue({ data: [mockTeamData], error: null });
    supabase.insert.mockResolvedValue({ data: mockTeamData, error: null });
    supabase.update.mockResolvedValue({ data: mockTeamData, error: null });
    supabase.delete.mockResolvedValue({ error: null });
    supabase.upsert.mockResolvedValue({ data: { code: mockTeamCode }, error: null });
  });

  describe('createTeam', () => {
    it('should create a team successfully', async () => {
      const result = await teamService.createTeam(mockTeamData);

      expect(result).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data).toMatchObject([mockTeamData]);
      expect(supabase.from).toHaveBeenCalledWith('teams');
      expect(supabase.insert).toHaveBeenCalledWith([mockTeamData]);
      expect(SQLiteService.runAsync).toHaveBeenCalled();
    });

    it('should handle errors when creating a team', async () => {
      const errorMessage = 'Database error';
      supabase.insert.mockRejectedValue(new Error(errorMessage));

      const result = await teamService.createTeam(mockTeamData);

      expect(result).toBeDefined();
      expect(result.error).toBeDefined();
      expect(result.data).toBeNull();
    });
  });

  describe('regenerateTeamCode', () => {
    it('should generate a new team code', async () => {
      const result = await teamService.regenerateTeamCode(mockTeamId);

      expect(result).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data).toBe(mockTeamCode);
      expect(supabase.from).toHaveBeenCalledWith('team_codes');
      expect(supabase.upsert).toHaveBeenCalledWith({
        team_id: mockTeamId,
        code: expect.any(String)
      });
      expect(SQLiteService.saveTeamCode).toHaveBeenCalled();
    });

    it('should handle errors when regenerating team code', async () => {
      const errorMessage = 'Database error';
      supabase.upsert.mockRejectedValue(new Error(errorMessage));

      const result = await teamService.regenerateTeamCode(mockTeamId);

      expect(result).toBeDefined();
      expect(result.error).toBeDefined();
      expect(result.data).toBeNull();
    });
  });

  describe('getAllTeams', () => {
    it('should retrieve teams successfully', async () => {
      const result = await teamService.getAllTeams();

      expect(result).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBeTruthy();
      expect(result.data?.length).toBeGreaterThan(0);
      expect(supabase.from).toHaveBeenCalledWith('teams');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(SQLiteService.runAsync).toHaveBeenCalled();
    });

    it('should handle empty results', async () => {
      supabase.select.mockResolvedValue({ data: [], error: null });

      const result = await teamService.getAllTeams();

      expect(result).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data?.length).toBe(0);
    });

    it('should handle errors when retrieving teams', async () => {
      const errorMessage = 'Database error';
      supabase.select.mockRejectedValue(new Error(errorMessage));

      const result = await teamService.getAllTeams();

      expect(result).toBeDefined();
      expect(result.error).toBeDefined();
      expect(result.data).toBeNull();
    });
  });

  describe('deleteTeam', () => {
    it('should delete a team successfully', async () => {
      const result = await teamService.deleteTeam(mockTeamId);

      expect(result).toBeDefined();
      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('teams');
      expect(supabase.delete).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith('id', mockTeamId);
      expect(SQLiteService.runAsync).toHaveBeenCalled();
    });

    it('should handle errors when deleting a team', async () => {
      const errorMessage = 'Database error';
      supabase.delete.mockRejectedValue(new Error(errorMessage));

      const result = await teamService.deleteTeam(mockTeamId);

      expect(result).toBeDefined();
      expect(result.error).toBeDefined();
    });
  });

  describe('shareTeamCode', () => {
    beforeEach(() => {
      jest.spyOn(teamService, 'getTeamCodeDetails')
        .mockResolvedValue({ data: mockTeamCode, error: null });
    });

    it('should generate share link successfully', async () => {
      const result = await teamService.shareTeamCode(mockTeamId);

      expect(result).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.teamCode).toBe(mockTeamCode);
      expect(result.shareLink).toBe(
        `https://sportconnect.app/join?team=${mockTeamId}&code=${mockTeamCode}`
      );
      expect(teamService.getTeamCodeDetails).toHaveBeenCalledWith(mockTeamId);
    });

    it('should handle errors when getting team code', async () => {
      const errorMessage = 'Code not found';
      jest.spyOn(teamService, 'getTeamCodeDetails')
        .mockResolvedValue({ data: null, error: errorMessage });

      const result = await teamService.shareTeamCode(mockTeamId);

      expect(result).toBeDefined();
      expect(result.error).toBeDefined();
      expect(result.teamCode).toBeNull();
      expect(result.shareLink).toBeNull();
    });
  });
});
