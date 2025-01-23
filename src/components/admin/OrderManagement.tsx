import React, { useState } from 'react';
import { useOrders } from '../../hooks/admin/useOrders';
import { Order } from '../../types';
import { Package, Calendar, Filter, Loader } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-yellow-500',
  processing: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500'
} as const;

export function OrderManagement() {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedStatus, setSelectedStatus] = useState<Order['status'] | ''>('');
  
  const { orders, loading, error, updateOrderStatus, setFilters } = useOrders();

  const handleFilterChange = () => {
    setFilters({
      status: selectedStatus || undefined,
      fromDate: dateRange.from || undefined,
      toDate: dateRange.to || undefined
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Order Management</h2>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as Order['status'] | '')}
            className="w-full bg-zinc-700 rounded border border-red-900/20 px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">From Date</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            className="w-full bg-zinc-700 rounded border border-red-900/20 px-3 py-2"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">To Date</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            className="w-full bg-zinc-700 rounded border border-red-900/20 px-3 py-2"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleFilterChange}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="text-left border-b border-red-900/20">
            <tr>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-900/10">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-red-900/10">
                <td className="py-3 px-4">{order.id.slice(0, 8)}</td>
                <td className="py-3 px-4">{order.userId}</td>
                <td className="py-3 px-4">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">${order.totalAmount.toFixed(2)}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    STATUS_COLORS[order.status]
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                    className="bg-zinc-700 rounded px-2 py-1 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <p className="text-center text-gray-400 py-8">No orders found</p>
        )}
      </div>
    </div>
  );
}