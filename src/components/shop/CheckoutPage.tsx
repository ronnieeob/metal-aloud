import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { Truck, ShoppingBag } from 'lucide-react';
import { PaymentForm } from './PaymentForm';

import { DownloadManager } from './DownloadManager';

interface ShippingDetails {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { setActiveSection } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    name: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const validateShippingDetails = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!shippingDetails.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!shippingDetails.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!shippingDetails.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!shippingDetails.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!shippingDetails.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!shippingDetails.zipCode.trim()) {
      newErrors.zipCode = 'ZIP Code is required';
    }
    if (!shippingDetails.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ShoppingBag className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-4">Add some awesome merch to get started!</p>
        <button
          onClick={() => setActiveSection('shop')}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-red-500 mb-8">Checkout</h1>
      {/* Show downloads for digital items */}
      {items.some(item => item.product.category === 'digital') && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-red-500 mb-4">Digital Downloads</h2>
          <DownloadManager />
        </div>
      )}

      <div className="grid grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="col-span-1 bg-zinc-800/50 rounded-lg p-6 border border-red-900/20 h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p>${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="border-t border-red-900/20 pt-4 mt-4">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="col-span-2">
          <div className="space-y-6">
            <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Shipping Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={shippingDetails.name}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, name: e.target.value })}
                    className={`w-full bg-zinc-700 border ${
                      errors.name ? 'border-red-500' : 'border-red-900/20'
                    } rounded px-3 py-2`}
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={shippingDetails.email}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                    className={`w-full bg-zinc-700 border ${
                      errors.email ? 'border-red-500' : 'border-red-900/20'
                    } rounded px-3 py-2`}
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    value={shippingDetails.address}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                    className={`w-full bg-zinc-700 border ${
                      errors.address ? 'border-red-500' : 'border-red-900/20'
                    } rounded px-3 py-2`}
                    required
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={shippingDetails.city}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                    className={`w-full bg-zinc-700 border ${
                      errors.city ? 'border-red-500' : 'border-red-900/20'
                    } rounded px-3 py-2`}
                    required
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <input
                    type="text"
                    value={shippingDetails.state}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, state: e.target.value })}
                    className={`w-full bg-zinc-700 border ${
                      errors.state ? 'border-red-500' : 'border-red-900/20'
                    } rounded px-3 py-2`}
                    required
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-500">{errors.state}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={shippingDetails.zipCode}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, zipCode: e.target.value })}
                    className={`w-full bg-zinc-700 border ${
                      errors.zipCode ? 'border-red-500' : 'border-red-900/20'
                    } rounded px-3 py-2`}
                    required
                  />
                  {errors.zipCode && (
                    <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <input
                    type="text"
                    value={shippingDetails.country}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, country: e.target.value })}
                    className={`w-full bg-zinc-700 border ${
                      errors.country ? 'border-red-500' : 'border-red-900/20'
                    } rounded px-3 py-2`}
                    required
                  />
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-500">{errors.country}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                Payment Details
              </h2>
              <PaymentForm 
                amount={total}
                shippingDetails={shippingDetails}
                validateShipping={validateShippingDetails}
                onSuccess={() => {
                  clearCart();
                  const message = document.createElement('div');
                  message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                  message.innerHTML = `
                    <h4 class="font-bold">Order Placed Successfully!</h4>
                    <p class="text-sm">Thank you for your purchase</p>
                  `;
                  document.body.appendChild(message);
                  setTimeout(() => message.remove(), 3000);
                  setActiveSection('home');
                }}
                onError={(error) => {
                  const message = document.createElement('div');
                  message.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                  message.innerHTML = `
                    <h4 class="font-bold">Payment Failed</h4>
                    <p class="text-sm">${error}</p>
                  `;
                  document.body.appendChild(message);
                  setTimeout(() => message.remove(), 3000);
                }}
              />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}