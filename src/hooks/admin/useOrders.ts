import { useState, useEffect } from 'react';
import { Order } from '../../types';
import { AdminService } from '../../services/api/adminService';
import { useApi } from '../useApi';

interface OrderFilters {
  status?: Order['status'];
  fromDate?: string;
  toDate?: string;
}

export function useOrders(initialFilters?: OrderFilters) {
  const adminService = new AdminService();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filters, setFilters] = useState<OrderFilters>(initialFilters || {});

  const {
    loading,
    error,
    execute: fetchOrders
  } = useApi(
    () => adminService.getOrders(filters),
    {
      onSuccess: (data) => setOrders(data),
    }
  );

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const updatedOrder = await adminService.updateOrderStatus(orderId, status);
    setOrders(prev => prev.map(order => 
      order.id === orderId ? updatedOrder : order
    ));
  };

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    setFilters,
    refresh: fetchOrders
  };
}