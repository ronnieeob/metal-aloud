import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then
  // parse stored json or return initialValue
  const readValue = () => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        // Add retry logic for storage errors
        const maxRetries = 3;
        let retries = 0;
        
        const attemptStore = () => {
          try {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (err) {
            if (retries < maxRetries) {
              retries++;
              setTimeout(attemptStore, 100 * retries);
            } else {
              console.warn(`Error setting localStorage key "${key}":`, err);
            }
          }
        };
        
        attemptStore();
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}