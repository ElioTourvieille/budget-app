'use client';

import { create } from 'zustand';
import { tokenStorage, authApi, ApiError } from '@/lib/api';
import type { User } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthActions {
  /** Rehydrate depuis localStorage au montage de l'app */
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    const token = tokenStorage.get();
    if (!token) {
      set({ isInitialized: true });
      return;
    }
    set({ isLoading: true });
    try {
      const user = await authApi.me();
      set({ user, token, isInitialized: true, isLoading: false });
    } catch (err) {
      // Token expiré ou invalide — on nettoie silencieusement
      if (err instanceof ApiError && err.isUnauthorized) {
        tokenStorage.clear();
      }
      set({ user: null, token: null, isInitialized: true, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { access_token, user } = await authApi.login(email, password);
      tokenStorage.set(access_token);
      set({ user, token: access_token, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (email, password, firstName) => {
    set({ isLoading: true });
    try {
      const { access_token, user } = await authApi.register(email, password, firstName);
      tokenStorage.set(access_token);
      set({ user, token: access_token, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    tokenStorage.clear();
    set({ user: null, token: null });
  },
}));

// ─── SELECTORS ────────────────────────────────────────────────────

export const useUser            = () => useAuthStore((s) => s.user);
export const useToken           = () => useAuthStore((s) => s.token);
export const useIsAuthenticated = () => useAuthStore((s) => s.user !== null);
export const useIsAuthLoading   = () => useAuthStore((s) => s.isLoading);
export const useIsInitialized   = () => useAuthStore((s) => s.isInitialized);
