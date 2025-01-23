import React, { useState } from 'react';
import { useSupabaseProducts } from '../../hooks/useSupabaseProducts';
import { ShoppingBag, Filter, Search } from 'lucide-react';
import { Product } from '../../types';
import { MerchCard } from './MerchCard';
import { useAuth } from '../../contexts/AuthContext';

interface MerchSectionProps {
  artistId: string;
}

export function MerchSection({ artistId }: MerchSectionProps) {
  const { products, loading, error } = useSupabaseProducts(artistId);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const categories = [
    { id: 'clothing', name: 'Clothing' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'vinyl', name: 'Vinyl' },
    { id: 'cd', name: 'CDs' },
    { id: 'digital', name: 'Digital' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Loading merch...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 text-red-400 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-red-500">Merch Store</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search merch..."
              className="pl-10 pr-4 py-2 bg-zinc-800/50 border border-red-900/20 rounded text-white placeholder-gray-400"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="bg-zinc-800/50 border border-red-900/20 rounded px-3 py-2 text-white"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <MerchCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No merchandise found</p>
        </div>
      )}
    </div>
  );
}