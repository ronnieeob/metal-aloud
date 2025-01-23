import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Search, UserPlus, X, Edit2 } from 'lucide-react';
import { UserRole } from '../../types';
import { AdminRoleModal } from './AdminRoleModal';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  addedBy?: string;
  addedAt?: string;
}

export function AdminRoleManagement() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('metal_aloud_admin_users') || '[]');
    } catch {
      return [];
    }
  });

  const handleSaveAdmin = (adminData: AdminUser) => {
    if (editingAdmin) {
      setAdminUsers(prev => {
        const updated = prev.map(admin => 
          admin.id === editingAdmin.id ? { ...adminData, addedBy: admin.addedBy } : admin
        );
        localStorage.setItem('metal_aloud_admin_users', JSON.stringify(updated));
        return updated;
      });
    } else {
      const newAdmin = {
        ...adminData,
        addedBy: user?.id,
        addedAt: new Date().toISOString()
      };
      setAdminUsers(prev => {
        const updated = [...prev, newAdmin];
        localStorage.setItem('metal_aloud_admin_users', JSON.stringify(updated));
        return updated;
      });
    }
    setShowModal(false);
    setEditingAdmin(null);
  };

  const handleEdit = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setShowModal(true);
  };

  const handleRemoveAdmin = (adminId: string) => {
    if (confirm('Are you sure you want to remove this admin?')) {
      setAdminUsers(prev => {
        const updated = prev.filter(admin => admin.id !== adminId);
        localStorage.setItem('metal_aloud_admin_users', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const filteredAdmins = adminUsers.filter(admin =>
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-red-500">Admin Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setEditingAdmin(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search admins and moderators..."
            className="w-full bg-zinc-700 border border-red-900/20 rounded-lg pl-10 pr-4 py-2"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
      </div>

      <div className="space-y-4">
        {filteredAdmins.map((admin) => (
          <div
            key={admin.id}
            className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-red-900/10"
          >
            <div className="flex items-center space-x-4">
              <img
                src={admin.avatarUrl}
                alt={admin.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-medium">{admin.name}</h3>
                <p className="text-sm text-gray-400">{admin.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    admin.role === 'admin' 
                      ? 'bg-red-900/20 text-red-400'
                      : 'bg-zinc-700 text-gray-400'
                  }`}>
                    {admin.role === 'admin' ? 'Admin' : 'Moderator'}
                  </span>
                  {admin.addedBy && (
                    <span className="text-xs text-gray-500">
                      Added {new Date(admin.addedAt!).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(admin)}
                className="p-2 rounded-full bg-zinc-700/50 hover:bg-zinc-700 transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRemoveAdmin(admin.id)}
                className="p-2 rounded-full bg-red-900/20 text-red-400 hover:bg-red-900/30 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredAdmins.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No admins or moderators found</p>
          </div>
        )}
      </div>
      
      {showModal && (
        <AdminRoleModal
          onClose={() => {
            setShowModal(false);
            setEditingAdmin(null);
          }}
          onSave={handleSaveAdmin}
          admin={editingAdmin}
          isEdit={!!editingAdmin}
        />
      )}
    </div>
  );
}