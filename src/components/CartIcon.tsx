import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { useClickOutside } from '../hooks/useClickOutside';

export function CartIcon() {
  const { user } = useAuth();
  const { items, removeFromCart } = useCart();
  const { setActiveSection } = useNavigation();
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setShowDropdown(false));

  if (!user) return null;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-3 text-gray-400 hover:text-red-400 transition bg-zinc-900 rounded-full border border-red-900/20 relative"
      >
        <ShoppingCart className="w-6 h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-zinc-900 rounded-lg shadow-lg border border-red-900/20 z-50">
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-4">Shopping Cart</h3>
            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-400">
                          {item.quantity} × ${item.product.price.toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t border-red-900/20 pt-4 mt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${items.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setActiveSection('checkout');
                    }}
                    className="w-full mt-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-400">Your cart is empty</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}