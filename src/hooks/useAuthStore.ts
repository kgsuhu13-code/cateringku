import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api, setAuthToken } from '@/hooks/api';

// Restore token on module load if session exists
// (runs once when the module is first imported)
if (typeof window !== 'undefined') {
  try {
    const stored = window.sessionStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      const token = parsed?.state?.token;
      if (token) setAuthToken(token);
    }
  } catch (_) {}
}

interface User {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'TENANT' | 'SUPER_ADMIN';
  tenantId?: string | null;
  tenant?: {
    id: string;
    name: string;
  } | null;
  phone?: string | null;
  address?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginMock: (email: string, name: string, role: 'CUSTOMER' | 'TENANT', tenantId?: string) => Promise<User | null>;
  logout: () => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      loginMock: async (email, name, role, tenantId) => {
        set({ isLoading: true, error: null });
        try {
          const prefix = role === 'TENANT' ? 'mock_tenant_' : 'mock_customer_';
          const cleanEmail = email.replace(/[^a-zA-Z0-9]/g, '');
          const firebaseUid = `${prefix}${cleanEmail}`;

          console.log(`Logging in with mock token: ${firebaseUid}`);
          setAuthToken(firebaseUid);

          const user = await api.syncUser({
            firebaseUid,
            email,
            name,
            role,
            tenantId: role === 'TENANT' ? tenantId : undefined,
          });

          set({
            user,
            token: firebaseUid,
            isAuthenticated: true,
            isLoading: false,
          });

          return user;
        } catch (err: any) {
          setAuthToken(null);
          const errMsg = err.message || 'Login gagal. Silakan coba lagi.';
          set({ error: errMsg, isLoading: false });
          return null;
        }
      },

      logout: () => {
        setAuthToken(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setError: (error) => set({ error }),
    }),
    {
      name: 'auth-storage',
      // Use sessionStorage so data survives page navigations in same tab
      // but clears when browser is closed
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.sessionStorage : ({} as any)
      ),
      // Only persist these keys (exclude isLoading/error)
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // Restore auth token from storage when state is hydrated
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setAuthToken(state.token);
        }
      },
    }
  )
);
