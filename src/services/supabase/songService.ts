import { supabase } from '../../lib/supabase';
import { Song } from '../../types';
import { Database } from '../../lib/database.types';

type DbSong = Database['public']['Tables']['songs']['Row'];

const mapDbSongToSong = (dbSong: DbSong): Song => ({
  id: dbSong.id,
  title: dbSong.title,
  artist: dbSong.artist,
  album: dbSong.album,
  coverUrl: dbSong.cover_url,
  audioUrl: dbSong.audio_url,
  duration: dbSong.duration,
  price: dbSong.price,
  artistId: dbSong.artist_id || '',
  createdAt: dbSong.created_at
});

export class SongService {
  async getSongs(artistId?: string) {
    const query = supabase.from('songs').select('*');
    
    if (artistId) {
      query.eq('artist_id', artistId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return (data || []).map(mapDbSongToSong);
  }

  async createSong(song: Omit<Song, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('songs')
      .insert({
        title: song.title,
        artist: song.artist,
        album: song.album,
        cover_url: song.coverUrl,
        audio_url: song.audioUrl,
        duration: song.duration,
        price: song.price,
        artist_id: song.artistId
      })
      .select()
      .single();

    if (error) throw error;
    return mapDbSongToSong(data);
  }

  async updateSong(song: Song) {
    const { data, error } = await supabase
      .from('songs')
      .update({
        title: song.title,
        artist: song.artist,
        album: song.album,
        cover_url: song.coverUrl,
        audio_url: song.audioUrl,
        duration: song.duration,
        price: song.price
      })
      .eq('id', song.id)
      .select()
      .single();

    if (error) throw error;
    return mapDbSongToSong(data);
  }

  async deleteSong(id: string) {
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}