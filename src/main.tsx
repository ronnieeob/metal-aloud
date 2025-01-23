import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeBackground } from './utils/imageSync';
import { registerServiceWorker } from './registerSW';

// Initialize background image
initializeBackground();

// Register service worker for PWA support
if (!window.location.hostname.includes('stackblitz.io')) {
  registerServiceWorker();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);