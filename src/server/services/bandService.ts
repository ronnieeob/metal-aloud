import { query } from '../lib/database';
import { Band, BandManagement } from '../types';
import { ApiError } from '../utils/ApiError';

export class BandService {
  async createBand(band: Omit<BandManagement, 'id' | 'createdAt' | 'updatedAt'>) {
    const result = await query<{ insertId: string }>(
      `INSERT INTO bands (
        name, formed_in, image_url, genres, description, 
        social_links, status, members
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        band.name,
        band.formedIn,
        band.imageUrl,
        JSON.stringify(band.genres),
        band.description,
        JSON.stringify(band.socialLinks),
        band.status,
        JSON.stringify(band.members)
      ]
    );

    return this.getBand(result.insertId);
  }

  async updateBand(id: string, band: Partial<BandManagement>) {
    const updates: string[] = [];
    const values: any[] = [];

    if (band.name) {
      updates.push('name = ?');
      values.push(band.name);
    }
    if (band.formedIn) {
      updates.push('formed_in = ?');
      values.push(band.formedIn);
    }
    if (band.imageUrl) {
      updates.push('image_url = ?');
      values.push(band.imageUrl);
    }
    if (band.genres) {
      updates.push('genres = ?');
      values.push(JSON.stringify(band.genres));
    }
    if (band.description) {
      updates.push('description = ?');
      values.push(band.description);
    }
    if (band.socialLinks) {
      updates.push('social_links = ?');
      values.push(JSON.stringify(band.socialLinks));
    }
    if (band.status) {
      updates.push('status = ?');
      values.push(band.status);
    }
    if (band.members) {
      updates.push('members = ?');
      values.push(JSON.stringify(band.members));
    }

    if (updates.length === 0) {
      throw new ApiError('No updates provided', 400);
    }

    await query(
      `UPDATE bands SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    return this.getBand(id);
  }

  async deleteBand(id: string) {
    const result = await query(
      'DELETE FROM bands WHERE id = ?',
      [id]
    );

    if (!result) {
      throw new ApiError('Band not found', 404);
    }
  }

  async getBands() {
    const bands = await query<any[]>('SELECT * FROM bands ORDER BY created_at DESC');
    return bands.map(this.mapBandFromDb);
  }

  async getBand(id: string) {
    const [band] = await query<any[]>(
      'SELECT * FROM bands WHERE id = ?',
      [id]
    );

    if (!band) {
      throw new ApiError('Band not found', 404);
    }

    return this.mapBandFromDb(band);
  }

  private mapBandFromDb(band: any): BandManagement {
    return {
      id: band.id,
      name: band.name,
      formedIn: band.formed_in,
      imageUrl: band.image_url,
      genres: JSON.parse(band.genres),
      description: band.description,
      socialLinks: JSON.parse(band.social_links),
      status: band.status,
      members: JSON.parse(band.members),
      createdAt: band.created_at,
      updatedAt: band.updated_at
    };
  }

  async uploadImage(_file: any): Promise<string> {
    // Implement image upload logic here
    // This could use a cloud storage service like AWS S3
    throw new Error('Not implemented');
  }
}