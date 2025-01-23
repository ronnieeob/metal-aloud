import { supabase } from '../lib/supabase';
import { EmailService } from './emailService';
import { SecurityManager } from '../utils/security';
import { User } from '../types';

export class AuthService {
  private static instance: AuthService;
  private emailService: EmailService;
  private securityManager: SecurityManager;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOGIN_WINDOW = 15 * 60 * 1000; // 15 minutes

  private constructor() {
    this.emailService = EmailService.getInstance();
    this.securityManager = SecurityManager.getInstance();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<User> {
    try {
      // Reset any previous errors
      const token = this.securityManager.generateSecureToken();

      // Rate limit check
      if (!this.securityManager.checkRateLimit(
        `login_${email}`,
        this.MAX_LOGIN_ATTEMPTS,
        this.LOGIN_WINDOW
      )) {
        throw new Error('Too many login attempts. Please try again later.');
      }

      // Sanitize inputs
      const sanitizedEmail = this.securityManager.sanitizeInput(email);
      
      // Demo accounts for development
      const demoAccounts: Record<string, Omit<User, 'id'>> = {
        'admin@example.com': {
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          avatarUrl: localStorage.getItem('metal_aloud_profile_image_admin') || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
          playlists: [],
          bio: 'System Administrator',
          website: '',
          location: ''
        },
        'artist@example.com': {
          name: 'Artist User',
          email: 'artist@example.com',
          role: 'artist',
          avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
          playlists: [],
          bio: 'Metal Artist',
          website: '',
          location: ''
        },
        'user@example.com': {
          name: 'Regular User',
          email: 'user@example.com',
          role: 'user',
          avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
          playlists: [],
          bio: 'Metal Fan',
          website: '',
          location: ''
        }
      };

      // Check if email exists in demo accounts
      const demoUser = demoAccounts[email as keyof typeof demoAccounts];
      
      if (demoUser && password === 'password') {
        const userId = crypto.randomUUID();
        const storedImage = demoUser.role === 'admin' ? localStorage.getItem('metal_aloud_profile_image_admin') : null;

        const user = {
          id: userId,
          ...demoUser,
          avatarUrl: storedImage || demoUser.avatarUrl,
          token // Include token in user object
        };

        if (demoUser.role === 'artist') {
          localStorage.setItem('metal_aloud_artist_profile', JSON.stringify({
            id: userId,
            userId,
            bio: 'Metal Artist',
            verified: false,
            imageUrl: user.avatarUrl,
            formedIn: '2024',
            genres: ['Heavy Metal', 'Thrash Metal'],
            socialLinks: {}
          }));
        }
        
        if (demoUser.role === 'admin' && storedImage) {
          localStorage.setItem('metal_aloud_website_image', storedImage);
        }

        return user;
      }

      throw new Error('Invalid credentials. Try:\n- admin@example.com\n- artist@example.com\n- user@example.com\n(password: password)');
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    try {
      // In development, update local storage
      if (import.meta.env.DEV) {
        const storedUser = localStorage.getItem('metal_aloud_user');
        if (!storedUser) throw new Error('User not found');

        const user = JSON.parse(storedUser);
        if (user.id !== userId) throw new Error('Unauthorized');

        // If updating avatar URL, sync with website logo
        if (data.avatarUrl && user.role === 'admin') {
          localStorage.setItem('metal_aloud_website_image', data.avatarUrl);
        }

        const updatedUser = { ...user, ...data };
        localStorage.setItem('metal_aloud_user', JSON.stringify(updatedUser));
        return updatedUser;
      }

      // In production, update Supabase
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return updatedUser;
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw new Error('Failed to update profile');
    }
  }
  async requestPasswordReset(email: string): Promise<void> {
    try {
      // Generate reset token
      const { data, error } = await supabase.rpc('generate_password_reset_token', {
        user_email: email
      });

      if (error) throw error;

      // Send reset email
      await this.emailService.sendPasswordReset(email, data);
    } catch (err) {
      console.error('Failed to request password reset:', err);
      throw new Error('Failed to send reset email');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Verify token
      const { data: tokenData, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('user_id')
        .eq('token', token)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        throw new Error('Invalid or expired reset token');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      // Mark token as used
      await supabase
        .from('password_reset_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('token', token);

    } catch (err) {
      console.error('Failed to reset password:', err);
      throw new Error('Failed to reset password');
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }
}