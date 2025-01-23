import React, { useState } from 'react';
import { X, User } from 'lucide-react';

interface BandMemberModalProps {
  onClose: () => void;
  onSave: (member: Omit<BandMember, 'id'>) => void;
  member?: BandMember;
}

interface BandMember {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  joinDate: string;
  leaveDate?: string;
}

export function BandMemberModal({ onClose, onSave, member }: BandMemberModalProps) {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    role: member?.role || '',
    imageUrl: member?.imageUrl || '',
    joinDate: member?.joinDate || new Date().toISOString().split('T')[0],
    leaveDate: member?.leaveDate || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md border border-red-900/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-red-500">
            {member ? 'Edit Member' : 'Add Member'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium mb-2">Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
              placeholder="e.g., Lead Guitar, Drums, Vocals"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Join Date</label>
            <input
              type="date"
              value={formData.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Leave Date (Optional)</label>
            <input
              type="date"
              value={formData.leaveDate}
              onChange={(e) => setFormData({ ...formData, leaveDate: e.target.value })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
            />
          </div>

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
              <User className="w-4 h-4" />
              <span>{member ? 'Update Member' : 'Add Member'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}