import { createContext, useEffect, useState, useCallback } from 'react';
import * as authApi from '../api/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('sih_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sih_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem('sih_user', JSON.stringify(freshUser));
      })
      .catch(() => {
        localStorage.removeItem('sih_token');
        localStorage.removeItem('sih_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: loggedInUser, token } = await authApi.login(email, password);
    localStorage.setItem('sih_token', token);
    localStorage.setItem('sih_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: newUser, token } = await authApi.register(payload);
    localStorage.setItem('sih_token', token);
    localStorage.setItem('sih_user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sih_token');
    localStorage.removeItem('sih_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
