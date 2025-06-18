// API client for making requests to the backend
// It handles authentication and request formatting

import { getApiUrl, getAuthToken } from './api-config';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  isFormData?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
}



export async function apiRequest<T = any>(
  path: string, 
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { 
    method = 'GET', 
    body, 
    headers: customHeaders = {}, 
    credentials = 'same-origin',
    isFormData = false 
  } = options;
    // Prepare headers
  const headers: Record<string, string> = { ...customHeaders };
  
  // Add content type header unless it's FormData (browser will set it automatically with boundary)
  if (!isFormData && body && method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }
  
  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Prepare request options
  const requestOptions: RequestInit = {
    method,
    headers,
    credentials,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  };
    // Handle query params
  let url = getApiUrl(path);
  
  // Add query parameters if they exist
  if (options.params) {
    const queryParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }
  
  const response = await fetch(url, requestOptions);
  
  // Parse response
  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }
  
  // Create response object
  const apiResponse: ApiResponse<T> = {
    data,
    status: response.status,
    headers: response.headers,
  };
  
  // Throw error for non-2xx responses
  if (!response.ok) {
    const error = new Error(typeof data === 'string' ? data : JSON.stringify(data)) as Error & {
      response: ApiResponse<T>;
    };
    error.response = apiResponse;
    throw error;
  }
  
  return apiResponse;
}

// Convenience methods
export const api = {
  get: <T = any>(path: string, options: Omit<ApiOptions, 'method' | 'body'> = {}) => 
    apiRequest<T>(path, { ...options, method: 'GET' }),
    
  post: <T = any>(path: string, body?: any, options: Omit<ApiOptions, 'method'> = {}) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),
    
  put: <T = any>(path: string, body?: any, options: Omit<ApiOptions, 'method'> = {}) =>
    apiRequest<T>(path, { ...options, method: 'PUT', body }),
    
  patch: <T = any>(path: string, body?: any, options: Omit<ApiOptions, 'method'> = {}) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body }),
    
  delete: <T = any>(path: string, body?: any, options: Omit<ApiOptions, 'method'> = {}) =>
    apiRequest<T>(path, { ...options, method: 'DELETE', body }),
};
