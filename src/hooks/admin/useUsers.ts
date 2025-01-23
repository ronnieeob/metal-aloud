import { useState, useEffect } from 'react';
import { User } from '../../types';
import { AdminService } from '../../services/api/adminService';
import { useApi } from '../useApi';

export function useUsers() {
  const adminService = new AdminService();
  const [users, setUsers] = useState<User[]>([]);

  const {
    loading,
    error,
    execute: fetchUsers
  } = useApi(
    () => adminService.getUsers(),
    {
      onSuccess: (data) => setUsers(data),
    }
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, role: User['role']) => {
    const updatedUser = await adminService.updateUserRole(userId, role);
    setUsers(prev => prev.map(user => 
      user.id === userId ? updatedUser : user
    ));
  };

  const deleteUser = async (userId: string) => {
    await adminService.deleteUser(userId);
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  return {
    users,
    loading,
    error,
    updateUserRole,
    deleteUser,
    refresh: fetchUsers
  };
}