import { useState, useEffect } from 'react';
import { UserService } from '../services/supabase/userService';
import { UserPreferences, UserStats, Achievement } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useUserProfile() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userService = new UserService();
  const authService = AuthService.getInstance();

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, userService, loadUserData]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [prefs, userStats, userAchievements] = await Promise.all([
        userService.getUserPreferences(user.id),
        userService.getUserStats(user.id),
        userService.getUserAchievements(user.id)
      ]);

      setPreferences(prefs);
      setStats(userStats);
      setAchievements(userAchievements);
      setError(null);
    } catch (err) {
      setError('Failed to load user data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      await userService.updateUserPreferences(user.id, newPreferences);
      setPreferences(prev => prev ? { ...prev, ...newPreferences } : null);
    } catch (err) {
      console.error('Failed to update preferences:', err);
      throw err;
    }
  };

  const updateProfile = async (profile: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = await authService.updateProfile(user.id, profile);
      // Update local state
      if (updatedUser) {
        setPreferences(prev => prev ? { ...prev, ...profile } : null);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  };

  return {
    preferences,
    stats,
    achievements,
    loading,
    error,
    updatePreferences,
    updateProfile
  };
}