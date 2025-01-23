import { query, transaction } from '../../lib/database';
import { User } from '../../types';
import bcrypt from 'bcryptjs';

export class UserService {
  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const passwordHash = await bcrypt.hash(user.password, 10);
    
    const result = await query<{ insertId: number }>(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [user.name, user.email, passwordHash, user.role || 'user']
    );

    return {
      id: result.insertId,
      ...user
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await query<User[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return users[0] || null;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<void> {
    const fields = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'password')
      .map(key => `${key} = ?`);
    
    const values = Object.values(updates)
      .filter((_, index) => Object.keys(updates)[index] !== 'id' && Object.keys(updates)[index] !== 'password');

    if (updates.password) {
      fields.push('password_hash = ?');
      values.push(await bcrypt.hash(updates.password, 10));
    }

    await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
  }

  async verifyPassword(email: string, password: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user) return false;
    return bcrypt.compare(password, user.password_hash);
  }
}