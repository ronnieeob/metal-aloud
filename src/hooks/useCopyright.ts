import { useState } from 'react';
import { CopyrightService } from '../services/copyrightService';
import { useAuth } from '../contexts/AuthContext';

export function useCopyright() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copyrightService = CopyrightService.getInstance();
  const { user } = useAuth();

  const registerCopyright = async (
    songId: string, 
    type: 'automatic' | 'manual',
    useSubscription: boolean = true
  ) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);

      // Get active subscription if using subscription-based copyright
      let subscriptionId: string | undefined;
      if (useSubscription) {
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        subscriptionId = subscription?.id;
      }

      const registration = await copyrightService.registerCopyright(
        songId,
        user.id,
        type,
        subscriptionId
      );

      // Show success message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = `Copyright registration ${registration.copyrightId} successful`;
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);

      return registration;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register copyright';
      setError(errorMessage);
      
      // Show error message
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = errorMessage;
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyCopyright = async (songId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await copyrightService.verifyCopyright(songId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify copyright');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    registerCopyright,
    verifyCopyright,
    loading,
    error
  };
}