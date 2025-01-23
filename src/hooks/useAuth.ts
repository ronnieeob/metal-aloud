import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { User } from '../types';
import { AuthService } from '../services/authService';

const USER_KEY = 'metal_aloud_user';
const AUTH_TOKEN_KEY = 'auth_token';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}