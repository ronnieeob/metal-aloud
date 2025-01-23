// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://api.yourdomain.com' : 'http://localhost:3001');

export const API_ENDPOINTS = {
  songs: `${API_BASE_URL}/api/songs`,
  products: `${API_BASE_URL}/api/products`,
  playlists: `${API_BASE_URL}/api/playlists`,
  users: `${API_BASE_URL}/api/users`,
  auth: `${API_BASE_URL}/api/auth`,
  bands: `${API_BASE_URL}/api/bands`,
} as const;