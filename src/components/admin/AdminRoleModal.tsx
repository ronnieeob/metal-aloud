import React, { useState } from 'react';
import { X, Shield, Upload, Camera } from 'lucide-react';
import { UserRole } from '../../types';
import { ProfilePictureUpload } from '../profile/ProfilePictureUpload';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  addedBy?: string;
  addedAt?: string;
}

interface AdminModalProps {
  onClose: () => void;
  onSave: (admin: AdminUser) => void;
  admin?: AdminUser;
  isEdit?: boolean;
}

export function AdminRoleModal({ onClose, onSave, admin, isEdit }: AdminModalProps) {
  const [formData, setFormData] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    role: admin?.role || 'admin' as UserRole,
    avatarUrl: admin?.avatarUrl || 'https://via.placeholder.com/150'
  });
  const [error, setError] = useState<string | null>(null);

  const [sendEmail, setSendEmail] = useState(true);

  const handleImageChange = async (file: File) => {
    try {
      // Create a local URL for the uploaded file
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatarUrl: url }));
      setError(null);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Image upload error:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adminData: AdminUser = {
      id: admin?.id || crypto.randomUUID(),
      ...formData,
      addedAt: admin?.addedAt || new Date().toISOString(),
      addedBy: admin?.addedBy
    };

    if (sendEmail && !isEdit) {
      // In production, implement email sending
      console.log('Sending access email to:', formData.email);
    }

    onSave(adminData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md border border-red-900/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-red-500">
            {isEdit ? 'Edit Admin' : 'Add Admin'}
          </h2>
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
          <ProfilePictureUpload
            currentImage={formData.avatarUrl}
            onImageChange={handleImageChange}
          />

          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
            >
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>

          {!isEdit && (
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="rounded bg-zinc-700 border-red-900/20 text-red-500"
              />
              <span>Send access request email</span>
            </label>
          )}

          <div className="flex justify-end space-x-4 pt-4">
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
              <Shield className="w-4 h-4" />
              <span>{isEdit ? 'Update Admin' : 'Add Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}