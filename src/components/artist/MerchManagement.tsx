import React, { useState } from 'react';
import { Product } from '../../types';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Edit2, Trash2, Package, Tag, ArrowUpDown, Loader } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { ProductModal } from './ProductModal';
import { CategoryFilter } from './CategoryFilter';
import { SortProducts, SortOption } from './SortProducts';

export function MerchManagement() {
  const { user } = useAuth();
  const [products, setProducts] = useLocalStorage<Product[]>('metal_aloud_products', []);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const artistProducts = products.filter(product => product.artistId === user?.id);

  // Ensure we have a valid array of products
  const productsList = Array.isArray(products) ? products : [];

  const sortProducts = (products: Product[]) => {
    switch (sortBy) {
      case 'name':
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
      case 'price':
        return [...products].sort((a, b) => a.price - b.price);
      case 'stock':
        return [...products].sort((a, b) => b.stockQuantity - a.stockQuantity);
      case 'newest':
        return [...products].reverse(); // Assuming newer products are added last
      default:
        return products;
    }
  };

  const filteredProducts = sortProducts(artistProducts
    .filter(product => selectedCategory ? product.category === selectedCategory : true));

  const handleSaveProduct = async (product: Omit<Product, 'id'>) => {
    try {
      setLoading(true);
      if (editingProduct) {
        setProducts(prev => prev.map(p => 
          p.id === editingProduct.id ? { ...product, id: editingProduct.id } : p
        ));
      } else {
        const newProduct = { ...product, id: crypto.randomUUID() };
        setProducts(prev => [...prev, newProduct]);
      }
      setShowModal(false);
      setEditingProduct(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
      console.error('Failed to save product:', err instanceof Error ? err.message : err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        setProducts(prev => prev.filter(p => p.id !== productId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete product');
        console.error('Failed to delete product:', err instanceof Error ? err.message : err);
      }
    }
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
        {error instanceof Error ? error.message : 'Failed to load products. Please try again.'}
      </div>
    );
  }

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-red-500">Your Merchandise</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={(category) => setSelectedCategory(category)}
        />
        <SortProducts
          sortBy={sortBy}
          onSort={(option) => setSortBy(option)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="bg-zinc-900/50 rounded-lg p-4 border border-red-900/10"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full aspect-square object-cover rounded-lg mb-4"
            />
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-sm text-gray-400 line-clamp-2 mb-2">{product.description}</p>
            <div className="flex items-center space-x-2 mb-2">
              <Tag className="w-4 h-4 text-red-400" />
              <span className="text-red-400 font-semibold">${product.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                {product.stockQuantity} in stock
              </span>
            </div>
            
            <div className="h-px bg-red-900/20 my-4" />
            
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setEditingProduct(product);
                  setShowModal(true);
                }}
                className="p-2 rounded-full bg-zinc-700/50 hover:bg-zinc-700 transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteProduct(product.id)}
                className="p-2 rounded-full bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center text-gray-400 py-12">No products added yet</p>
      )}

      {showModal && (
        <ProductModal
          onClose={() => { setShowModal(false); setEditingProduct(null); }}
          onSave={handleSaveProduct}
          initialProduct={editingProduct || undefined}
        />
      )}
    </div>
  );
}