import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface SaveResult {
  success: boolean;
  error?: string;
}

export function useAdminSettings() {
  const [loading, setLoading] = useState(false);

  const showSuccessMessage = () => {
    const message = document.createElement('div');
    message.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    message.textContent = 'Settings saved successfully';
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
  };

  const showErrorMessage = (error: string) => {
    const message = document.createElement('div');
    message.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    message.textContent = error;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
  };

  const saveSettings = async <T>(
    key: string, 
    data: T, 
    validate?: (data: T) => boolean | string
  ): Promise<SaveResult> => {
    try {
      setLoading(true);

      // Validate data if validation function provided
      if (validate) {
        const validationResult = validate(data);
        if (typeof validationResult === 'string') {
          throw new Error(validationResult);
        }
        if (!validationResult) {
          throw new Error('Validation failed');
        }
      }

      // Save to localStorage
      localStorage.setItem(key, JSON.stringify(data));

      // Trigger storage event for real-time updates
      window.dispatchEvent(new Event('storage'));

      showSuccessMessage();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      showErrorMessage(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    saveSettings
  };
}