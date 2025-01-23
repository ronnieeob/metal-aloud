export function registerServiceWorker() {
  // Only register service worker in production and when supported
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          // Ignore service worker errors in StackBlitz
          if (window.location.hostname.includes('stackblitz.io')) {
            console.log('Service Workers are not supported in StackBlitz');
            return;
          }
          console.error('SW registration failed:', error);
        });
    });
  }
}