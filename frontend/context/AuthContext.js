'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '@/lib/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const data = await authApi.getMe();
      setUser(data.user);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}!`);
    return data;
  };

  const register = async (name, email, password, phone) => {
    const data = await authApi.register({ name, email, password, phone });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    toast.success(`Welcome to ShopZen, ${data.user.name}!`);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    const data = await authApi.updateProfile(profileData);
    setUser(data.user);
    toast.success('Profile updated successfully!');
    return data;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, isAdmin, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
