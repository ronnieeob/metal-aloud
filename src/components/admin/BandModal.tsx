import React, { useState } from 'react';
import { X, Music, Upload, Image } from 'lucide-react';
import { BandManagement } from '../../types/admin';
import { FileUploadZone } from './FileUploadZone';
import { AlbumUpload } from './AlbumUpload';

interface BandModalProps {
  onClose: () => void;
  onSave: (band: Omit<BandManagement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  band?: BandManagement;
}

export function BandModal({ onClose, onSave, band }: BandModalProps) {
  const [formData, setFormData] = useState({
    name: band?.name || '',
    formedIn: band?.formedIn || '',
    genres: band?.genres.join(', ') || '',
    description: band?.description || '',
    status: band?.status || 'active',
    socialLinks: {
      website: band?.socialLinks.website || '',
      spotify: band?.socialLinks.spotify || '',
      youtube: band?.socialLinks.youtube || '',
      instagram: band?.socialLinks.instagram || '',
      facebook: band?.socialLinks.facebook || ''
    }
  });
  const [uploadedSongs, setUploadedSongs] = useState<File[]>([]);
  const [uploadedAlbumArt, setUploadedAlbumArt] = useState<File[]>([]);
  const [uploadedBandImage, setUploadedBandImage] = useState<File[]>([]);
  const [albums, setAlbums] = useState<{
    name: string;
    year: string;
    coverFile: File | null;
    songFiles: File[];
  }[]>([]);
  const [bandImagePreview, setBandImagePreview] = useState<string>(band?.imageUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      imageUrl: bandImagePreview,
      genres: formData.genres.split(',').map(g => g.trim()),
      status: formData.status as 'active' | 'inactive',
      members: band?.members || [],
      // In production, these would be uploaded to a storage service
      songs: uploadedSongs.map(file => ({
        id: crypto.randomUUID(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: formData.name,
        album: 'New Album', // This would be set based on album selection
        coverUrl: URL.createObjectURL(uploadedAlbumArt[0]),
        duration: 0, // This would be extracted from the audio file
        audioUrl: URL.createObjectURL(file),
        price: 0.99,
        artistId: band?.id || '',
        genres: formData.genres.split(',').map(g => g.trim()),
        createdAt: new Date().toISOString()
      }))
    });
  };

  const handleBandImageUpload = (files: File[]) => {
    if (files.length > 0) {
      setUploadedBandImage(files);
      // Create a preview URL for the uploaded image
      const previewUrl = URL.createObjectURL(files[0]);
      setBandImagePreview(previewUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl border border-red-900/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-red-500">
            {band ? 'Edit Band' : 'Add Band'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Band Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Formed In</label>
              <input
                type="text"
                value={formData.formedIn}
                onChange={(e) => setFormData({ ...formData, formedIn: e.target.value })}
                className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Band Image</label>
            <FileUploadZone
              type="images"
              accept="image/*"
              multiple={false}
              maxSize={5}
              onFilesSelected={handleBandImageUpload}
            />
            {bandImagePreview && (
              <div className="mt-4">
                <img
                  src={bandImagePreview}
                  alt="Band preview"
                  className="w-full max-w-md rounded-lg mx-auto"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Genres (comma-separated)</label>
            <input
              type="text"
              value={formData.genres}
              onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-32 bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Social Links</h3>
            <div className="space-y-4">
              {Object.entries(formData.socialLinks).map(([platform, url]) => (
                <div key={platform}>
                  <label className="block text-sm font-medium mb-2 capitalize">
                    {platform}
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: {
                        ...formData.socialLinks,
                        [platform]: e.target.value
                      }
                    })}
                    className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
                    placeholder={`https://${platform}.com/...`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* File Upload Sections */}
          <AlbumUpload
            albums={albums}
            setAlbums={setAlbums}
            onSongsUploaded={setUploadedSongs}
          />

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center space-x-2"
            >
              <Music className="w-4 h-4" />
              <span>{band ? 'Update Band' : 'Add Band'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}