import { apiRequest } from './apiClient';
import { API_ENDPOINTS } from './config';
import { User, ArtistProfile, Song, Order } from '../../types';
import { ApiError } from './apiClient';

export class AdminService {
  // User Management
  async getUsers() {
    return apiRequest<User[]>(`${API_ENDPOINTS.users}/all`);
  }

  async updateUserRole(userId: string, role: User['role']) {
    return apiRequest<User>(`${API_ENDPOINTS.users}/${userId}/role`, {
      method: 'PUT',
      body: { role },
    });
  }

  async deleteUser(userId: string) {
    return apiRequest(`${API_ENDPOINTS.users}/${userId}`, {
      method: 'DELETE',
    });
  }

  // Artist Verification
  async getPendingArtists() {
    return apiRequest<ArtistProfile[]>(`${API_ENDPOINTS.users}/artists/pending`);
  }

  async verifyArtist(artistId: string) {
    return apiRequest<ArtistProfile>(`${API_ENDPOINTS.users}/artists/${artistId}/verify`, {
      method: 'PUT',
    });
  }

  async rejectArtist(artistId: string) {
    return apiRequest(`${API_ENDPOINTS.users}/artists/${artistId}/reject`, {
      method: 'PUT',
    });
  }

  // Content Moderation
  async getFlaggedContent() {
    return apiRequest<Song[]>(`${API_ENDPOINTS.songs}/flagged`);
  }

  async approveSong(songId: string) {
    return apiRequest<Song>(`${API_ENDPOINTS.songs}/${songId}/approve`, {
      method: 'PUT',
    });
  }

  async removeSong(songId: string) {
    return apiRequest(`${API_ENDPOINTS.songs}/${songId}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getAnalytics() {
    return apiRequest<{
      totalUsers: number;
      activeArtists: number;
      totalSongs: number;
      totalRevenue: number;
      recentOrders: Order[];
      userGrowth: { date: string; count: number }[];
      topSongs: { song: Song; plays: number }[];
    }>(`${API_ENDPOINTS.users}/analytics`);
  }

  // Settings
  async updateSettings(settings: {
    publicRegistration: boolean;
    emailVerification: boolean;
    autoApproveArtists: boolean;
    maxUploadSize: number;
    allowedFormats: string[];
  }) {
    try {
      return await apiRequest(`${API_ENDPOINTS.users}/settings`, {
        method: 'PUT',
        body: settings,
      });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Failed to update settings', 500);
    }
  }

  async getSettings() {
    try {
      return await apiRequest(`${API_ENDPOINTS.users}/settings`);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Failed to fetch settings', 500);
    }
  }

  // Order Management
  async getOrders(filters?: {
    status?: Order['status'];
    fromDate?: string;
    toDate?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);

    return apiRequest<Order[]>(`${API_ENDPOINTS.users}/orders?${params}`);
  }

  async updateOrderStatus(orderId: string, status: Order['status']) {
    return apiRequest<Order>(`${API_ENDPOINTS.users}/orders/${orderId}/status`, {
      method: 'PUT',
      body: { status },
    });
  }

  // Reports
  async getRevenueReport(period: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    return apiRequest<{
      data: { date: string; revenue: number }[];
      total: number;
    }>(`${API_ENDPOINTS.users}/reports/revenue?period=${period}`);
  }

  async getSalesReport(period: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    return apiRequest<{
      data: { date: string; sales: number }[];
      total: number;
    }>(`${API_ENDPOINTS.users}/reports/sales?period=${period}`);
  }

  async getUserReport(period: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    return apiRequest<{
      data: { date: string; users: number }[];
      total: number;
    }>(`${API_ENDPOINTS.users}/reports/users?period=${period}`);
  }
}