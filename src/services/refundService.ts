import { supabase } from '../lib/supabase';
import { Order } from '../types';
import { PaymentService } from './paymentService';

interface RefundRequest {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  amount: number;
  createdAt: string;
}

export class RefundService {
  private static instance: RefundService;
  private paymentService: PaymentService;

  private constructor() {
    this.paymentService = PaymentService.getInstance();
  }

  static getInstance(): RefundService {
    if (!RefundService.instance) {
      RefundService.instance = new RefundService();
    }
    return RefundService.instance;
  }

  async requestRefund(
    orderId: string,
    userId: string,
    reason: string
  ): Promise<RefundRequest> {
    try {
      // Validate order exists and belongs to user
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', userId)
        .single();

      if (orderError || !order) {
        throw new Error('Order not found');
      }

      // Check if order is eligible for refund
      if (!this.isEligibleForRefund(order)) {
        throw new Error('Order is not eligible for refund');
      }

      // Create refund request
      const refundRequest: Omit<RefundRequest, 'id'> = {
        orderId,
        userId,
        reason,
        status: 'pending',
        amount: order.total_amount,
        createdAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('refund_requests')
        .insert([refundRequest])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Failed to request refund:', err);
      throw new Error('Failed to request refund');
    }
  }

  private isEligibleForRefund(order: Order): boolean {
    // Check if order is within refund window (14 days)
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const daysSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);

    return (
      daysSinceOrder <= 14 && // Within 14 days
      order.status !== 'cancelled' && // Not already cancelled
      order.status !== 'refunded' // Not already refunded
    );
  }

  async processRefund(refundRequestId: string): Promise<void> {
    try {
      // Get refund request
      const { data: refundRequest, error: refundError } = await supabase
        .from('refund_requests')
        .select('*')
        .eq('id', refundRequestId)
        .single();

      if (refundError || !refundRequest) {
        throw new Error('Refund request not found');
      }

      // Process refund through payment gateway
      const refundResult = await this.processPaymentRefund(
        refundRequest.orderId,
        refundRequest.amount
      );

      if (!refundResult.success) {
        throw new Error(refundResult.error || 'Refund failed');
      }

      // Update refund request status
      const { error: updateError } = await supabase
        .from('refund_requests')
        .update({ status: 'approved' })
        .eq('id', refundRequestId);

      if (updateError) throw updateError;

      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'refunded' })
        .eq('id', refundRequest.orderId);

      if (orderError) throw orderError;
    } catch (err) {
      console.error('Failed to process refund:', err);
      throw new Error('Failed to process refund');
    }
  }

  private async processPaymentRefund(orderId: string, amount: number) {
    // In development, simulate refund
    if (import.meta.env.DEV) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    }

    // In production, process actual refund
    try {
      // Implementation will be added for production
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Refund failed'
      };
    }
  }
}