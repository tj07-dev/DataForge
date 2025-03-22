/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext<{
  accent: string;
  theme: string;
  toggleTheme: () => void;
}>({
  accent: '#109',
  theme: 'light',
  toggleTheme: () => {},
});

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<string>('light');

  const [accent] = useState<string>('[#000000]');
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ accent, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
export { ThemeContext, ThemeProvider, useTheme };
