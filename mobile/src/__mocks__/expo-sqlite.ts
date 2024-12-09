import { SQLResultSet, SQLError } from '../types/sqlite';

const mockRunAsync = jest.fn();
const mockGetAllAsync = jest.fn();

const mockDatabaseSync = {
  runAsync: mockRunAsync,
  getAllAsync: mockGetAllAsync,
};

const createMockResultSet = (rows: any[] = []): SQLResultSet => ({
  rows: {
    _array: rows,
    length: rows.length,
    item: (index: number) => rows[index] || null,
  },
  insertId: 0,
  rowsAffected: rows.length,
});

const createMockError = (message: string): SQLError => ({
  message,
  code: 0,
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
