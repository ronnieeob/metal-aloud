import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export function UserManagement() {
  const [users, setUsers] = useLocalStorage<User[]>('metal_aloud_users', []);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-3 border border-red-900/20">
      <h2 className="text-lg font-bold text-red-500 mb-4">User Management</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-sm text-red-400 border-b border-red-900/20">
            <tr>
              <th className="py-1 px-2">User</th>
              <th className="py-1 px-2">Email</th>
              <th className="py-1 px-2">Role</th>
              <th className="py-1 px-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-900/10">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-red-900/10">
                <td className="py-1 px-2">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-sm">{user.name}</span>
                  </div>
                </td>
                <td className="py-1 px-2 text-sm">{user.email}</td>
                <td className="py-1 px-2">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                    className="bg-zinc-700 rounded px-2 py-1 text-sm"
                  >
                    <option value="user">User</option>
                    <option value="artist">Artist</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}