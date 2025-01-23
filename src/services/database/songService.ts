import { query } from '../../lib/database';
import { Song } from '../../types';

export class SongService {
  async getSongs(artistId?: number): Promise<Song[]> {
    const sql = artistId
      ? 'SELECT * FROM songs WHERE artist_id = ?'
      : 'SELECT * FROM songs';
    
    const params = artistId ? [artistId] : [];
    return query<Song[]>(sql, params);
  }

  async createSong(song: Omit<Song, 'id'>): Promise<Song> {
    const result = await query<{ insertId: number }>(
      `INSERT INTO songs (title, artist, album, duration, file_path, cover_url, price, artist_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [song.title, song.artist, song.album, song.duration, song.file_path, song.cover_url, song.price, song.artist_id]
    );

    return {
      id: result.insertId,
      ...song
    };
  }

  async updateSong(id: number, updates: Partial<Song>): Promise<void> {
    const fields = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`);
    
    const values = Object.values(updates)
      .filter((_, index) => Object.keys(updates)[index] !== 'id');

    await query(
      `UPDATE songs SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
  }

  async deleteSong(id: number): Promise<void> {
    await query('DELETE FROM songs WHERE id = ?', [id]);
  }
}