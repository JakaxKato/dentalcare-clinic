import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('dc_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const persist = useCallback((u, token) => {
    if (u) {
      localStorage.setItem('dc_user', JSON.stringify(u));
      setUser(u);
    } else {
      localStorage.removeItem('dc_user');
      setUser(null);
    }
    if (token) localStorage.setItem('dc_token', token);
    if (token === null) localStorage.removeItem('dc_token');
  }, []);

  // Re-validate token on mount
  useEffect(() => {
    const token = localStorage.getItem('dc_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then((u) => persist(u))
      .catch(() => persist(null, null))
      .finally(() => setLoading(false));
  }, [persist]);

  const login = async (credentials) => {
    const { user: u, token } = await authService.login(credentials);
    persist(u, token);
    return u;
  };

  const register = async (data) => {
    const { user: u, token } = await authService.register(data);
    persist(u, token);
    return u;
  };

  const logout = useCallback(() => persist(null, null), [persist]);

  // Listen for 401 interceptor events
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [logout]);

  const updateUser = (u) => persist(u);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
