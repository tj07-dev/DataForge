/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TableData {
  name: string;
  columns: string[];
  rows: any[][];
}

export interface RowData {
  [key: string]: any;
}

export interface UndoAction {
  type: 'row' | 'table';
  tableName: string;
  data: any;
  index?: number;
}
