export interface SQLTransaction {
  executeSql: (
    sqlStatement: string,
    args?: any[],
    callback?: (transaction: SQLTransaction, resultSet: SQLResultSet) => void,
    errorCallback?: (transaction: SQLTransaction, error: SQLError) => void
  ) => void;
}

export interface SQLResultSet {
  insertId: number;
  rowsAffected: number;
  rows: {
    _array: any[];
    length: number;
    item(index: number): any;
  };
}

export interface SQLError {
  code: number;
  message: string;
}

export interface SQLiteDatabase {
  transaction(
    callback: (transaction: SQLTransaction) => void,
    error?: (error: SQLError) => void,
    success?: () => void
  ): void;
  readTransaction(
    callback: (transaction: SQLTransaction) => void,
    error?: (error: SQLError) => void,
    success?: () => void
  ): void;
}
