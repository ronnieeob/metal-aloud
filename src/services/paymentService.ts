import { supabase } from '../lib/supabase';
import { Order } from '../types';

interface PaymentResult {
  success: boolean;
  error?: string;
  transactionId?: string;
}

interface PaymentInitializationOptions {
  planId: string;
  interval: 'monthly' | 'yearly';
  userId: string;
  amount: number;
  currency: string;
}

interface PaymentInitializationResult {
  success: boolean;
  error?: string;
  method?: 'razorpay' | 'gpay';
  orderId?: string;
}

export class PaymentService {
  private static instance: PaymentService;
  private commissionRate = 0.08; // 8% platform fee

  private constructor() {}

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async initializePayment(options: PaymentInitializationOptions): Promise<PaymentInitializationResult> {
    try {
      // In development, simulate payment initialization
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          success: true,
          method: 'razorpay',
          orderId: 'order_' + Math.random().toString(36).substring(7)
        };
      }

      // In production, implement actual payment gateway integration
      // This would typically involve:
      // 1. Creating an order in your backend
      // 2. Getting payment gateway credentials
      // 3. Initializing the payment gateway
      
      throw new Error('Payment gateway not configured');
    } catch (err) {
      console.error('Payment initialization failed:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Payment initialization failed'
      };
    }
  }

  async confirmPayment(paymentId: string): Promise<boolean> {
    try {
      // In development, simulate payment confirmation
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      }

      // In production, implement actual payment confirmation
      throw new Error('Payment confirmation not implemented');
    } catch (err) {
      console.error('Payment confirmation failed:', err);
      return false;
    }
  }

  async processPayment(
    amount: number,
    paymentDetails: {
      cardNumber: string;
      cardExpiry: string;
      cardCvv: string;
      cardName: string;
    },
    order: Omit<Order, 'id'>
  ): Promise<PaymentResult> {
    try {
      // Enhanced validation
      if (!this.validatePaymentAmount(amount)) {
        throw new Error('Invalid payment amount');
      }

      if (!this.validateOrderItems(order.items)) {
        throw new Error('Invalid order items');
      }

      // Detailed card validation
      const cardValidation = this.validateCardDetails(paymentDetails);
      if (!cardValidation.isValid) {
        throw new Error(cardValidation.error || 'Invalid card details');
      }

      // Stock validation with detailed error
      const stockValidation = await this.validateStock(order.items);
      if (!stockValidation.valid) {
        throw new Error(`Stock validation failed: ${stockValidation.error}`);
      }

      // Validate cart
      const cartItems = JSON.parse(localStorage.getItem('metal_aloud_cart') || '[]');
      if (cartItems.length === 0) {
        throw new Error('Your cart is empty');
      }

      // Validate shipping address
      if (!order.shippingAddress || !this.validateShippingAddress(order.shippingAddress)) {
        throw new Error('Invalid shipping address');
      }

      // Validate order total matches cart total
      const cartTotal = this.calculateCartTotal();
      if (Math.abs(amount - cartTotal) > 0.01) { // Allow for small floating point differences
        throw new Error('Order amount mismatch');
      }

      // Validate stock availability
      for (const item of order.items) {
        const { data: product } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.productId)
          .single();

        if (!product || product.stock_quantity < item.quantity) {
          throw new Error('Some items are out of stock');
        }
      }

      // Process payment
      const paymentResult = await this.mockPaymentGateway(amount, paymentDetails);

      if (!paymentResult.success) {
        throw new Error(this.getDetailedPaymentError(paymentResult.error));
      }

      // Update stock quantities
      await this.updateStock(order.items);

      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([order])
        .select()
        .single();

      if (orderError) throw orderError;
      // Update stock quantities
      for (const item of order.items) {
        const { error: updateError } = await supabase
          .rpc('update_product_stock', {
            p_product_id: item.productId,
            p_quantity: item.quantity
          });

        if (updateError) throw updateError;
      }

      // Clear cart after successful order
      localStorage.removeItem('metal_aloud_cart');

      return {
        success: true,
        transactionId: paymentResult.transactionId
      };
    } catch (err) {
      console.error('Payment processing error:', err);
      // Enhanced error categorization
      const errorMessage = this.categorizePaymentError(err);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  private calculateCartTotal(): number {
    const cartItems = JSON.parse(localStorage.getItem('metal_aloud_cart') || '[]');
    return cartItems.reduce((total: number, item: any) => 
      total + (item.product.price * item.quantity), 0
    );
  }

  private validateShippingAddress(address: any): boolean {
    return !!(
      address.street?.trim() &&
      address.city?.trim() &&
      address.state?.trim() &&
      address.zipCode?.trim() &&
      address.country?.trim()
    );
  }

  private async validateStock(items: { productId: string; quantity: number }[]): Promise<{ valid: boolean; error?: string }> {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, stock_quantity')
      .in('id', items.map(item => item.productId));

    if (error) throw error;

    for (const item of items) {
      const product = products?.find(p => p.id === item.productId);
      if (!product) {
        return { valid: false, error: 'Product not found' };
      }
      if (product.stock_quantity < item.quantity) {
        return { valid: false, error: 'Insufficient stock' };
      }
    }

    return { valid: true };
  }

  private async updateStock(items: { productId: string; quantity: number }[]) {
    for (const item of items) {
      const { error } = await supabase.rpc('update_product_stock', {
        p_product_id: item.productId,
        p_quantity: item.quantity
      });
      if (error) throw error;
    }
  }

  private validateCardNumber(number: string): boolean {
    return /^\d{16}$/.test(number);
  }

  private validateExpiryDate(expiry: string): boolean {
    const [month, year] = expiry.split('/').map(num => parseInt(num));
    const now = new Date();
    const cardDate = new Date(2000 + year, month - 1);
    return cardDate > now;
  }

  private validateCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  }

  private async mockPaymentGateway(amount: number, details: any): Promise<PaymentResult> {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      transactionId: crypto.randomUUID()
    };
  }

  private validatePaymentAmount(amount: number): boolean {
    return amount > 0 && amount <= 10000; // Maximum transaction limit
  }

  private validateOrderItems(items: any[]): boolean {
    return items && items.length > 0 && items.every(item => 
      item.productId && item.quantity > 0
    );
  }

  private validateCardDetails(details: any): { isValid: boolean; error?: string } {
    if (!this.validateCardNumber(details.cardNumber)) {
      return { isValid: false, error: 'Invalid card number' };
    }
    if (!this.validateExpiryDate(details.cardExpiry)) {
      return { isValid: false, error: 'Card has expired' };
    }
    if (!this.validateCVV(details.cardCvv)) {
      return { isValid: false, error: 'Invalid CVV' };
    }
    return { isValid: true };
  }

  private getDetailedPaymentError(error: string): string {
    const errorMap: Record<string, string> = {
      'insufficient_funds': 'Insufficient funds in account',
      'card_declined': 'Card was declined',
      'expired_card': 'Card has expired',
      'invalid_cvc': 'Invalid security code',
      'processing_error': 'Payment processing error, please try again',
      'rate_limit': 'Too many payment attempts, please wait and try again'
    };
    return errorMap[error] || 'Payment failed. Please try again.';
  }

  private categorizePaymentError(error: any): string {
    if (error.message.includes('stock')) {
      return 'Some items are out of stock';
    }
    if (error.message.includes('card')) {
      return 'Invalid card details. Please check your card information.';
    }
    if (error.message.includes('amount')) {
      return 'Invalid payment amount';
    }
    return 'Payment failed. Please try again.';
  }
}