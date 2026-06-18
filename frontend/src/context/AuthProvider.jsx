import { useState, useCallback, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import * as authApi from '../api/authApi';
import * as userApi from '../api/userApi';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    userApi
      .getProfile()
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setLoading(false);
      });
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await authApi.login(email, password);
    const { userId, token: newToken, name } = response.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify({ id: userId, email, name }));
    setToken(newToken);
    setUser({ id: userId, email, name });
  }, []);

  const register = useCallback(async (name, email, password) => {
    const response = await authApi.register(name, email, password);
    const { userId, token: newToken } = response.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify({ id: userId, email, name }));
    setToken(newToken);
    setUser({ id: userId, email, name });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    const updated = { ...stored, ...userData };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  }, []);

  const value = { user, token, loading, login, register, logout, updateUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}