// Removed import statement due to the file not being a module
// Import statement removed as per the instructions

const mockRunAsync = jest.fn();
const mockGetAllAsync = jest.fn();

const mockDatabaseSync = {
  runAsync: mockRunAsync,
  getAllAsync: mockGetAllAsync,
};

// Function to create a mock result set for SQLite operations
const createMockResultSet = (rows: any[] = []): any => ({
  rows: {
    _array: rows,
    length: rows.length,
    item: (index: number) => rows[index] || null,
  },
  insertId: 0,
  rowsAffected: rows.length,
});

const createMockError = (message: string): Error => ({
  name: 'MockError',
  message,
});

const mock = {
  __esModule: true,
  default: {
    openDatabaseSync: jest.fn().mockReturnValue(mockDatabaseSync),
  },
  openDatabaseSync: jest.fn().mockReturnValue(mockDatabaseSync),
  mockRunAsync,
  mockGetAllAsync,
  createMockResultSet,
  createMockError,
};

export default mock;
