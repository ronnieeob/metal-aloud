import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable sourcemaps in production
    minify: true,
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          player: ['@spotify/web-api-ts-sdk'],
          ui: ['lucide-react'],
          utils: ['@supabase/supabase-js']
        }
      }
    }
  },
  server: {
    host: true,
    port: 3002,  // Changed from 3000 to avoid conflicts
    proxy: {
      '/api': {
        target: 'http://localhost:3002',  // Changed to avoid conflicts
        changeOrigin: true,
        secure: false
      }
    }
  }
});