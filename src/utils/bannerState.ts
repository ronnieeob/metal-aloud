import { User } from '../types';

const BANNER_STORAGE_KEY = 'metal_aloud_app_banner';

export function getBannerState(user: User | null): boolean {
  try {
    const key = user ? `${BANNER_STORAGE_KEY}_${user.id}` : BANNER_STORAGE_KEY;
    return localStorage.getItem(key) !== 'dismissed';
  } catch {
    return true;
  }
}

export function dismissBanner(user: User | null): void {
  try {
    const key = user ? `${BANNER_STORAGE_KEY}_${user.id}` : BANNER_STORAGE_KEY;
    localStorage.setItem(key, 'dismissed');
  } catch (err) {
    console.warn('Failed to save banner state:', err);
  }
}

export function resetBannerState(user: User | null): void {
  try {
    const key = user ? `${BANNER_STORAGE_KEY}_${user.id}` : BANNER_STORAGE_KEY;
    localStorage.removeItem(key);
  } catch (err) {
    console.warn('Failed to reset banner state:', err);
  }
}