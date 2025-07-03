import { create } from 'zustand';
import axios from 'axios';

// Set default base URL for axios based on environment
const API_URL = import.meta.env.VITE_API_URL || '';
axios.defaults.baseURL = API_URL;

interface User {
  id: string;
  name: string;
  email: string;
  role: 'engineer' | 'manager';
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'engineer' | 'manager') => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      set({ token, user, isLoading: false });
      
      // Configure axios to use the token for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
    }
  },

  register: async (name, email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/api/auth/register', { 
        name, 
        email, 
        password, 
        role
      });
      
      const { token } = response.data;
      
      // Login after successful registration
      if (token) {
        localStorage.setItem('token', token);
        
        // Get user details
        const userResponse = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        set({ 
          token, 
          user: userResponse.data.data, 
          isLoading: false 
        });
        
        // Configure axios to use the token for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Registration failed', 
        isLoading: false 
      });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    set({ token: null, user: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null });
      return;
    }

    set({ isLoading: true });
    try {
      // Configure axios to use the token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get user details
      const response = await axios.get('/api/auth/me');
      set({ 
        user: response.data.data, 
        token, 
        isLoading: false 
      });
    } catch (error) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      set({ token: null, user: null, isLoading: false });
    }
  }
}));
