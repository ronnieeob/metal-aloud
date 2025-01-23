import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Save, Loader, MapPin, Link, Mail } from 'lucide-react';
import { ProfileImage } from './ProfileImage';
import { useSocialActions } from '../../hooks/useSocialActions'; 

export function ProfileSettings() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { followers, following } = useSocialActions();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatarUrl: user?.avatarUrl || '',
    bio: user?.bio || '',
    website: user?.website || '',
    location: user?.location || '',
    socialLinks: {
      twitter: '',
      instagram: '',
      facebook: '',
      youtube: ''
    }
  });

  const handleImageChange = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const reader = new FileReader();

      reader.onloadend = () => {
        localStorage.setItem(`metal_aloud_profile_image_${user?.id}`, reader.result as string);
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Profile Settings</h2>
      
      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <ProfileImage
          currentImage={formData.avatarUrl || 'https://via.placeholder.com/150'}
          onImageChange={handleImageChange}
        />

        <div className="bg-zinc-900/50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Network Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
              <div className="text-2xl font-bold text-red-400">{following.length}</div>
              <div className="text-sm text-gray-400">Following</div>
            </div>
            <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
              <div className="text-2xl font-bold text-red-400">{followers.length}</div>
              <div className="text-sm text-gray-400">Followers</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded bg-zinc-700 border border-red-900/20 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded bg-zinc-700 border border-red-900/20 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full h-32 rounded bg-zinc-700 border border-red-900/20 px-3 py-2"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full rounded bg-zinc-700 border border-red-900/20 px-3 py-2"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full rounded bg-zinc-700 border border-red-900/20 px-3 py-2"
              placeholder="City, Country"
            />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Social Links</h3>
          <div className="grid grid-cols-2 gap-4">
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
                  className="w-full rounded bg-zinc-700 border border-red-900/20 px-3 py-2"
                  placeholder={`https://${platform}.com/...`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}