// Authentication service for the Express backend
import { api } from './api-client';
import { setAuthToken, removeAuthToken, getAuthToken } from './api-config';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface AuthResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials) {
    const response = await api.post<AuthResponse>('auth/login', credentials);
    setAuthToken(response.data.token);
    return response.data;
  },
  
  /**
   * Register a new user
   */
  async register(data: RegisterData) {
    const response = await api.post<AuthResponse>('auth/register', data);
    setAuthToken(response.data.token);
    return response.data;
  },
  
  /**
   * Logout the current user
   */
  logout() {
    removeAuthToken();
  },
  
  /**
   * Check if the user is authenticated
   */
  isAuthenticated() {
    return !!getAuthToken();
  },
  
  /**
   * Get the current user profile
   */
  async getCurrentUser() {
    if (!this.isAuthenticated()) {
      return null;
    }
    
    try {
      const response = await api.get('user/profile');
      return response.data;
    } catch (error) {
      // If we get an auth error, clear the token
      if ((error as any).response?.status === 401) {
        this.logout();
      }
      return null;
    }
  }
};
