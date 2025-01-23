import { useState, useEffect } from 'react';
import { Product } from '../types';
import { ProductService } from '../services/supabase/productService';
import { useLocalStorage } from './useLocalStorage';

export function useSupabaseProducts(artistId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const productService = new ProductService();
  const isDev = import.meta.env.DEV;
  const [mockProducts] = useLocalStorage<Product[]>('metal_aloud_products', [
    {
      id: '1',
      artistId: 'mock-artist-1',
      name: 'Metal Band T-Shirt',
      description: 'Official band merchandise',
      price: 29.99,
      imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27',
      category: 'clothing',
      stockQuantity: 100
    },
    {
      id: '2',
      artistId: 'mock-artist-2',
      name: 'Band Logo Patch',
      description: 'Embroidered patch with band logo',
      price: 9.99,
      imageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17',
      category: 'patches',
      stockQuantity: 50
    }
  ]);

  useEffect(() => {
    loadProducts();
  }, [artistId, loadProducts]);

  const loadProducts = async () => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Use mock data if Supabase is not configured
        setProducts(artistId ? mockProducts.filter(p => p.artistId === artistId) : mockProducts);
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await productService.getProducts(artistId);
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error(err);
      // Fallback to mock data on error
      setProducts(artistId ? mockProducts.filter(p => p.artistId === artistId) : mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const newProduct = await productService.createProduct(product);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      setError('Failed to add product');
      throw err;
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const updatedProduct = await productService.updateProduct(product);
      setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
      return updatedProduct;
    } catch (err) {
      setError('Failed to update product');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError('Failed to delete product');
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refresh: loadProducts
  };
}