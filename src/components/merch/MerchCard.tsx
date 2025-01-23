import React, { useState } from 'react';
import { ShoppingBag, ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../hooks/useCart';

interface MerchCardProps {
  product: Product;
}

export function MerchCard({ product }: MerchCardProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await addToCart(product, quantity);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-4 border border-red-900/20">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full aspect-square object-cover rounded-lg mb-4"
      />
      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{product.description}</p>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-xl font-bold text-red-400">${product.price.toFixed(2)}</span>
        <span className="text-sm text-gray-400">
          {product.stockQuantity} in stock
        </span>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <label className="text-sm text-gray-400">Quantity:</label>
        <select
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="bg-zinc-700 border border-red-900/20 rounded px-2 py-1"
        >
          {[...Array(Math.min(10, product.stockQuantity))].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={adding || product.stockQuantity === 0}
        className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {adding ? (
          <span>Adding...</span>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            <span>{product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
          </>
        )}
      </button>
    </div>
  );
}