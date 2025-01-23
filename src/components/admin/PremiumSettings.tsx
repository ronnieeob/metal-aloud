import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Toggle, DollarSign, Settings, Save, Key } from 'lucide-react';
import { useAdminSettings } from '../../hooks/useAdminSettings';

interface PremiumPlan {
  id: string;
  name: string;
  type: 'artist' | 'user';
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
}

export function PremiumSettings() {
  const [plans, setPlans] = useLocalStorage<PremiumPlan[]>('metal_aloud_premium_plans', [
    {
      id: '1',
      name: 'Artist Pro',
      type: 'artist',
      price: 9.99,
      interval: 'monthly',
      features: [
        'Unlimited song uploads',
        'Advanced analytics',
        'Custom artist profile',
        'Priority support',
        'Ad-free experience',
        'Merch store'
      ],
      isActive: true
    },
    {
      id: '2',
      name: 'Artist Pro Yearly',
      type: 'artist', 
      price: 99.99,
      interval: 'yearly',
      features: [
        'Unlimited song uploads',
        'Advanced analytics',
        'Custom artist profile',
        'Priority support',
        'Ad-free experience',
        'Merch store',
        '2 months free'
      ],
      isActive: true
    },
    {
      id: '3',
      name: 'Premium User',
      type: 'user',
      price: 4.99,
      interval: 'monthly',
      features: [
        'Ad-free listening',
        'Offline mode',
        'High-quality audio',
        'Exclusive content access'
      ],
      isActive: true
    },
    {
      id: '4',
      name: 'Premium User Yearly',
      type: 'user',
      price: 49.99,
      interval: 'yearly',
      features: [
        'Ad-free listening',
        'Offline mode',
        'High-quality audio',
        'Exclusive content access',
        '2 months free'
      ],
      isActive: true
    }
  ]);

  const [premiumEnabled, setPremiumEnabled] = useState(true);
  const { loading, saveSettings } = useAdminSettings();
  const [error, setError] = useState<string | null>(null);
  const [paymentKeys, setPaymentKeys] = useLocalStorage('metal_aloud_payment_keys', {
    razorpay: '',
    gpay: '',
    stripe: ''
  });

  const handleSave = async () => {
    try {
      setError(null);
      
      const result = await saveSettings('metal_aloud_premium_settings', {
        enabled: premiumEnabled,
        paymentKeys,
        plans
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      console.error(err);
    }
  };

  const updatePlan = (planId: string, updates: Partial<PremiumPlan>) => {
    setPlans(prev => {
      const updated = prev.map(plan => 
        plan.id === planId ? { ...plan, ...updates } : plan
      );
      // Save to localStorage
      localStorage.setItem('metal_aloud_premium_plans', JSON.stringify(updated));
      return updated;
    });
  };

  const editPlanPrice = (planId: string, newPrice: number) => {
    if (newPrice < 0) return;
    updatePlan(planId, { price: newPrice });
  };

  const editPlanFeatures = (planId: string, features: string[]) => {
    updatePlan(planId, { features });
  };

  const editPlanName = (planId: string, name: string) => {
    updatePlan(planId, { name });
  };

  return (
    <div className="bg-zinc-800/50 rounded-lg p-6 border border-red-900/20">
      <h2 className="text-2xl font-bold text-red-500 mb-6">Premium Settings</h2>

      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Payment Gateway Keys */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Key className="w-5 h-5 text-red-400" />
            <span>Payment Gateway Keys</span>
          </h3>
          
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Razorpay API Key</label>
              <input
                type="text"
                value={paymentKeys.razorpay}
                onChange={(e) => setPaymentKeys(prev => ({ ...prev, razorpay: e.target.value }))}
                className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
                placeholder="rzp_test_..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Google Pay Merchant ID</label>
              <input
                type="text"
                value={paymentKeys.gpay}
                onChange={(e) => setPaymentKeys(prev => ({ ...prev, gpay: e.target.value }))}
                className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
                placeholder="merchant_..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Stripe Secret Key</label>
              <input
                type="text"
                value={paymentKeys.stripe}
                onChange={(e) => setPaymentKeys(prev => ({ ...prev, stripe: e.target.value }))}
                className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
                placeholder="sk_test_..."
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg">
          <div>
            <h3 className="font-semibold">Premium Features</h3>
            <p className="text-sm text-gray-400">Enable or disable premium features</p>
          </div>
          <button
            onClick={() => setPremiumEnabled(!premiumEnabled)}
            className={`relative w-14 h-7 transition-colors rounded-full ${
              premiumEnabled ? 'bg-red-600' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                premiumEnabled ? 'right-1' : 'left-1'
              }`}
            />
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Subscription Plans</h3>
          
          {/* Artist Plans */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-400">Artist Plans</h4>
            {plans
              .filter(plan => plan.type === 'artist')
              .map(plan => (
                <div key={plan.id} className="p-4 bg-zinc-900/50 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <input
                        type="text"
                        value={plan.name}
                        onChange={(e) => editPlanName(plan.id, e.target.value)}
                        className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2 mb-2"
                      />
                      <div className="flex items-center text-2xl font-bold text-red-400">
                        <DollarSign className="w-5 h-5" />
                        <input
                          type="number"
                          value={plan.price}
                          onChange={(e) => editPlanPrice(plan.id, parseFloat(e.target.value))}
                          step="0.01"
                          min="0"
                          className="w-24 bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
                        />
                        <span className="text-sm text-gray-400">/{plan.interval}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => updatePlan(plan.id, { isActive: !plan.isActive })}
                      className={`relative w-14 h-7 transition-colors rounded-full ${
                        plan.isActive ? 'bg-red-600' : 'bg-zinc-700'
                      }`}
                    >
                      <div
                        className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                          plan.isActive ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <textarea
                      value={plan.features.join('\n')}
                      onChange={(e) => editPlanFeatures(plan.id, e.target.value.split('\n').filter(f => f.trim()))}
                      className="w-full h-32 bg-zinc-700 border border-red-900/20 rounded p-2 text-sm"
                      placeholder="Enter features (one per line)"
                    />
                  </div>
                </div>
              ))}
          </div>

          {/* User Plans */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-400">User Plans</h4>
            {plans
              .filter(plan => plan.type === 'user')
              .map(plan => (
                <div key={plan.id} className="p-4 bg-zinc-900/50 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <input
                        type="text"
                        value={plan.name}
                        onChange={(e) => editPlanName(plan.id, e.target.value)}
                        className="w-full bg-zinc-700 border border-red-900/20 rounded px-3 py-2 mb-2"
                      />
                      <div className="flex items-center text-2xl font-bold text-red-400">
                        <DollarSign className="w-5 h-5" />
                        <input
                          type="number"
                          value={plan.price}
                          onChange={(e) => editPlanPrice(plan.id, parseFloat(e.target.value))}
                          step="0.01"
                          min="0"
                          className="w-24 bg-zinc-700 border border-red-900/20 rounded px-3 py-2"
                        />
                        <span className="text-sm text-gray-400">/{plan.interval}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => updatePlan(plan.id, { isActive: !plan.isActive })}
                      className={`relative w-14 h-7 transition-colors rounded-full ${
                        plan.isActive ? 'bg-red-600' : 'bg-zinc-700'
                      }`}
                    >
                      <div
                        className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                          plan.isActive ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <textarea
                      value={plan.features.join('\n')}
                      onChange={(e) => editPlanFeatures(plan.id, e.target.value.split('\n').filter(f => f.trim()))}
                      className="w-full h-32 bg-zinc-700 border border-red-900/20 rounded p-2 text-sm"
                      placeholder="Enter features (one per line)"
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}