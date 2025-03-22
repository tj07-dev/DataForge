import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800  p-4">
        <h1 className="text-xl">db_viewer</h1>
      </header>
      <main className="flex-grow p-4">{children}</main>
      <footer className="bg-gray-800  p-4 text-center">
        © 2025 db_viewer
      </footer>
    </div>
  );
};

export default Layout;
