import React, { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PaymentService } from '../../services/paymentService';

interface PaymentFormProps {
  amount: number;
  shippingDetails: {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  validateShipping: () => boolean;
  onSuccess: () => void;
  onError: (error: string) => void;
}

interface PaymentDetails {
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardName: string;
}

export function PaymentForm({ amount, shippingDetails, validateShipping, onSuccess, onError }: PaymentFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Cardholder name validation
    if (!paymentDetails.cardName?.trim()) {
      newErrors.cardName = 'Cardholder name is required';
    }

    // Card number validation
    if (!paymentDetails.cardNumber?.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(paymentDetails.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    // Expiry date validation
    if (!paymentDetails.cardExpiry?.trim()) {
      newErrors.cardExpiry = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(paymentDetails.cardExpiry)) {
      newErrors.cardExpiry = 'Invalid expiry date (MM/YY)';
    } else {
      const [month, year] = paymentDetails.cardExpiry.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiry < new Date()) {
        newErrors.cardExpiry = 'Card has expired';
      }
    }

    // CVV validation
    if (!paymentDetails.cardCvv?.trim()) {
      newErrors.cardCvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(paymentDetails.cardCvv)) {
      newErrors.cardCvv = 'Invalid CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentService = PaymentService.getInstance();
    
    // Reset any previous errors
    setErrors({});

    // Validate shipping details first
    if (!validateShipping()) {
      onError('Please fill in all shipping details');
      return;
    }

    // Validate cart
    const cartItems = JSON.parse(localStorage.getItem('metal_aloud_cart') || '[]');
    if (cartItems.length === 0) {
      onError('Your cart is empty');
      return;
    }

    // Then validate payment details
    if (!validateForm()) {
      onError('Please fill in all required fields correctly');
      return;
    }

    setLoading(true);

    try {
      const cartItems = JSON.parse(localStorage.getItem('metal_aloud_cart') || '[]');
      if (cartItems.length === 0) {
        throw new Error('Your cart is empty');
      }

      // Create order object
      const order = {
        userId: user?.id || '',
        items: cartItems.map(item => ({
          productId: item.product.id,
          artistId: item.product.artistId,
          quantity: item.quantity,
          priceAtTime: item.product.price
        })),
        status: 'pending',
        totalAmount: amount,
        shippingAddress: shippingDetails
      };

      // Process payment
      const result = await paymentService.processPayment(amount, paymentDetails, order);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      onSuccess();
      
    } catch (err) {
      console.error('Payment error:', err);
      // Show specific error messages
      if (err instanceof Error) {
        if (err.message.includes('card')) {
          onError('Invalid card details. Please check your card information.');
        } else if (err.message.includes('cart')) {
          onError('Your cart is empty. Please add items before checking out.');
        } else if (err.message.includes('stock')) {
          onError('Some items are out of stock.');
        } else {
          onError('Payment failed. Please try again.');
        }
      } else {
        onError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Luhn algorithm for card number validation
  const validateCardNumber = (number: string): boolean => {
    let sum = 0;
    let isEven = false;
    
    // Loop through values starting from the rightmost digit
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i));

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  // Format card number with spaces
  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-700 border border-red-900/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-red-400" />
            <h3 className="font-medium">Card Payment</h3>
          </div>
          <div className="flex items-center space-x-1 text-gray-400">
            <Lock className="w-4 h-4" />
            <span className="text-xs">Secure Payment</span>
          </div>
        </div>
        
        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Cardholder Name</label>
            <input
              type="text"
              value={paymentDetails.cardName}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, cardName: e.target.value })}
              className={`w-full bg-zinc-800 border ${
                errors.cardName ? 'border-red-500' : 'border-red-900/20'
              } rounded-lg p-3`}
              placeholder="Name on card"
            />
            {errors.cardName && (
              <p className="mt-1 text-sm text-red-500">{errors.cardName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Card Number</label>
            <input
              type="text"
              value={paymentDetails.cardNumber}
              onChange={(e) => {
                const value = formatCardNumber(e.target.value);
                setPaymentDetails({ ...paymentDetails, cardNumber: value });
              }}
              className={`w-full bg-zinc-800 border ${
                errors.cardNumber ? 'border-red-500' : 'border-red-900/20'
              } rounded-lg p-3`}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Expiry Date</label>
              <input
                type="text"
                value={paymentDetails.cardExpiry}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                  }
                  setPaymentDetails({ ...paymentDetails, cardExpiry: value });
                }}
                className={`w-full bg-zinc-800 border ${
                  errors.cardExpiry ? 'border-red-500' : 'border-red-900/20'
                } rounded-lg p-3`}
                placeholder="MM/YY"
                maxLength={5}
              />
              {errors.cardExpiry && (
                <p className="mt-1 text-sm text-red-500">{errors.cardExpiry}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">CVV</label>
              <input
                type="password"
                value={paymentDetails.cardCvv}
                onChange={(e) => setPaymentDetails({ ...paymentDetails, cardCvv: e.target.value.replace(/\D/g, '') })}
                className={`w-full bg-zinc-800 border ${
                  errors.cardCvv ? 'border-red-500' : 'border-red-900/20'
                } rounded-lg p-3`}
                placeholder="123"
                maxLength={4}
              />
              {errors.cardCvv && (
                <p className="mt-1 text-sm text-red-500">{errors.cardCvv}</p>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-400">
            Your payment is processed securely. We never store your payment details.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Pay ${amount.toFixed(2)}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}