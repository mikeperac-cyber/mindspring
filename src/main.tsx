import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouter } from './app/router';
import { AppProvider } from './app/store';
import { readTheme } from './app/theme';
import './styles/tokens.css';
import './styles/global.css';

document.documentElement.dataset.theme = readTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <AppRouter />
    </AppProvider>
  </StrictMode>,
);
