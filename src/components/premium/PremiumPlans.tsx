import React, { useState } from 'react';
import { Check, DollarSign, CreditCard, Wallet } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CopyrightFeatures } from '../artist/CopyrightFeatures';
import { AppDownloadBanner } from '../AppDownloadBanner';
import { PaymentService } from '../../services/paymentService';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  type: 'artist' | 'user';
}

export function PremiumPlans({ initialType }: { initialType?: 'artist' | 'user' }) {
  const { user } = useAuth();
  const [selectedInterval, setSelectedInterval] = useState<'monthly' | 'yearly'>('monthly');
  const userType = initialType || user?.role || 'user';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  const plans: Plan[] = [
    {
      id: '1',
      name: 'Artist Pro',
      price: selectedInterval === 'monthly' ? 9.99 : 99.99,
      interval: selectedInterval,
      type: 'artist',
      isActive: true,
      features: [
        'Unlimited song uploads',
        'Advanced analytics',
        'Custom artist profile',
        'Priority support',
        'Ad-free experience',
        'Merch store',
        selectedInterval === 'yearly' ? '2 months free' : ''
      ].filter(Boolean)
    },
    {
      id: '2',
      name: 'Premium User',
      price: selectedInterval === 'monthly' ? 4.99 : 49.99,
      interval: selectedInterval,
      type: 'user',
      isActive: true,
      features: [
        'Ad-free listening',
        'Offline mode',
        'High-quality audio',
        'Exclusive content access',
        selectedInterval === 'yearly' ? '2 months free' : ''
      ].filter(Boolean)
    }
  ];

  // Filter plans based on user type
  const relevantPlans = plans.filter(plan => plan.type === userType);

  const handleSubscribe = async (plan: Plan) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('Please log in to subscribe');
      }

      // Validate plan is active
      if (!isActive) {
        throw new Error('This plan is currently unavailable');
      }

      // Initialize payment
      const paymentService = PaymentService.getInstance();
      const paymentResult = await paymentService.initializePayment({
        planId: plan.id,
        interval: selectedInterval,
        userId: user.id,
        amount: plan.price,
        currency: 'USD'
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.error);
      }

      // Handle different payment methods
      if (paymentResult.method === 'razorpay') {
        // Initialize Razorpay
        const options = {
          key: 'your_razorpay_key',
          amount: plan.price * 100, // Amount in smallest currency unit
          currency: 'INR',
          name: 'Metal Aloud',
          description: `${plan.name} Subscription`,
          order_id: paymentResult.orderId,
          handler: async function(response: any) {
            await paymentService.confirmPayment(response.razorpay_payment_id);
            // Show success message
            const message = document.createElement('div');
            message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            message.textContent = 'Subscription activated successfully!';
            document.body.appendChild(message);
            setTimeout(() => message.remove(), 3000);
          },
          prefill: {
            email: user?.email
          }
        };
        
        try {
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } catch (err) {
          console.error('Razorpay initialization failed:', err);
          throw new Error('Payment initialization failed');
        }
      } else if (paymentResult.method === 'gpay') {
        // Initialize Google Pay
        throw new Error('Google Pay integration coming soon');
      } else {
        throw new Error('No payment methods available');
      }
    } catch (err) {
      console.error('Payment failed:', err);
      // Show error message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = err instanceof Error ? err.message : 'Payment failed';
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 -mt-16">
      <AppDownloadBanner />
      <div className="w-full max-w-md mx-auto text-center">
      <h2 className="text-3xl font-bold text-center text-red-500 mb-8">
        {userType === 'artist' ? 'Upgrade Your Artist Account' : 'Upgrade Your Metal Experience'}
      </h2>

      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-zinc-800/80 rounded-lg p-1 backdrop-blur-sm">
          <button
            onClick={() => setSelectedInterval('monthly')}
            className={`px-4 py-2 rounded-lg transition ${
              selectedInterval === 'monthly'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedInterval('yearly')}
            className={`px-4 py-2 rounded-lg transition ${
              selectedInterval === 'yearly'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Yearly
            <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-sm mx-auto">
        {relevantPlans.map((plan, index) => (
          <div
            key={plan.id}
            className={`w-full bg-zinc-800/50 rounded-lg p-6 border border-red-900/20 transform hover:scale-105 transition-all duration-300 backdrop-blur-sm ${
              selectedInterval === 'monthly' ? 'order-0' : 'order-1'
            }`}
          >
            <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
            <div className="flex items-baseline mb-4">
              <DollarSign className="w-6 h-6 text-red-400" />
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-gray-400 ml-2">/{plan.interval}</span>
            </div>

            <ul className="space-y-2 mb-4">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="w-5 h-5 text-red-400 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Show copyright features for artist plans */}
            {plan.type === 'artist' && (
              <div className="mb-4">
                <CopyrightFeatures 
                  type={plan.name.toLowerCase().includes('pro') ? 'pro' : 'basic'}
                  interval={selectedInterval}
                />
              </div>
            )}

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={loading}
              className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Subscribe Now'}
            </button>

            <div className="mt-2 text-center text-xs text-gray-400">
              Secure payment via Razorpay
            </div>
            <div className="mt-2 flex justify-center space-x-2">
              <div className="flex items-center space-x-1 text-gray-400 px-3 py-1 bg-zinc-700/50 rounded">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Google Pay</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-400 px-3 py-1 bg-zinc-700/50 rounded">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Razorpay</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-400 px-3 py-1 bg-zinc-700/50 rounded">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">Cards</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-400 px-3 py-1 bg-zinc-700/50 rounded">
                <Wallet className="w-4 h-4" />
                <span className="text-sm">UPI</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}