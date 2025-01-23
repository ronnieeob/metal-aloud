import { useState, useEffect } from 'react';
import { Product } from '../types';
import { ProductService } from '../services/api/productService';
import { useApi } from './useApi';

export function useProducts(artistId: string) {
  const productService = new ProductService();
  const [products, setProducts] = useState<Product[]>([]);
  
  const {
    loading,
    error,
    execute: fetchProducts
  } = useApi(
    () => productService.getProducts(artistId),
    {
      onSuccess: (data) => setProducts(data),
    }
  );

  useEffect(() => {
    fetchProducts();
  }, [artistId]);

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct = await productService.createProduct(product);
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = async (product: Product) => {
    const updatedProduct = await productService.updateProduct(product);
    setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
    return updatedProduct;
  };

  const deleteProduct = async (id: string) => {
    await productService.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refresh: fetchProducts
  };
}