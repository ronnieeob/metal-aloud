import { Song } from '../../types';
import { apiRequest } from './apiClient';
import { API_ENDPOINTS } from './config';

export class SongService {
  async getSongs(artistId?: string) {
    const url = artistId 
      ? `${API_ENDPOINTS.songs}?artistId=${artistId}`
      : API_ENDPOINTS.songs;
    return apiRequest<Song[]>(url);
  }

  async createSong(song: Omit<Song, 'id' | 'createdAt'>) {
    return apiRequest<Song>(API_ENDPOINTS.songs, {
      method: 'POST',
      body: song,
    });
  }

  async updateSong(song: Song) {
    return apiRequest<Song>(`${API_ENDPOINTS.songs}/${song.id}`, {
      method: 'PUT',
      body: song,
    });
  }

  async deleteSong(id: string) {
    return apiRequest(`${API_ENDPOINTS.songs}/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadSongFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest<{ url: string }>(`${API_ENDPOINTS.songs}/upload`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type, let the browser set it with the boundary
      },
      body: formData,
    });
  }
}