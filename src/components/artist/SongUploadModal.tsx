import React, { useState } from 'react';
import { X, Music, Upload, Shield } from 'lucide-react';
import { Song } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { StorageService } from '../../services/supabase/storageService';
import { NewsGenerator } from '../../services/ai/newsGenerator';
import { CopyrightFeatures } from './CopyrightFeatures';
import { CopyrightService } from '../../services/copyrightService';

interface SongUploadModalProps {
  onClose: () => void;
  onUpload: (song: Omit<Song, 'id'>) => void;
}

export function SongUploadModal({ onClose, onUpload }: SongUploadModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    album: '',
    coverUrl: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c',
    price: 0.99,
    genres: [] as string[]
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyrightType, setCopyrightType] = useState<'automatic' | 'manual'>('automatic');
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url');
  const [showCopyrightFeatures, setShowCopyrightFeatures] = useState(true);
  const storageService = StorageService.getInstance();
  const copyrightService = CopyrightService.getInstance();

  const handleUploadTypeChange = (type: 'url' | 'file') => {
    setUploadType(type);
    // Clear the other input type's value
    if (type === 'url') {
      setAudioFile(null);
    } else {
      setAudioUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Validate required fields
    if (!formData.title || !formData.album) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let finalAudioUrl = audioUrl;
      let duration = 0;

      // Handle local file upload
      if (uploadType === 'file' && audioFile) {
        try {
          finalAudioUrl = await storageService.uploadSong(audioFile, user.id);
          
          // Get audio duration
          const audio = new Audio();
          audio.src = URL.createObjectURL(audioFile);
          await new Promise((resolve) => {
            audio.addEventListener('loadedmetadata', () => {
              duration = Math.floor(audio.duration);
              resolve(null);
            });
          });
        } catch (uploadError) {
          setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload song');
          setLoading(false);
          return;
        }
      }

      if (!finalAudioUrl && uploadType === 'url') {
        setError('Please provide an audio URL');
        setLoading(false);
        return;
      }
      const songData = {
        ...formData,
        audioUrl: finalAudioUrl,
        duration,
        artist: user.name || 'Unknown Artist',
        artistId: user.id
      };

      // Upload song
      await onUpload(songData);

      // Generate and publish news article
      try {
        const newsGenerator = NewsGenerator.getInstance();
        await newsGenerator.generateNewsForUpload(songData as Song, user);
      } catch (err) {
        console.error('Failed to generate news:', err);
        // Continue even if news generation fails
      }

      // Register copyright
      if (user.role === 'artist') {
        try {
          await copyrightService.registerCopyright(
            songData.id,
            user.id,
            copyrightType,
            true // Use subscription
          );
          // Show success message
          const message = document.createElement('div');
          message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
          message.textContent = 'Song uploaded and copyright registered successfully';
          document.body.appendChild(message);
          setTimeout(() => message.remove(), 3000);
        } catch (err) {
          console.error('Copyright registration failed:', err);
          // Continue without copyright registration
        }
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload song');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        setError('Please upload an audio file');
        return;
      }
      
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }

      setAudioFile(file);
      setError(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md border border-red-900/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-red-500">Upload Song</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Album</label>
            <input
              name="album"
              type="text"
              value={formData.album}
              onChange={handleInputChange}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cover Image URL</label>
            <input
              name="coverUrl"
              type="url"
              value={formData.coverUrl}
              onChange={handleInputChange}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Upload Method</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={uploadType === 'url'}
                  onChange={() => handleUploadTypeChange('url')}
                  className="text-red-600"
                />
                <span>Audio URL</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={uploadType === 'file'}
                  onChange={() => handleUploadTypeChange('file')}
                  className="text-red-600"
                />
                <span>Local File</span>
              </label>
            </div>
          </div>

          {uploadType === 'url' ? (
            <div>
              <label className="block text-sm font-medium mb-2">Audio URL</label>
              <input
                type="url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                className={`w-full bg-zinc-800 border ${
                  error && !audioUrl && uploadType === 'url' 
                    ? 'border-red-500' 
                    : 'border-red-900/20'
                } rounded p-2 text-white`}
                required={uploadType === 'url'}
                disabled={uploadType === 'file'}
                placeholder="https://example.com/song.mp3"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Audio File</label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
                required={uploadType === 'file'}
              />
              {audioFile && (
                <p className="text-sm text-gray-400 mt-1">
                  Selected: {audioFile.name}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center justify-between">
              <span>Copyright Protection</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={copyrightType === 'automatic'}
                  onChange={() => setCopyrightType('automatic')}
                  className="text-red-600"
                />
                <span>Automatic</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={copyrightType === 'manual'}
                  onChange={() => setCopyrightType('manual')}
                  className="text-red-600"
                />
                <span>Manual</span>
              </label>
            </div>
          </div>

          {showCopyrightFeatures && (
            <CopyrightFeatures type="pro" interval="monthly" />
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Price ($)</label>
            <input
              name="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              step="0.01"
              min="0"
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <div className="bg-red-900/20 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium">Copyright Protection</span>
            </div>
            <p className="text-sm text-gray-400">
              {copyrightType === 'automatic' 
                ? 'Your song will be automatically registered for copyright protection'
                : 'Your song will be manually registered for copyright protection'
              } based on your subscription plan.
            </p>
            <div className="mt-2 text-xs text-gray-500">
              {copyrightType === 'automatic'
                ? 'Automatic registration includes AI-powered content verification and blockchain protection'
                : 'Manual registration requires review by our copyright team'
              }
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white rounded py-2 hover:bg-red-700 transition flex items-center justify-center space-x-2 mt-6"
          >
            {loading ? (
              <span>Uploading...</span>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Song</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}