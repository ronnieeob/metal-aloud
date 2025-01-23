import { supabase } from '../../lib/supabase';

export class StorageService {
  private static instance: StorageService;
  private readonly SONGS_BUCKET = 'songs';
  private readonly IMAGES_BUCKET = 'images';

  private constructor() {}

  private generateStoragePath(userId: string, fileExt: string): string {
    const fileName = crypto.randomUUID();
    return `${userId}/${fileName}.${fileExt}`;
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async uploadSong(file: File, artistId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = this.generateStoragePath(artistId, fileExt || 'mp3');

      const { data, error } = await supabase.storage
        .from(this.SONGS_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(this.SONGS_BUCKET)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Failed to upload song:', err);
      throw new Error('Failed to upload song. Please try again.');
    }
  }

  async uploadImage(file: File, folder: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = this.generateStoragePath(folder, fileExt || 'jpg');

      const { data, error } = await supabase.storage
        .from(this.IMAGES_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(this.IMAGES_BUCKET)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Failed to upload image:', err);
      throw new Error('Failed to upload image. Please try again.');
    }
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  }
}