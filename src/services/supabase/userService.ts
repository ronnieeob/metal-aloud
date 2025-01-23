import { supabase } from '../../lib/supabase';
import { User } from '../../types';

export class UserService {
  async updateProfile(userId: string, profile: Partial<User>): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update(profile)
      .eq('id', userId);

    if (error) throw error;
  }
}