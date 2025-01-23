import { apiRequest } from './apiClient';
import { API_ENDPOINTS } from './config';
import { Song, Band } from '../../types';

export interface SearchResults {
  songs: Song[];
  bands: Band[];
}

export class SearchService {
  async search(query: string): Promise<SearchResults> {
    return apiRequest<SearchResults>(`${API_ENDPOINTS.search}?q=${encodeURIComponent(query)}`);
  }
}