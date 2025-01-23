import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search } from 'lucide-react';
import { MerchCard } from './MerchCard';
import { MerchFilters } from './MerchFilters';
import { useSupabaseProducts } from '../../hooks/useSupabaseProducts';
import { AppDownloadBanner } from '../AppDownloadBanner';

export function MerchShop() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  
  const { products, loading } = useSupabaseProducts();

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesCategory && matchesSearch && matchesPrice;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <AppDownloadBanner />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-red-500">Metal Merch Shop</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search merch..."
              className="pl-8 pr-3 py-1.5 bg-zinc-800/50 border border-red-900/20 rounded text-sm text-white placeholder-gray-400"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Filters Sidebar */}
        <div className="col-span-1">
          <MerchFilters
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
          />
        </div>

        {/* Products Grid */}
        <div className="col-span-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading awesome merch...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <MerchCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-400">No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}