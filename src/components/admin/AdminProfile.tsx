import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Save, Loader } from 'lucide-react';
import { ProfilePictureUpload } from '../profile/ProfilePictureUpload';
import { syncProfileAndLogo } from '../../utils/imageSync';
import { useAdminSettings } from '../../hooks/useAdminSettings';

export function AdminProfile() {
  const { user } = useAuth();
  const { saveSettings } = useAdminSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatarUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c',
    role: 'admin',
    bio: user?.bio || '',
    contactEmail: user?.contactEmail || '',
    adminSince: user?.adminSince || new Date().toISOString().split('T')[0]
  });

  const handleImageChange = async (file: File) => {
    try {
      setLoading(true);
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Sync the image across the application
          syncProfileAndLogo(reader.result);
          setFormData(prev => ({ ...prev, avatarUrl: reader.result }));
        }
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
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await saveSettings('metal_aloud_admin_profile', {
        ...formData,
        userId: user.id,
        updatedAt: new Date().toISOString()
      }, validateProfile);
      
      if (result.success) {
        // Ensure image is synced after profile update
        syncProfileAndLogo(formData.avatarUrl);
        // Show success message
        const message = document.createElement('div');
        message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        message.textContent = 'Profile updated successfully';
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 3000);
      } else {
        throw new Error(result.error);
      }
      
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const validateProfile = (data: any) => {
    if (!user) return 'User not authenticated';
    
    if (!data.name.trim() || !data.email.trim()) {
      return 'Name and email are required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return 'Please enter a valid email address';
    }
    return true;
  };

  if (!user) {
    return (
      <div className="text-center text-red-500 py-8">
        Please log in to access admin profile
      </div>
    );
  }

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Admin Profile</h2>
      
      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <ProfilePictureUpload
          currentImage={formData.avatarUrl || 'https://via.placeholder.com/150'}
          onImageChange={handleImageChange}
        />

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
            <label className="block text-sm font-medium mb-2">Contact Email</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full rounded bg-zinc-700 border border-red-900/20 px-3 py-2"
              placeholder="Public contact email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Admin Since</label>
            <input
              type="date"
              value={formData.adminSince}
              onChange={(e) => setFormData({ ...formData, adminSince: e.target.value })}
              className="w-full rounded bg-zinc-700 border border-red-900/20 px-3 py-2"
            />
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