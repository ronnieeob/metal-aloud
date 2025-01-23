import { query } from '../lib/database';
import { Band, Song } from '../types';

export class SearchService {
  async search(searchQuery: string) {
    const songs = await this.searchSongs(searchQuery);
    const bands = await this.searchBands(searchQuery);

    return {
      songs,
      bands
    };
  }

  private async searchSongs(searchQuery: string): Promise<Song[]> {
    const sql = `
      SELECT * FROM songs 
      WHERE MATCH(title, artist, album) AGAINST(? IN BOOLEAN MODE)
      LIMIT 5
    `;
    
    return query<Song[]>(sql, [searchQuery]);
  }

  private async searchBands(searchQuery: string): Promise<Band[]> {
    const sql = `
      SELECT * FROM bands 
      WHERE MATCH(name, description) AGAINST(? IN BOOLEAN MODE)
      LIMIT 5
    `;
    
    return query<Band[]>(sql, [searchQuery]);
  }
}