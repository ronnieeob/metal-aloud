import { apiRequest } from './apiClient';
import { API_ENDPOINTS } from './config';
import { BandManagement } from '../../types/admin';

export class BandService {
  async getBands() {
    return apiRequest<BandManagement[]>(`${API_ENDPOINTS.bands}`);
  }

  async getBand(id: string) {
    return apiRequest<BandManagement>(`${API_ENDPOINTS.bands}/${id}`);
  }

  async createBand(band: Omit<BandManagement, 'id' | 'createdAt' | 'updatedAt'>) {
    return apiRequest<BandManagement>(API_ENDPOINTS.bands, {
      method: 'POST',
      body: band,
    });
  }

  async updateBand(id: string, band: Partial<BandManagement>) {
    return apiRequest<BandManagement>(`${API_ENDPOINTS.bands}/${id}`, {
      method: 'PUT',
      body: band,
    });
  }

  async deleteBand(id: string) {
    return apiRequest(`${API_ENDPOINTS.bands}/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadBandImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    return apiRequest<{ url: string }>(`${API_ENDPOINTS.bands}/upload-image`, {
      method: 'POST',
      body: formData,
      headers: {
        // Let the browser set the content type with boundary
      },
    });
  }
}