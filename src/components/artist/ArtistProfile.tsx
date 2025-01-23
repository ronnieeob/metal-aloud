import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { ArtistProfile as ArtistProfileType } from '../../types';
import { Save } from 'lucide-react';

export function ArtistProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profiles, setProfiles] = useLocalStorage<ArtistProfileType[]>('metal_aloud_artist_profiles', []);
  const currentProfile = profiles.find(p => p.userId === user?.id);
  
  const [formData, setFormData] = useState({
    bio: currentProfile?.bio || '',
    website: currentProfile?.website || '',
    socialLinks: {
      spotify: currentProfile?.socialLinks.spotify || '',
      youtube: currentProfile?.socialLinks.youtube || '',
      instagram: currentProfile?.socialLinks.instagram || '',
      twitter: currentProfile?.socialLinks.twitter || ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.bio.trim()) {
        throw new Error('Bio is required');
      }

      // Validate URLs
      const urlFields = [formData.website, ...Object.values(formData.socialLinks)];
      urlFields.forEach(url => {
        if (url && !url.startsWith('http')) {
          throw new Error('Please enter valid URLs starting with http:// or https://');
        }
      });

      const updatedProfile: ArtistProfileType = {
        id: currentProfile?.id || crypto.randomUUID(),
        userId: user?.id!,
        ...formData,
        verified: currentProfile?.verified || false,
        updatedAt: new Date().toISOString()
      };

      if (currentProfile) {
        setProfiles(profiles.map(p => 
          p.id === updatedProfile.id ? updatedProfile : p
        ));
      } else {
        setProfiles([...profiles, updatedProfile]);
      }

      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = 'Profile updated successfully';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);

    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Artist Profile</h2>
      
      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
            className="w-full h-32 rounded bg-zinc-700 border border-red-900/20 p-3"
            placeholder="Tell your fans about yourself..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={e => setFormData({ ...formData, website: e.target.value })}
            className="w-full rounded bg-zinc-700 border border-red-900/20 p-3"
            placeholder="https://your-website.com"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Social Links</h3>
          
          {Object.entries(formData.socialLinks).map(([platform, url]) => (
            <div key={platform}>
              <label className="block text-sm font-medium mb-2 capitalize">
                {platform}
              </label>
              <input
                type="url"
                value={url}
                onChange={e => setFormData({
                  ...formData,
                  socialLinks: {
                    ...formData.socialLinks,
                    [platform]: e.target.value
                  }
                })}
                className="w-full rounded bg-zinc-700 border border-red-900/20 p-3"
                placeholder={`https://${platform}.com/your-profile`}
              />
            </div>
          ))}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}