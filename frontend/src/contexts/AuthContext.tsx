import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, AuthState } from '@/types';
import { authApi } from '@/services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Set to true to use mock data (for development without backend)
const USE_MOCK_DATA = false;

// Mock users for demo (only used when USE_MOCK_DATA is true)
const mockUsers: Record<string, { password: string; user: User }> = {
  'admin@bootcamp.com': {
    password: 'admin123',
    user: { id: '1', email: 'admin@bootcamp.com', name: 'Admin User', role: 'admin' }
  },
  'staff@bootcamp.com': {
    password: 'staff123',
    user: { id: '2', email: 'staff@bootcamp.com', name: 'Registration Staff', role: 'staff' }
  },
  'security@bootcamp.com': {
    password: 'security123',
    user: { id: '3', email: 'security@bootcamp.com', name: 'Security Team', role: 'security' }
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const saved = localStorage.getItem('auth');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { user: null, isAuthenticated: false };
      }
    }
    return { user: null, isAuthenticated: false };
  });
  const [loading, setLoading] = useState(false);

  // Check token validity on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && !USE_MOCK_DATA) {
      setLoading(true);
      authApi.getCurrentUser()
        .then((user) => {
          setAuthState({ user: user as User, isAuthenticated: true });
          localStorage.setItem('auth', JSON.stringify({ user, isAuthenticated: true }));
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth');
          setAuthState({ user: null, isAuthenticated: false });
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      if (USE_MOCK_DATA) {
        // Mock login for development
        const mockUser = mockUsers[email];
        if (mockUser && mockUser.password === password) {
          const newState = { user: mockUser.user, isAuthenticated: true };
          setAuthState(newState);
          localStorage.setItem('auth', JSON.stringify(newState));
          return true;
        }
        return false;
      }

      // Real API login
      const response = await authApi.login(email, password);
      localStorage.setItem('auth_token', response.token);
      const user = response.user as User;
      const newState = { user, isAuthenticated: true };
      setAuthState(newState);
      localStorage.setItem('auth', JSON.stringify(newState));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (!USE_MOCK_DATA) {
      try {
        await authApi.logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth');
    setAuthState({ user: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
