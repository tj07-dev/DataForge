/* eslint-disable @typescript-eslint/no-explicit-any */
import initSqlJs from 'sql.js';
import { TableData } from '../types/db';

export const loadDatabase = async (file: File): Promise<TableData[]> => {
  const SQL = await initSqlJs({
    locateFile: () => '/sql-wasm.wasm', // Place sql-wasm.wasm in public/
  });
  const uint8Array = new Uint8Array(await file.arrayBuffer());
  const db = new SQL.Database(uint8Array);

  const tableNames = db
    .exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )
    .map((result: { values: any[] }) =>
      result.values.map((row: any[]) => row[0])
    )
    .flat() as string[];

  const tableData: TableData[] = tableNames.map((tableName) => {
    const result = db.exec(`SELECT * FROM "${tableName}"`)[0];
    return {
      name: tableName,
      columns: result?.columns || [],
      rows: result?.values || [],
    };
  });

  return tableData;
};

export const exportToCSV = (table: TableData): string => {
  const headers = table.columns.join(',');
  const rows = table.rows
    .map((row) => row.map((cell) => `"${cell ?? ''}"`).join(','))
    .join('\n');
  return `${headers}\n${rows}`;
};

export const exportToJSON = (table: TableData): string => {
  const jsonData = table.rows.map((row) =>
    Object.fromEntries(table.columns.map((col, i) => [col, row[i]]))
  );
  return JSON.stringify(jsonData, null, 2);
};

export const exportToSQL = (db: any, tableName: string): string => {
  const createStmt = db.exec(
    `SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`
  )[0].values[0][0];
  const rows = db.exec(`SELECT * FROM "${tableName}"`)[0]?.values || [];
  const inserts = rows
    .map((row: any[]) => {
      const values = row
        .map((v: null) => (v === null ? 'NULL' : `'${v}'`))
        .join(',');
      return `INSERT INTO "${tableName}" VALUES (${values});`;
    })
    .join('\n');
  return `${createStmt};\n${inserts}`;
};
