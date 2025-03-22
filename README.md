# DataForge

**DataForge** is a powerful, web-based tool designed for exploring, editing, and managing data across multiple formats. Built initially to handle SQLite databases (`.db`, `.sqlite`, `.sqlite3`) and SQL dumps (`.sql`), DataForge is on its way to becoming a versatile platform supporting JSON (`.json`), CSV (`.csv`), and Excel (`.xlsx`) files. Whether you're a developer, data analyst, or enthusiast, DataForge offers an intuitive interface to interact with your data seamlessly.

## Features

- **Multi-Format Data Handling**: Currently supports SQLite and SQL files, with JSON, CSV, and Excel support in development.
- **Interactive Data Exploration**: View, search, and filter data tables with a modern, responsive UI.
- **Data Editing**: Add, edit, or delete rows and tables, with undo functionality for key actions.
- **Export Capabilities**: Export individual tables as SQLite, SQL, CSV, or JSON, or the full database with custom filenames in SQLite or SQL format.
- **Theme Switching**: Toggle between light and dark modes for a comfortable experience.
- **Error Logging**: Detailed, collapsible logs to troubleshoot file imports.
- **Resizable Columns**: Adjust table column widths for better readability.

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/tj07-dev/DataForge.git
   cd DataForge
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
   - Use "Delete" to remove a table or "Clear Data" to reset the dataset.
   - Undo actions like row deletions with the "Undo" button.

## Future Developments

DataForge is actively being enhanced to expand its capabilities. Planned features include:

- **JSON Support**: Import and export data in `.json` format for working with semi-structured data.
- **CSV Support**: Load and manipulate `.csv` files, with export options to other formats.
- **XLSX Support**: Add support for Excel (`.xlsx`) files, enabling direct interaction with spreadsheet data.
- **Advanced Data Transformation**: Tools to convert between formats (e.g., CSV to SQLite, JSON to Excel).
- **Column Sorting**: Clickable headers to sort table data.
- **Pagination**: Improved performance for large datasets with paginated views.

These updates will transform DataForge into a comprehensive data management solution—stay tuned!

## Contributing

Contributions are welcome to make DataForge even better! To contribute:

1. Fork the repository: `https://github.com/tj07-dev/DataForge`.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Make your changes and commit:
   ```bash
   git commit -m "Add your feature"
   ```
4. Push to your fork:
   ```bash
   git push origin feature/your-feature
   ```
5. Open a Pull Request on GitHub.

Report issues or suggest features via the [Issues](https://github.com/tj07-dev/DataForge/issues) tab—especially ideas for JSON, CSV, or XLSX support!

---

**Built with ❤️ by [tj07-dev](https://github.com/tj07-dev) | [LinkedIn](https://www.linkedin.com/in/tj07)**
