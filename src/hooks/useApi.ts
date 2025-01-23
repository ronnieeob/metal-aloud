import { useState, useCallback } from 'react';
import { ApiError } from '../services/api/apiClient';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(async (...args: any[]) => {
    try {
      setLoading(true);
      setError(null);
      setError(null);
      const result = await apiFunction(...args);
      
      // If result is null in dev mode, use mock data
      if (result === null && import.meta.env.DEV) {
        const mockData = await import('../services/mockService').then(m => 
          new m.MockService().getMockData(apiFunction.name)
        );
        setData(mockData);
        options.onSuccess?.(mockData);
        return mockData;
      }
      
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      // Enhanced error handling
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      const apiError = err instanceof ApiError 
        ? err 
        : new ApiError(errorMessage, 500);
      setError(apiError);
      options.onError?.(apiError);
      
      // Show error toast
      const message = document.createElement('div');
      message.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      message.textContent = errorMessage;
      document.body.appendChild(message);
      setTimeout(() => message.remove(), 3000);
      
      // In development, use mock data on error
      if (import.meta.env.DEV) {
        const mockData = await import('../services/mockService').then(m => 
          new m.MockService().getMockData(apiFunction.name)
        );
        setData(mockData);
        return mockData;
      }
      
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, options.onSuccess, options.onError]);

  return {
    data,
    loading,
    error,
    execute,
  };
}