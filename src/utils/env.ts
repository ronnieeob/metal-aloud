/// <reference types="vite/client" />

// Environment utilities
export const isDev = import.meta.env.DEV;
export const isProd = import.meta.env.PROD;

// API configuration
export const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001';
export const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string;
export const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET as string;