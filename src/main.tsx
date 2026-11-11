import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App2';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { WebsiteSettingsProvider } from './contexts/WebsiteSettingsContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <WebsiteSettingsProvider>
        <App />
      </WebsiteSettingsProvider>
    </AuthProvider>
  </StrictMode>
);