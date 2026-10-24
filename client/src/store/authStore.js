import { create } from 'zustand';
import {
  customerLogin,
  customerRegister,
  customerLogout,
  fetchCurrentUser,
} from '../services/api.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('shaadivibe_customer_token') || '',
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initAuth: async () => {
    set({ isLoading: true, error: null });
    const storedToken = localStorage.getItem('shaadivibe_customer_token');
    try {
      const user = await fetchCurrentUser();
      set({
        user,
        token: storedToken || '',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      // Unauthenticated or expired token
      set({
        user: null,
        token: '',
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await customerLogin(email, password);
      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return res.user;
    } catch (err) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await customerRegister(name, email, password);
      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return res.user;
    } catch (err) {
      set({ isLoading: false, error: err.message || 'Registration failed' });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await customerLogout();
    } finally {
      set({
        user: null,
        token: '',
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
