import { AdminSettings } from '../types';
import { BandManagement } from '../types/admin';

const STORAGE_PREFIX = 'metal_aloud_mock_';

export class MockService {
  private getStorageKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  private getItem<T>(key: string, defaultValue: T): T {
    const item = localStorage.getItem(this.getStorageKey(key));
    return item ? JSON.parse(item) : defaultValue;
  }

  private setItem<T>(key: string, value: T): void {
    localStorage.setItem(this.getStorageKey(key), JSON.stringify(value));
  }
  
  getMockData(functionName: string): any {
    // Return appropriate mock data based on the function name
    switch (functionName) {
      case 'getProducts':
        return [];
      case 'getSongs':
        return [];
      case 'getBands':
        return [];
      case 'getSettings':
        return this.getAdminSettings();
      default:
        return null;
    }
  }

  getAdminSettings(): AdminSettings {
    const defaultSettings: AdminSettings = {
      publicRegistration: false,
      emailVerification: true,
      autoApproveArtists: false,
      maxUploadSize: 10,
      allowedFormats: ['mp3', 'wav', 'flac']
    };
    
    return this.getItem<AdminSettings>('admin_settings', defaultSettings);
  }

  updateAdminSettings(settings: AdminSettings): void {
    this.setItem('admin_settings', settings);
  }

  getBands(): BandManagement[] {
    return this.getItem<BandManagement[]>('bands', []);
  }
  
  search(query: string) {
    const normalizedQuery = query.toLowerCase();
    
    // Get mock data
    const songs = this.getItem<Song[]>('songs', [])
      .filter(song => 
        song.title.toLowerCase().includes(normalizedQuery) ||
        song.artist.toLowerCase().includes(normalizedQuery) ||
        song.album?.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 5);

    const bands = this.getBands()
      .filter(band => 
        band.name.toLowerCase().includes(normalizedQuery) ||
        band.description.toLowerCase().includes(normalizedQuery) ||
        band.genres.some(genre => genre.toLowerCase().includes(normalizedQuery))
      )
      .slice(0, 5);

    return {
      songs,
      bands
    };
  }

  createBand(band: Omit<BandManagement, 'id' | 'createdAt' | 'updatedAt'>): BandManagement {
    const bands = this.getBands();
    const newBand: BandManagement = {
      ...band,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.setItem('bands', [...bands, newBand]);
    return newBand;
  }

  updateBand(id: string, updates: Partial<BandManagement>): BandManagement {
    const bands = this.getBands();
    const index = bands.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('Band not found');
    }
    const updatedBand = {
      ...bands[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    bands[index] = updatedBand;
    this.setItem('bands', bands);
    return updatedBand;
  }

  deleteBand(id: string): void {
    const bands = this.getBands();
    this.setItem('bands', bands.filter(b => b.id !== id));
  }
}