import { useState, useEffect } from 'react';
import { authService } from '../lib/auth-service';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Load the current user on initial render
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.login({ email, password });
      setUser(result.user);
      return result;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (userData: any) => {
    setLoading(true);
    try {
      const result = await authService.register(userData);
      setUser(result.user);
      return result;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    authService.logout();
    setUser(null);
  };
  
  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user),
  };
}
