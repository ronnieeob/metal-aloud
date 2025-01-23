import { useState } from 'react';
import { Product } from '../types';
import { useLocalStorage } from './useLocalStorage';

interface CartItem {
  product: Product;
  quantity: number;
}

export function useCart() {
  const [cart, setCart] = useLocalStorage<CartItem[]>('metal_aloud_cart', []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToCart = async (product: Product, quantity: number) => {
    try {
      setLoading(true);
      setError(null);

      // Check if item already exists in cart
      const existingItem = cart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Update quantity if item exists
        setCart(cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
      } else {
        // Add new item if it doesn't exist
        setCart([...cart, { product, quantity }]);
      }
    } catch (err) {
      setError('Failed to add item to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  return {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal
  };
}