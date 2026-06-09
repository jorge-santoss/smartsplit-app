<<<<<<< Updated upstream
import { createContext, useState, useCallback, useEffect } from 'react';
=======
import { createContext, useState, useCallback } from 'react';
>>>>>>> Stashed changes
import * as authApi from '../api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });
<<<<<<< Updated upstream
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);
=======
>>>>>>> Stashed changes

  const login = useCallback(async (email, password) => {
    const response = await authApi.login(email, password);
    const { userId, token: newToken } = response.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify({ id: userId, email }));
    setToken(newToken);
    setUser({ id: userId, email });
  }, []);

  const register = useCallback(async (name, email, password) => {
    const response = await authApi.register(name, email, password);
    const { userId, token: newToken } = response.data;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify({ id: userId, email }));
    setToken(newToken);
    setUser({ id: userId, email, name });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

<<<<<<< Updated upstream
  const value = { user, token, loading, login, register, logout };
=======
  const value = { user, token, login, register, logout };
>>>>>>> Stashed changes

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}