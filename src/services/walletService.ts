import { supabase } from '../lib/supabase';

interface WalletTransaction {
  id: string;
  userId: string;
  type: 'sale' | 'withdrawal' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    swiftCode: string;
    accountHolderName: string;
    country: string;
  };
  createdAt: string;
}

export class WalletService {
  private static instance: WalletService;
  private commissionRate = 0.08; // 8% platform fee
  private playRates = [
    { min: 0, max: 1000, rate: 0.005 },
    { min: 1001, max: 10000, rate: 0.0075 },
    { min: 10001, max: 100000, rate: 0.01 },
    { min: 100001, max: null, rate: 0.015 }
  ];

  private constructor() {}

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  async getWalletBalance(userId: string): Promise<number> {
    try {
      // In development, always use mock data
      if (import.meta.env.DEV) {
        return this.getMockBalance(userId);
      }
      
      // Production implementation will be added later
      return 0;
    } catch (err) {
      console.error('Failed to get wallet balance:', err);
      return this.getMockBalance(userId);
    }
  }

  async getPlayStats(userId: string) {
    try {
      if (import.meta.env.DEV) {
        // Return mock play stats in development
        return {
          totalPlays: Math.floor(Math.random() * 50000),
          monthlyPlays: Math.floor(Math.random() * 5000),
          playEarnings: Math.random() * 1000,
          pendingEarnings: Math.random() * 100
        };
      }

      const { data, error } = await supabase
        .from('song_plays')
        .select('*')
        .eq('artist_id', userId);

      if (error) throw error;

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const monthlyPlays = data.filter(play => 
        new Date(play.played_at) >= monthStart
      ).length;

      const totalPlays = data.length;
      const playEarnings = data
        .filter(play => play.processed)
        .reduce((sum, play) => sum + (play.earnings || 0), 0);
      const pendingEarnings = data
        .filter(play => !play.processed)
        .reduce((sum, play) => sum + (play.earnings || 0), 0);

      return {
        totalPlays,
        monthlyPlays,
        playEarnings,
        pendingEarnings
      };
    } catch (err) {
      console.error('Failed to get play stats:', err);
      throw err;
    }
  }

  private getMockBalance(userId: string): number {
    const transactions = JSON.parse(localStorage.getItem(`metal_aloud_wallet_${userId}`) || '[]');
    return transactions.reduce((balance, tx) => {
      if (tx.type === 'sale') return balance + tx.amount;
      if (tx.type === 'withdrawal') return balance - tx.amount;
      return balance;
    }, 0);
  }

  async getTransactions(userId: string): Promise<WalletTransaction[]> {
    try {
      // In development, always use mock data
      if (import.meta.env.DEV) {
        return this.getMockTransactions(userId);
      }
      
      // Production implementation will be added later
      return [];
    } catch (err) {
      console.error('Failed to get transactions:', err);
      return this.getMockTransactions(userId);
    }
  }

  private getMockTransactions(userId: string): WalletTransaction[] {
    return JSON.parse(localStorage.getItem(`metal_aloud_wallet_${userId}`) || '[]');
  }

  async requestWithdrawal(
    userId: string,
    amount: number,
    bankDetails: {
      accountNumber: string;
      bankName: string;
      swiftCode: string;
      accountHolderName: string;
      country: string;
    }
  ): Promise<WalletTransaction> {
    try {
      const balance = await this.getWalletBalance(userId);
      if (balance < amount) {
        throw new Error('Insufficient funds');
      }

      const transaction: WalletTransaction = {
        id: crypto.randomUUID(),
        userId,
        type: 'withdrawal',
        amount,
        status: 'pending',
        bankDetails,
        createdAt: new Date().toISOString()
      };

      const { error } = await supabase
        .from('wallet_transactions')
        .insert(transaction);

      if (error) throw error;
      return transaction;
    } catch (err) {
      console.error('Failed to request withdrawal:', err);
      // Fallback to localStorage in development
      if (import.meta.env.DEV) {
        const transaction: WalletTransaction = {
          id: crypto.randomUUID(),
          userId,
          type: 'withdrawal',
          amount,
          status: 'pending',
          bankDetails,
          createdAt: new Date().toISOString()
        };
        const transactions = JSON.parse(localStorage.getItem(`metal_aloud_wallet_${userId}`) || '[]');
        transactions.push(transaction);
        localStorage.setItem(`metal_aloud_wallet_${userId}`, JSON.stringify(transactions));
        return transaction;
      }
      throw err;
    }
  }

  async recordSale(
    userId: string,
    amount: number,
    commission: number
  ): Promise<WalletTransaction> {
    try {
      const netAmount = amount - commission;
      const transaction: WalletTransaction = {
        id: crypto.randomUUID(),
        userId,
        type: 'sale',
        amount: netAmount,
        status: 'completed',
        createdAt: new Date().toISOString()
      };

      const { error } = await supabase
        .from('wallet_transactions')
        .insert(transaction);

      if (error) throw error;
      return transaction;
    } catch (err) {
      console.error('Failed to record sale:', err);
      // Fallback to localStorage in development
      if (import.meta.env.DEV) {
        const transaction: WalletTransaction = {
          id: crypto.randomUUID(),
          userId,
          type: 'sale',
          amount: amount - commission,
          status: 'completed',
          createdAt: new Date().toISOString()
        };
        const transactions = JSON.parse(localStorage.getItem(`metal_aloud_wallet_${userId}`) || '[]');
        transactions.push(transaction);
        localStorage.setItem(`metal_aloud_wallet_${userId}`, JSON.stringify(transactions));
        return transaction;
      }
      throw err;
    }
  }
}