import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { AuthService } from '../services/authService';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'metal_aloud_user';

interface AuthContextType {
  user: User | null;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  setIsInitialized: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authService = AuthService.getInstance();
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (storedUser && token) {
        return JSON.parse(storedUser);
      }
      return null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem(USER_KEY);
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsInitialized(true);
      }
    }
    
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const user = await authService.login(email, password);
      // Store user data first
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(AUTH_TOKEN_KEY, user.token);
      
      // Then update state
      setUser(user);
      setIsAuthenticated(true);

      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = 'Login successful!';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);
    } catch (error) {
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    await authService.requestPasswordReset(email);
  };

  const resetPassword = async (token: string, password: string) => {
    await authService.resetPassword(token, password);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const updatedUser = await authService.updateProfile(user.id, data);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // Clear state first
    setUser(null);
    setIsAuthenticated(false);

    // Then clear storage
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    authService.logout();
    
    // Finally redirect
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isInitialized,
      login, 
      requestPasswordReset,
      resetPassword,
      updateProfile, 
      logout, 
      isAuthenticated,
      setUser,
      setIsAuthenticated,
      setIsInitialized
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}