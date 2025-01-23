import { BandManagement } from '../types';
import { ApiError } from '../utils/ApiError';

export function validateBand(data: any): Omit<BandManagement, 'id' | 'createdAt' | 'updatedAt'> {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Band name is required');
  }

  if (!data.formedIn?.trim()) {
    errors.push('Formation year is required');
  }

  if (!data.imageUrl?.trim()) {
    errors.push('Image URL is required');
  }

  if (!Array.isArray(data.genres) || data.genres.length === 0) {
    errors.push('At least one genre is required');
  }

  if (!data.description?.trim()) {
    errors.push('Description is required');
  }

  if (!['active', 'inactive'].includes(data.status)) {
    errors.push('Invalid status');
  }

  if (errors.length > 0) {
    throw new ApiError(errors.join(', '), 400);
  }

  return {
    name: data.name.trim(),
    formedIn: data.formedIn.trim(),
    imageUrl: data.imageUrl.trim(),
    genres: data.genres,
    description: data.description.trim(),
    socialLinks: data.socialLinks || {},
    status: data.status,
    members: data.members || []
  };
}