import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as loginApi, getMe } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const rehydrate = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const currentUser = await getMe();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to rehydrate user', error);
        localStorage.clear();
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    rehydrate();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginApi(email, password);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
export default AuthContext;
