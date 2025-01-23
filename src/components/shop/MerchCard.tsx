import React from 'react';
import { ShoppingCart, Globe, ExternalLink } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';

interface MerchCardProps {
  product: Product;
}

export function MerchCard({ product }: MerchCardProps) {
  const { addToCart } = useCart();
  const [loading, setLoading] = React.useState(false);

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      await addToCart(product, 1);
      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      message.textContent = 'Added to cart!';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 2000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      // Show error message
      const message = document.createElement('div');
      message.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      message.textContent = 'Failed to add to cart';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg border border-red-900/20 overflow-hidden group hover:border-red-500/40 transition-all duration-300">
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full aspect-square object-cover group-hover:scale-102 transition-transform duration-300" 
        />
      </div>
      
      <div className="p-3">
        <h3 className="font-semibold text-base mb-1">{product.name}</h3>
        <p className="text-xs text-gray-400 mb-2 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-red-400">${product.price.toFixed(2)}</span>
          {product.stockQuantity !== undefined && (
            <span className="text-xs text-gray-400">
              {product.stockQuantity} in stock
            </span>
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={handleAddToCart}
            disabled={loading || (product.stockQuantity !== undefined && product.stockQuantity === 0)}
            className="w-full py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{loading ? 'Adding...' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}