import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminLogin as apiAdminLogin, getAdminProfile } from '../utils/adminApi';
import { setAccessToken } from '../utils/apiClient';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedAdmin = sessionStorage.getItem('helpji_admin');
    const storedToken = sessionStorage.getItem('helpji_admin_token');

    if (storedAdmin && storedToken) {
      try {
        const parsed = JSON.parse(storedAdmin);
        setAdmin(parsed);
        setAccessToken(storedToken);
      } catch {
        sessionStorage.removeItem('helpji_admin');
        sessionStorage.removeItem('helpji_admin_token');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const data = await apiAdminLogin(email, password);
      if (!data || !data.accessToken) {
        throw new Error('Authentication response missing access token');
      }
      setAdmin(data.admin);
      setAccessToken(data.accessToken);
      sessionStorage.setItem('helpji_admin', JSON.stringify(data.admin));
      sessionStorage.setItem('helpji_admin_token', data.accessToken);
      return data.admin;
    } catch (err) {
      const msg = err?.message || 'Invalid administrator credentials';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
    setAccessToken(null);
    sessionStorage.removeItem('helpji_admin');
    sessionStorage.removeItem('helpji_admin_token');
  }, []);

  const value = {
    admin,
    isAuthenticated: Boolean(admin),
    loading,
    error,
    login,
    logout,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return ctx;
}
