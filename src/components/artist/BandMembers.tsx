import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';
import { BandMemberModal } from './BandMemberModal';

interface BandMember {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  joinDate: string;
  leaveDate?: string;
}

export function BandMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useLocalStorage<BandMember[]>(`metal_aloud_band_members_${user?.id}`, []);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<BandMember | null>(null);

  const handleSaveMember = (member: Omit<BandMember, 'id'>) => {
    if (editingMember) {
      setMembers(prev => prev.map(m => 
        m.id === editingMember.id ? { ...member, id: editingMember.id } : m
      ));
    } else {
      const newMember = {
        ...member,
        id: crypto.randomUUID(),
        artistId: user?.id
      };
      setMembers(prev => [...prev, newMember]);
    }
    setShowModal(false);
    setEditingMember(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-red-500">Band Members</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-zinc-900/50 rounded-lg p-4 border border-red-900/10"
          >
            <img
              src={member.imageUrl || 'https://via.placeholder.com/150'}
              alt={member.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-lg font-semibold text-center">{member.name}</h3>
            <p className="text-red-400 text-center text-sm mb-2">{member.role}</p>
            <div className="text-center text-sm text-gray-400">
              <p>Joined: {new Date(member.joinDate).toLocaleDateString()}</p>
              {member.leaveDate && (
                <p>Left: {new Date(member.leaveDate).toLocaleDateString()}</p>
              )}
            </div>

            <div className="flex justify-center space-x-2 mt-4">
              <button
                onClick={() => {
                  setEditingMember(member);
                  setShowModal(true);
                }}
                className="p-2 rounded-full bg-zinc-700/50 hover:bg-zinc-700 transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                className="p-2 rounded-full bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No band members added</p>
        </div>
      )}
      
      {showModal && (
        <BandMemberModal
          onClose={() => {
            setShowModal(false);
            setEditingMember(null);
          }}
          onSave={handleSaveMember}
          member={editingMember || undefined}
        />
      )}
    </div>
  );
}