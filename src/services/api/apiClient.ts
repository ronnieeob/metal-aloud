type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: RequestMethod;
  headers?: HeadersInit;
  body?: any;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config: RequestInit = {
    method: options.method || 'GET',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Handle unauthorized access
      if (response.status === 401) {
        // Clear auth token and redirect to login
        localStorage.removeItem('auth_token');
        window.location.href = '/';
        throw new ApiError('Session expired. Please log in again.', 401);
      }

      const errorText = await response.text();
      throw new ApiError(
        errorText || `API request failed with status ${response.status}`,
        response.status
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      // In development, return mock data
      if (import.meta.env.DEV) {
        console.warn('API connection failed, using mock data');
        return null as T;
      } else {
        throw new ApiError('Unable to connect to the server. Please check your connection and try again.', 0);
      }
    }
    throw new ApiError(error instanceof Error ? error.message : 'Unknown error occurred', 0);
  }
}