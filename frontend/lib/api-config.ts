// This file contains the configuration for API endpoints
// It allows switching between the Next.js API routes and the separate Express backend

// Set this to true to use the separate Express backend, or false to use Next.js API routes
const USE_EXPRESS_BACKEND = true;

// The base URL of the Express backend server
const EXPRESS_BACKEND_URL = typeof window !== 'undefined' 
  ? process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api' 
  : process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

// Function to get the correct API URL based on the configuration
export function getApiUrl(path: string): string {
  // Remove the leading slash if it exists
  const apiPath = path.startsWith('/api/') ? path.substring(5) : path;
  
  if (USE_EXPRESS_BACKEND) {
    return `${EXPRESS_BACKEND_URL}/${apiPath}`;
  } else {
    return `/api/${apiPath}`;
  }
}

// Configuration for authentication with the Express backend
export const authConfig = {
  // Add any auth-specific configuration here
  tokenKey: 'auth_token', // localStorage key for storing JWT token
};

// Helper function to get stored auth token
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(authConfig.tokenKey);
}

// Helper function to set auth token
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(authConfig.tokenKey, token);
}

// Helper function to remove auth token (for logout)
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(authConfig.tokenKey);
}
