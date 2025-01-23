import React, { useState } from 'react';
import { X, Package } from 'lucide-react';
import { Product } from '../../types';

interface ProductModalProps {
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => void;
  initialProduct?: Product;
}

export function ProductModal({ onClose, onSave, initialProduct }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: initialProduct?.name || '',
    description: initialProduct?.description || '',
    price: initialProduct?.price || 29.99,
    imageUrl: initialProduct?.imageUrl || '',
    category: initialProduct?.category || 'clothing',
    stockQuantity: initialProduct?.stockQuantity || 1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md border border-red-900/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-red-500">
            {initialProduct ? 'Edit Product' : 'Add Product'}
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
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white h-24"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                step="0.01"
                min="0"
                className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Stock</label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                min="0"
                className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            >
              <option value="clothing">Clothing</option>
              <option value="accessories">Accessories</option>
              <option value="vinyl">Vinyl</option>
              <option value="cd">CDs</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full bg-zinc-800 border border-red-900/20 rounded p-2 text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white rounded py-2 hover:bg-red-700 transition flex items-center justify-center space-x-2"
          >
            <Package className="w-4 h-4" />
            <span>{initialProduct ? 'Update Product' : 'Add Product'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}