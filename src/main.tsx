import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './services/pwaService.ts';
import { updateBrowserFavicon } from './utils/faviconManager.ts';

// Inicializa o Service Worker do PWA
registerServiceWorker();

// Carrega imediatamente o Favicon customizado salvo no cache local
try {
  const savedConfig = localStorage.getItem('health_deglut_clinic_config');
  if (savedConfig) {
    const parsed = JSON.parse(savedConfig);
    updateBrowserFavicon(parsed.faviconUrl || parsed.logoUrl);
  }
} catch {
  // fallback
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
