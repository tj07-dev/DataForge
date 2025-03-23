/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Download,
  Edit,
  Loader2,
  Moon,
  Plus,
  Search,
  Sun,
  Table as TableIcon,
  TimerReset,
  Trash2,
  Undo2,
  Upload,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import initSqlJs from 'sql.js';
import Loader from '../components/Loader';
import { Modal } from '../components/Modal';
import { useTheme } from '../contexts/ThemeContext';
import { RowData, TableData, UndoAction } from '../types/db';
import { exportToCSV, exportToJSON, exportToSQL } from '../utils/dbUtils';

const DatabaseExplorer: React.FC = () => {
  const [tables, setTables] = useState<TableData[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dbInstance, setDbInstance] = useState<any>(null);
  const [showModal, setShowModal] = useState<'add' | 'edit' | 'export' | null>(
    null
  );
  const [editRowIndex, setEditRowIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<RowData>({});
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>(
    {}
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<string | null>(null);
  const [exportFilename, setExportFilename] =
    useState<string>('modified_database');
  const [isErrorExpanded, setIsErrorExpanded] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const resizingRef = useRef<{
    column: string;
    startX: number;
    startWidth: number;
  } | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const handleCloseModal = () => {
    console.log('Closing modal, resetting states');
    setShowModal(null);
    setExportFormat(null); // Reset export format
    setEditRowIndex(null); // Reset edit index
    setFormData({}); // Reset form data
  };
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const SQL = await initSqlJs({ locateFile: () => './sql-wasm.wasm' });
      let db = new SQL.Database();

      if (file.name.endsWith('.sql')) {
        const sqlText = await file.text();
        const cleanedSql = sqlText
          .replace(/--.*$/gm, '')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/`/g, '"');
        const statements = cleanedSql
          .split(';')
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !s.match(/^\s*$/));

        if (statements.length === 0)
          throw new Error('No valid SQL statements found in the file.');

        const createdTables = new Set<string>();
        for (let statement of statements) {
          try {
            statement = statement
              .replace(/\bAUTO_INCREMENT\b/gi, 'AUTOINCREMENT')
              .replace(/\bUNSIGNED\b/gi, '')
              .replace(/\bENUM\([^)]+\)/gi, 'TEXT')
              .replace(/\bCHARACTER SET [^ ]+/gi, '')
              .replace(/\bCOLLATE [^ ]+/gi, '');
            db.run(statement);
            const createMatch = statement.match(
              /CREATE\s+TABLE\s+"?([^"\s]+)"?/i
            );
            if (createMatch) createdTables.add(createMatch[1]);
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            if (
              statement.toLowerCase().includes('insert into') &&
              errMsg.includes('no such table')
            ) {
              const tableNameMatch = statement.match(
                /insert into "?([^"\s]+)"?/i
              );
              if (tableNameMatch) {
                const tableName = tableNameMatch[1];
                if (!createdTables.has(tableName)) {
                  const columnsMatch = statement.match(/\(([^)]+)\)/);
                  const valuesMatch = statement.match(/VALUES\s*\(([^)]+)\)/i);
                  if (columnsMatch && valuesMatch) {
                    const columns = columnsMatch[1]
                      .split(',')
                      .map((col) => col.trim().replace(/"/g, ''));
                    const values = valuesMatch[1]
                      .split(',')
                      .map((v) => v.trim());
                    const columnDefs = columns.map((col, idx) => {
                      const val = values[idx].trim();
                      if (val.match(/^\d+$/)) return `"${col}" INTEGER`;
                      if (val.match(/^\d+\.\d+$/)) return `"${col}" REAL`;
                      return `"${col}" TEXT`;
                    });
                    const createTableStmt = `CREATE TABLE "${tableName}" (${columnDefs.join(', ')})`;
                    db.run(createTableStmt);
                    createdTables.add(tableName);
                    db.run(statement);
                  }
                }
              }
            } else {
              console.warn(
                `Skipping invalid SQL statement: ${statement}`,
                errMsg
              );
              setError((prev) => (prev ? `${prev}\n${errMsg}` : errMsg));
            }
          }
        }

        for (const statement of statements) {
          if (
            statement.toLowerCase().includes('insert into') &&
            statement.includes('),(')
          ) {
            const tableNameMatch = statement.match(
              /insert into "?([^"\s]+)"?/i
            );
            if (tableNameMatch) {
              const tableName = tableNameMatch[1];
              const columnsMatch = statement.match(/\(([^)]+)\)/);
              const valuesSection = statement.match(/VALUES\s*([\s\S]+)/i)?.[1];
              if (columnsMatch && valuesSection) {
                const columns = columnsMatch[1]
                  .split(',')
                  .map((col) => col.trim().replace(/"/g, ''));
                const valueRows = valuesSection
                  .split('),')
                  .map((row) => row.replace(/^\s*\(|\)\s*$/g, '').trim())
                  .filter((row) => row.length > 0);
                for (const row of valueRows) {
                  const values = row.split(',').map((v) => v.trim());
                  const placeholders = columns.map(() => '?').join(', ');
                  const insertStmt = `INSERT INTO "${tableName}" ("${columns.join('", "')}") VALUES (${placeholders})`;
                  db.run(insertStmt, values);
                }
              }
            }
          }
        }
      } else {
        const uint8Array = new Uint8Array(await file.arrayBuffer());
        db = new SQL.Database(uint8Array);
      }

      const tableNames = db
        .exec(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        )
        .map((result) => result.values.map((row) => row[0]))
        .flat() as string[];

      if (tableNames.length === 0)
        throw new Error(
          'No tables found in the database after processing the file.'
        );

      const tableData: TableData[] = tableNames.map((tableName) => {
        const result = db.exec(`SELECT * FROM "${tableName}"`)[0];
        return {
          name: tableName,
          columns: result?.columns || [],
          rows: result?.values || [],
        };
      });

      setDbInstance(tableData.length > 0 ? db : null);
      setTables(tableData);
      setSelectedTable(tableData[0]?.name || null);
      setError(null);
      toast.success('Database loaded successfully!');
    } catch (err) {
      setError(
        'Error processing file: ' +
          (err instanceof Error ? err.message : String(err))
      );
      toast.error('Failed to load file');
      setTables([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAndLoadDatabase = async () => {
      try {
        const response = await fetch('./sample.sql');
        if (response.ok) {
          const blob = await response.blob();
          const file = new File([blob], 'sample.sql');
          handleFileUpload(file);
        }
      } catch (err) {
        console.error('Error checking or loading the database:', err);
      }
    };
    checkAndLoadDatabase();
  }, []);

  const refreshTableData = () => {
    if (!dbInstance || !selectedTable) return;
    const result = dbInstance.exec(`SELECT * FROM "${selectedTable}"`)[0];
    setTables(
      tables.map((t) =>
        t.name === selectedTable ? { ...t, rows: result?.values || [] } : t
      )
    );
  };

  const handleAddRow = () => {
    if (!selectedTable || !dbInstance) return;
    const columns = tables.find((t) => t.name === selectedTable)?.columns || [];
    const values = columns.map((col) => formData[col] ?? null);
    try {
      dbInstance.run(
        `INSERT INTO "${selectedTable}" VALUES (${columns.map(() => '?').join(',')})`,
        values
      );
      refreshTableData();
      setShowModal(null);
      toast.success('Row added successfully!');
    } catch (err) {
      toast.error('Failed to add row');
    }
  };

  const handleEditRow = () => {
    if (!selectedTable || !dbInstance || editRowIndex === null) return;
    const columns = tables.find((t) => t.name === selectedTable)?.columns || [];
    const setClause = columns.map((col) => `"${col}" = ?`).join(', ');
    const values = columns.map((col) => formData[col] ?? null);
    try {
      dbInstance.run(
        `UPDATE "${selectedTable}" SET ${setClause} WHERE ROWID = ?`,
        [...values, editRowIndex + 1]
      );
      refreshTableData();
      setShowModal(null);
      toast.success('Row updated successfully!');
    } catch (err) {
      toast.error('Failed to update row');
    }
  };

  const handleDeleteTable = (tableName: string) => {
    if (
      !dbInstance ||
      !confirm(`Are you sure you want to delete the table "${tableName}"?`)
    )
      return;
    try {
      const tableData = tables.find((t) => t.name === tableName);
      dbInstance.run(`DROP TABLE "${tableName}"`);
      setUndoStack([
        ...undoStack,
        { type: 'table', tableName, data: tableData },
      ]);
      const newTables = tables.filter((t) => t.name !== tableName);
      setTables(newTables);
      setSelectedTable(newTables.length > 0 ? newTables[0].name : null);
      toast.success(`Table "${tableName}" deleted successfully!`);
    } catch (err) {
      toast.error('Failed to delete table');
    }
  };
  const handleDeleteRow = (rowIndex: number) => {
    if (!selectedTable || !dbInstance) return;
    try {
      // Fetch the actual ROWID for the row at the given index
      const rowIdResult = dbInstance.exec(
        `SELECT ROWID FROM "${selectedTable}" LIMIT 1 OFFSET ${rowIndex}`
      );
      if (!rowIdResult[0]?.values[0]) {
        throw new Error('Row not found');
      }
      const rowId = rowIdResult[0].values[0][0];
      const rowData = tables.find((t) => t.name === selectedTable)?.rows[
        rowIndex
      ];

      // Delete the row using the actual ROWID
      dbInstance.run(`DELETE FROM "${selectedTable}" WHERE ROWID = ?`, [rowId]);
      setUndoStack([
        ...undoStack,
        {
          type: 'row',
          tableName: selectedTable,
          data: rowData,
          index: rowIndex,
        },
      ]);
      refreshTableData();
      toast.success('Row deleted successfully!');
    } catch (err) {
      console.error('Delete row error:', err);
      toast.error('Failed to delete row');
    }
  };

  const handleUndo = () => {
    if (!dbInstance || undoStack.length === 0) return;
    const lastAction = undoStack[undoStack.length - 1];
    try {
      if (lastAction.type === 'row' && lastAction.index !== undefined) {
        const columns =
          tables.find((t) => t.name === lastAction.tableName)?.columns || [];
        dbInstance.run(
          `INSERT INTO "${lastAction.tableName}" VALUES (${columns.map(() => '?').join(',')})`,
          lastAction.data
        );
        // const rowIdResult = dbInstance.exec(
        //   `SELECT ROWID FROM "${lastAction.tableName}" ORDER BY ROWID DESC LIMIT 1`
        // );
        // const newRowId = rowIdResult[0]?.values[0]?.[0];
        // console.log(newRowId);
        toast.success('Row restored successfully!');
        // Scroll to the restored row
        // setTimeout(() => {
        //   const tableElement = document.querySelector('table');
        //   const restoredRow =
        //     tableElement?.querySelectorAll('tbody tr')[newRowId];
        //   restoredRow?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // }, 100);
      }
      setUndoStack(undoStack.slice(0, -1));
      refreshTableData();
    } catch (err) {
      toast.error('Failed to undo action');
    }
  };

  const handleClearDatabase = () => {
    if (
      !dbInstance ||
      !confirm(
        'Are you sure you want to clear the entire database? This cannot be undone.'
      )
    )
      return;
    setDbInstance(null);
    setTables([]);
    setSelectedTable(null);
    setUndoStack([]);
    setError(null);
    toast.success('Database cleared successfully!');
  };

  const exportDatabase = (
    format: 'sqlite' | 'csv' | 'json' | 'sql' | 'full-db' | 'full-sql',
    filename?: string
  ) => {
    if (!dbInstance) return;

    let blob: Blob;
    let defaultFilename: string;

    if (format === 'full-db' || format === 'full-sql') {
      if (format === 'full-db') {
        blob = new Blob([dbInstance.export()], {
          type: 'application/x-sqlite3',
        });
        defaultFilename = `${filename || exportFilename}.db`;
      } else {
        const allSql = tables
          .map((table) => exportToSQL(dbInstance, table.name))
          .join('\n\n');
        blob = new Blob([allSql], { type: 'text/sql' });
        defaultFilename = `${filename || exportFilename}.sql`;
      }
    } else if (!selectedTable) {
      toast.error('Please select a table to export in this format.');
      return;
    } else {
      const table = tables.find((t) => t.name === selectedTable);
      switch (format) {
        case 'sqlite':
          blob = new Blob([dbInstance.export()], {
            type: 'application/x-sqlite3',
          });
          defaultFilename = `${selectedTable}.db`;
          break;
        case 'csv':
          blob = new Blob([exportToCSV(table!)], { type: 'text/csv' });
          defaultFilename = `${selectedTable}.csv`;
          break;
        case 'json':
          blob = new Blob([exportToJSON(table!)], { type: 'application/json' });
          defaultFilename = `${selectedTable}.json`;
          break;
        case 'sql':
          blob = new Blob([exportToSQL(dbInstance, selectedTable)], {
            type: 'text/sql',
          });
          defaultFilename = `${selectedTable}.sql`;
          break;
        default:
          return;
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultFilename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(
      `Exported as ${format === 'full-db' ? 'Full Database (SQLite)' : format === 'full-sql' ? 'Full Database (SQL)' : format.toUpperCase()} successfully!`
    );
  };

  const handleExportWithCustomName = (format: 'full-db' | 'full-sql') => {
    setExportFormat(format);
    setExportFilename('modified_database');
    setShowModal('export');
  };

  const startResizing = (e: React.MouseEvent, column: string) => {
    const th = (e.target as HTMLElement).closest('th');
    if (!th) return;
    const startWidth = columnWidths[column] || th.offsetWidth;
    resizingRef.current = { column, startX: e.pageX, startWidth };
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResizing);
  };

  const handleResize = (e: MouseEvent) => {
    if (!resizingRef.current) return;
    const { column, startX, startWidth } = resizingRef.current;
    const newWidth = Math.max(100, startWidth + (e.pageX - startX));
    setColumnWidths((prev) => ({ ...prev, [column]: newWidth }));
  };

  const stopResizing = () => {
    resizingRef.current = null;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResizing);
  };

  const filterRows = (rows: any[][]) =>
    searchQuery
      ? rows.filter((row) =>
          row.some((cell) =>
            String(cell).toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      : rows;

  return (
    <div
      className={`min-h-[90vh] max-h-[90vh] my-4 md:mx-auto border m-2 md:w-8/10 sm rounded-2xl backdrop-filter backdrop-blur-sm flex flex-col transition-colors duration-300 ${showModal ? 'overflow-hidden z-1' : 'overflow-y-scroll'} hide-scrollbar`}
    >
      <header className="bg-white dark:bg-black p-4 shadow-md sticky rounded-2xl top-0 z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full mx-auto gap-4">
          {/* Left Section - Logo */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <h1 className="text-2xl font-bold flex items-center">
              <TableIcon className="mr-2 h-6 w-6" /> DataForge
            </h1>

            {/* Mobile Menu Button */}
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="md:hidden p-2 rounded-md border hover:border-amber-300 dark:hover:border-blue-300 transition-colors duration-200"
              >
                {theme === 'light' ? (
                  <Moon className="h-6 w-6" />
                ) : (
                  <Sun className="h-6 w-6" />
                )}
              </button>

              <label
                className="flex md:hidden items-center px-4 py-2 border rounded-lg cursor-pointer hover:border-[#10b981] hover:text-[#10b981] transition-colors duration-200"
                title="Upload another file"
              >
                {isLoading ? (
                  <Loader2 className=" h-4 w-4" />
                ) : (
                  <Upload className=" h-4 w-4" />
                )}
                <input
                  type="file"
                  accept=".db,.sqlite,.sqlite3,.sql"
                  onChange={(e) =>
                    e.target.files && handleFileUpload(e.target.files[0])
                  }
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg border md:hidden hover:border-[#10b981]"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Section - Desktop Controls */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md border hover:border-amber-300 dark:hover:border-blue-300 transition-colors duration-200"
            >
              {theme === 'light' ? (
                <Moon className="h-6 w-6" />
              ) : (
                <Sun className="h-6 w-6" />
              )}
            </button>

            {dbInstance && (
              <button
                onClick={handleClearDatabase}
                className="px-4 py-2 border border-red-500 rounded-lg text-red-500 hover:bg-red-700 hover:text-current flex items-center transition-colors duration-200"
              >
                <TimerReset className="mr-2 h-4 w-4" /> Reset
              </button>
            )}
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              {...{
                className:
                  'w-full gap-2 flex-wrap md:hidden space-y-1 border-b  mt-2 flex flex-col',
              }}
            >
              <div>
                {selectedTable && (
                  <div className=" flex md:flex-row flex-col justify-between items-center gap-4 md:flex-3">
                    <div
                      className="flex flex-wrap gap-2 flex-1 justify-start  md:justify-end"
                      style={{ width: '-webkit-fill-available' }}
                    >
                      <label
                        className="flex items-center px-4 py-2 border rounded-lg cursor-pointer hover:border-[#10b981] hover:text-[#10b981] transition-colors duration-200"
                        title="Upload another file"
                      >
                        {isLoading ? (
                          <Loader2 className=" h-4 w-4" />
                        ) : (
                          <Upload className=" h-4 w-4" />
                        )}
                        <input
                          type="file"
                          accept=".db,.sqlite,.sqlite3,.sql"
                          onChange={(e) =>
                            e.target.files &&
                            handleFileUpload(e.target.files[0])
                          }
                          className="hidden"
                          disabled={isLoading}
                        />
                      </label>

                      {undoStack.length > 0 && (
                        <button
                          onClick={handleUndo}
                          disabled={undoStack.length <= 0}
                          className="px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-700 disabled:border-gray-600 disabled:text-gray-600 text-gray-200 flex items-center transition-colors duration-200"
                        >
                          <Undo2 className="mr-2 h-4 w-4" /> Undo
                        </button>
                      )}
                      <div
                        className="relative"
                        ref={exportMenuRef}
                        title="Export Data"
                      >
                        <button
                          onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                          className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-700 hover:text-current flex items-center transition-colors duration-200"
                        >
                          <Download className="h-6 w-4" />
                        </button>

                        {isExportMenuOpen && (
                          <div className="absolute bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-2 left-0 z-10 w-[12rem]">
                            {[
                              {
                                label: 'Full Database (SQLite)',
                                value: 'full-db',
                              },
                              {
                                label: 'Full Database (SQL)',
                                value: 'full-sql',
                              },
                              { label: 'SQLite (Table)', value: 'sqlite' },
                              { label: 'CSV', value: 'csv' },
                              { label: 'JSON', value: 'json' },
                              { label: 'SQL', value: 'sql' },
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  if (
                                    option.value === 'full-db' ||
                                    option.value === 'full-sql'
                                  ) {
                                    handleExportWithCustomName(
                                      option.value as 'full-db' | 'full-sql'
                                    );
                                  } else {
                                    exportDatabase(option.value as any);
                                    setIsExportMenuOpen(false);
                                  }
                                }}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setFormData({});
                          setShowModal('add');
                        }}
                        className="px-4 py-2 border text-green-400 border-green-400 rounded-lg hover:bg-green-700 hover:text-current flex items-center transition-colors duration-200"
                        title="Add Row"
                      >
                        <Plus className=" h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTable(selectedTable)}
                        className="px-4 py-2 border border-red-500 rounded-lg text-red-500 flex hover:text-current hover:bg-red-700 items-center transition-colors duration-200"
                        title={`Delete ${selectedTable}`}
                      >
                        <Trash2 className=" h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 justify-between mb-2">
                {dbInstance && (
                  <button
                    onClick={handleClearDatabase}
                    className="px-2 py-2 border border-red-500 rounded-lg text-red-500 hover:bg-red-700 hover:text-current flex items-center transition-colors duration-200"
                  >
                    <TimerReset className="mr-2 h-4 w-4" /> Reset Data
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Table Selection */}
        {tables.length > 0 && (
          <div title="Tables Found">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              {...{
                className:
                  'mt-5 flex flex-row overflow-x-scroll md:overflow-hidden md:flex-wrap gap-2 hide-scrollbar',
              }}
            >
              {tables.map((table) => (
                <button
                  key={table.name}
                  onClick={() => setSelectedTable(table.name)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    selectedTable === table.name
                      ? 'border border-[#10b981] text-[#10b981]'
                      : 'border cursor-pointer hover:border-[#10b981] hover:text-[#10b981]'
                  }`}
                >
                  {table.name}
                </button>
              ))}
            </motion.div>

            {/* Table Controls */}
            {selectedTable && (
              <div className="py-4  border-b flex md:flex-row flex-col justify-between items-center gap-4 md:flex-3">
                <div
                  className="relative flex-2"
                  style={{ width: '-webkit-fill-available' }}
                >
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search rows..."
                    style={{ width: '-webkit-fill-available' }}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white  dark:bg-black/35 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                  />
                </div>
                <div
                  className="md:flex hidden flex-wrap gap-2 flex-1 justify-start  md:justify-end"
                  style={{ width: '-webkit-fill-available' }}
                >
                  <label
                    className="flex items-center px-4 py-2 border rounded-lg cursor-pointer hover:border-[#10b981] hover:text-[#10b981] transition-colors duration-200"
                    title="Upload another file"
                  >
                    {isLoading ? (
                      <Loader2 className=" h-4 w-4" />
                    ) : (
                      <Upload className=" h-4 w-4" />
                    )}
                    <input
                      type="file"
                      accept=".db,.sqlite,.sqlite3,.sql"
                      onChange={(e) =>
                        e.target.files && handleFileUpload(e.target.files[0])
                      }
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>

                  {undoStack.length > 0 && (
                    <button
                      onClick={handleUndo}
                      disabled={undoStack.length <= 0}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-700 disabled:border-gray-600 disabled:text-gray-600 text-gray-200 flex items-center transition-colors duration-200"
                    >
                      <Undo2 className="mr-2 h-4 w-4" /> Undo
                    </button>
                  )}
                  <div
                    className="relative"
                    ref={exportMenuRef}
                    title="Export Data"
                  >
                    <button
                      onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                      className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-700 hover:text-current flex items-center transition-colors duration-200"
                    >
                      <Download className="h-6 w-4" />
                    </button>

                    {isExportMenuOpen && (
                      <div className="absolute bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-2 right-0 z-10 w-[12rem]">
                        {[
                          { label: 'Full Database (SQLite)', value: 'full-db' },
                          { label: 'Full Database (SQL)', value: 'full-sql' },
                          { label: 'SQLite (Table)', value: 'sqlite' },
                          { label: 'CSV', value: 'csv' },
                          { label: 'JSON', value: 'json' },
                          { label: 'SQL', value: 'sql' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              if (
                                option.value === 'full-db' ||
                                option.value === 'full-sql'
                              ) {
                                handleExportWithCustomName(
                                  option.value as 'full-db' | 'full-sql'
                                );
                              } else {
                                exportDatabase(option.value as any);
                                setIsExportMenuOpen(false);
                              }
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setFormData({});
                      setShowModal('add');
                    }}
                    className="px-4 py-2 border text-green-400 border-green-400 rounded-lg hover:bg-green-700 hover:text-current flex items-center transition-colors duration-200"
                    title="Add Row"
                  >
                    <Plus className=" h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTable(selectedTable)}
                    className="px-4 py-2 border border-red-500 rounded-lg text-red-500 flex hover:text-current hover:bg-red-700 items-center transition-colors duration-200"
                    title={`Delete ${selectedTable}`}
                  >
                    <Trash2 className=" h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 p-4 w-full min-h-full mx-auto">
        {isLoading && <Loader />}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            {...{
              className:
                'bg-red-100 dark:bg-red-900 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex flex-col',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 -500 mr-2" />
                <span className="-700 dark:-300">
                  Errors occurred during processing
                </span>
              </div>
              <button
                onClick={() => setIsErrorExpanded(!isErrorExpanded)}
                className="text-sm underline"
              >
                {isErrorExpanded ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            {isErrorExpanded && (
              <pre className="mt-2 text-sm -700 dark:-300 whitespace-pre-wrap">
                {error}
              </pre>
            )}
          </motion.div>
        )}

        {!tables.length && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            {...{ className: 'text-center py-10' }}
          >
            {/* <Upload className="mx-auto h-16 w-16 -500 mb-6" /> */}
            <label className="flex flex-col mx-auto items-center px-4 py-2 border rounded-lg cursor-pointer hover:border-[#10b981] hover:text-[#10b981] transition-colors duration-200">
              <Upload className="mx-auto h-16 w-16 -500 mb-6" />
              <span>
                {isLoading
                  ? 'Loading...'
                  : 'Upload a SQLite database or SQL file to get started.'}
              </span>
              <input
                type="file"
                accept=".db,.sqlite,.sqlite3,.sql"
                onChange={(e) =>
                  e.target.files && handleFileUpload(e.target.files[0])
                }
                className="hidden"
                disabled={isLoading}
              />
            </label>
          </motion.div>
        )}
        <div className="pb-10">
          {selectedTable && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              {...{ className: 'rounded-xl shadow-lg overflow-hidden' }}
            >
              <div className="overflow-y-scroll hide-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900 border border-gray-50 dark:border-gray-900 sticky top-0">
                      {tables
                        .find((t) => t.name === selectedTable)
                        ?.columns.map((col) => (
                          <th
                            key={col}
                            className="p-4 text-left font-semibold relative"
                            style={{ width: columnWidths[col] || 'auto' }}
                          >
                            {col}
                            <div
                              className="absolute right-0 top-0 h-full w-1 bg-gray-300 dark:bg-gray-600 cursor-col-resize hover:bg-indigo-500"
                              onMouseDown={(e) => startResizing(e, col)}
                            />
                          </th>
                        ))}
                      <th
                        className="p-4 text-right sticky top-0"
                        style={{ width: columnWidths['actions'] || 100 }}
                      >
                        Actions
                        <div
                          className="absolute right-0 top-0 h-full w-1 cursor-col-resize border hover:border-indigo-400"
                          onMouseDown={(e) => startResizing(e, 'actions')}
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="overflow-scroll">
                    {filterRows(
                      tables.find((t) => t.name === selectedTable)?.rows || []
                    ).map((row, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        {...{
                          className:
                            'border-t hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors duration-150',
                        }}
                      >
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className="p-4 max-w-[300px] truncate"
                            title={String(cell) || 'NULL'}
                          >
                            {cell === null ? (
                              <span className="italic">NULL</span>
                            ) : (
                              String(cell).substring(0, 30) +
                              (String(cell).length > 30 ? '...' : '')
                            )}
                          </td>
                        ))}
                        <td className="p-4 flex text-right space-x-2">
                          <button
                            onClick={() => {
                              const columns =
                                tables.find((t) => t.name === selectedTable)
                                  ?.columns || [];
                              setFormData(
                                Object.fromEntries(
                                  columns.map((col, idx) => [col, row[idx]])
                                )
                              );
                              setEditRowIndex(i);
                              setShowModal('edit');
                            }}
                            className="p-1 text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-500 transition-colors duration-200"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRow(i)}
                            className="p-1 text-red-500 dark:text-red-300 hover:text-red-700 dark:hover:text-red-500 transition-colors duration-200"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Export Modal */}
      {showModal === 'export' && (
        <Modal
          title={`Export ${exportFormat?.includes('full') ? 'Database' : 'Table'}`}
          onClose={handleCloseModal}
          size="lg"
          ariaLabel="Export database dialog"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log(
                'Exporting with format:',
                exportFormat,
                'filename:',
                exportFilename
              );
              exportDatabase(
                exportFormat as 'full-db' | 'full-sql',
                exportFilename
              );
              handleCloseModal();
              setIsExportMenuOpen(false);
            }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filename
                </label>
                <input
                  type="text"
                  value={exportFilename}
                  onChange={(e) => setExportFilename(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-black/80 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                  placeholder="Enter filename"
                  aria-label="Export filename"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  File will be saved as {exportFilename}.
                  {exportFormat === 'full-db' ? 'db' : 'sql'}
                </p>
              </div>
            </div>
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                Export
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      {(showModal === 'add' || showModal === 'edit') && (
        <Modal
          title={showModal === 'add' ? 'Add New Row' : 'Edit Row'}
          onClose={handleCloseModal}
          ariaLabel={`${showModal} row dialog`}
          size="lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log('Submitting form for', showModal);
              showModal === 'add' ? handleAddRow() : handleEditRow();
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tables
                .find((t) => t.name === selectedTable)
                ?.columns.map((col) => (
                  <div key={col} className="space-y-2">
                    <label
                      htmlFor={`input-${col}`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {col}
                    </label>
                    <input
                      id={`input-${col}`}
                      type="text"
                      value={formData[col] || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, [col]: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-black/80 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                      placeholder={`Enter ${col}`}
                      aria-required="true"
                    />
                  </div>
                ))}
            </div>
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DatabaseExplorer;
