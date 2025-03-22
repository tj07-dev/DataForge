# DataForge

**DataForge** is a powerful, web-based tool designed for exploring, editing, and managing data across multiple formats. Initially developed to handle SQLite databases and SQL dumps, DataForge is evolving into a versatile platform that will soon support JSON, CSV, and Excel (XLSX) files. Whether you're a developer, data analyst, or enthusiast, DataForge provides an intuitive interface to interact with your data seamlessly.

## Features

- **Multi-Format Data Handling**: Currently supports SQLite (`.db`, `.sqlite`, `.sqlite3`) and SQL (`.sql`) files, with JSON (`.json`), CSV (`.csv`), and Excel (`.xlsx`) support in development.
- **Interactive Data Exploration**: View, search, and filter data tables with a responsive, modern UI.
- **Data Editing**: Add, edit, or delete rows and tables with built-in undo functionality.
- **Export Capabilities**: Export individual tables or the full database as SQLite, SQL, CSV, or JSON, with custom filename support for full exports.
- **Theme Switching**: Toggle between light and dark modes for a comfortable viewing experience.
- **Error Logging**: Detailed, collapsible error logs to troubleshoot file imports.
- **Resizable Columns**: Adjust table column widths for better readability.

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/tj07-dev/dataforge.git
   cd dataforge
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## Usage

1. **Upload Data**:

   - Click "Upload Data" in the top-right corner.
   - Select a `.db`, `.sqlite`, `.sqlite3`, or `.sql` file to load your data.

2. **Explore and Edit**:

   - Select a table from the top navigation to view its contents.
   - Use the search bar to filter rows.
   - Click "Add Row" to insert new data, or use the edit/delete icons on each row.

3. **Export Data**:

   - Click "Export" to download the selected table as SQLite, CSV, JSON, or SQL.
   - Choose "Full Database (SQLite)" or "Full Database (SQL)" to export all data with a custom filename.

4. **Manage Data**:
   - Use "Delete" to remove a table or "Clear Data" to reset the entire dataset.
   - Undo actions like row deletions with the "Undo" button.

## Future Developments

DataForge is actively being enhanced to broaden its capabilities. Planned features include:

- **JSON Support**: Import and export data in `.json` format, enabling interaction with semi-structured data.
- **CSV Support**: Load and manipulate `.csv` files, with options to export in multiple formats.
- **XLSX Support**: Add support for Excel (`.xlsx`) files, allowing users to work with spreadsheet data directly in DataForge.
- **Advanced Data Transformation**: Tools for converting between formats (e.g., CSV to SQLite, JSON to Excel).
- **Column Sorting**: Clickable headers to sort table data.
- **Pagination**: Improved performance for large datasets with paginated views.

Stay tuned for these updates as we expand DataForge into a comprehensive data management solution!

## Contributing

We welcome contributions to make DataForge even better! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit them (`git commit -m "Add your feature"`).
4. Push to your fork (`git push origin feature/your-feature`).
5. Open a Pull Request.

Feel free to report issues or suggest features via the [Issues](https://github.com/tj07-dev/dataforge/issues) tab, especially for implementing JSON, CSV, or XLSX support.
