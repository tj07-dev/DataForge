import { Route, Routes } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import NeuralParticles from './components/Particals';
import { ThemeProvider } from './contexts/ThemeContext';
import DBViewer from './pages/DBViewer';

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <NeuralParticles />

        <Routes>
          <Route path="/" element={<DBViewer />} />
        </Routes>
        <Footer />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
