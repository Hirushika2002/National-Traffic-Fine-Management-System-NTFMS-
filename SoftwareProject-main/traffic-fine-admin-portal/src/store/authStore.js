import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      admin: null,

      isAuthenticated: () => Boolean(get().accessToken),

      setSession: ({ accessToken, refreshToken, admin }) =>
        set((state) => ({
          accessToken,
          refreshToken: refreshToken ?? state.refreshToken,
          admin: admin ?? state.admin,
        })),

      logout: () => set({ accessToken: null, refreshToken: null, admin: null }),
    }),
    { name: 'traffic-fine-admin-auth' },
  ),
);
