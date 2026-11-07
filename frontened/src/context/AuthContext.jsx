import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api, { setAccessToken, setOnRefreshFailed } from '../utils/apiClient';
import { signInWithGoogle, firebaseSignOut } from '../firebase/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // start true to avoid flash
  const [authError, setAuthError] = useState(null);

  // ── Rehydrate session from localStorage on mount ─────────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem('helpji_user');
    const storedToken = localStorage.getItem('helpji_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setAccessToken(storedToken);
      } catch {
        localStorage.removeItem('helpji_user');
        localStorage.removeItem('helpji_token');
      }
    }
    setAuthLoading(false);
  }, []);

  // ── Refresh failure handler ──────────────────────────────────────────────────
  useEffect(() => {
    setOnRefreshFailed(() => {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('helpji_user');
      localStorage.removeItem('helpji_token');
      setAuthError('Session expired. Please login again.');
    });
  }, []);

  // ── Persist auth to localStorage (survives page refresh) ────────────────────
  const persistAuth = useCallback((userData, token) => {
    setUser(userData);
    setAccessToken(token);
    localStorage.setItem('helpji_user', JSON.stringify(userData));
    localStorage.setItem('helpji_token', token);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('helpji_user');
    localStorage.removeItem('helpji_token');
    setAuthError(null);
  }, []);

  // ── Google Sign-In (Firebase OAuth → backend verify) ─────────────────────────
  const loginWithGoogle = useCallback(async (role = 'customer') => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { idToken } = await signInWithGoogle();
      // Send Firebase ID token to backend for verification and user creation
      const res = await api.post('/auth/firebase-google', { idToken, role });
      const { user: userData, accessToken: token } = res.data;
      persistAuth(userData, token);
      return { success: true, user: userData };
    } catch (err) {
      // Firebase popup cancelled
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setAuthError(null);
        return { success: false, cancelled: true };
      }
      setAuthError(err?.message || 'Google sign-in failed. Please try again.');
      return { success: false };
    } finally {
      setAuthLoading(false);
    }
  }, [persistAuth]);

  // ── Traditional Email/Password Login ─────────────────────────────────────────
  const login = useCallback(async ({ emailOrPhone, password }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await api.post('/auth/login', { emailOrPhone, password });
      const { user: userData, accessToken: token } = res.data;
      persistAuth(userData, token);
      return true;
    } catch (err) {
      setAuthError(err?.message || 'Invalid credentials. Please check your email/phone and password.');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, [persistAuth]);

  // ── Signup ────────────────────────────────────────────────────────────────────
  const signup = useCallback(async ({ name, phone, email, password, role }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await api.post('/auth/signup', { name, phone, email, password, role });
      const { user: userData, accessToken: token } = res.data;
      persistAuth(userData, token);
      return true;
    } catch (err) {
      setAuthError(err?.message || 'Signup failed. Please check your details and try again.');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, [persistAuth]);

  // ── OTP ───────────────────────────────────────────────────────────────────────
  const sendOtp = useCallback(async (phone, purpose = 'login') => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await api.post('/auth/send-otp', { phone, purpose });
      localStorage.setItem('helpji_otp_phone', phone);
      return true;
    } catch (err) {
      setAuthError(err?.message || 'Failed to send OTP. Please try again.');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (otpCode) => {
    setAuthLoading(true);
    setAuthError(null);
    const phone = localStorage.getItem('helpji_otp_phone');
    if (!phone) {
      setAuthError('Session expired. Please request a new OTP.');
      setAuthLoading(false);
      return null;
    }
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp: otpCode });
      const { isNew, user: userData, accessToken: token } = res.data;
      if (!isNew && userData && token) persistAuth(userData, token);
      localStorage.removeItem('helpji_otp_phone');
      return { isNew: !!isNew, user: userData || null };
    } catch (err) {
      setAuthError(err?.message || 'Invalid or expired OTP. Please try again.');
      return null;
    } finally {
      setAuthLoading(false);
    }
  }, [persistAuth]);

  // ── Password Reset ────────────────────────────────────────────────────────────
  const forgotPassword = useCallback(async (phone) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await api.post('/auth/forgot-password', { phone });
      localStorage.setItem('helpji_reset_phone', phone);
      return true;
    } catch (err) {
      setAuthError(err?.message || 'Could not send reset OTP. Please try again.');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async ({ phone, otp, newPassword }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await api.post('/auth/reset-password', { phone, otp, password: newPassword });
      localStorage.removeItem('helpji_reset_phone');
      return true;
    } catch (err) {
      setAuthError(err?.message || 'Password reset failed. Please check your OTP and try again.');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // ── Profile Update ────────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (updates) => {
    setAuthError(null);
    try {
      const res = await api.patch('/users/profile', updates);
      const updatedUser = res.data;
      setUser(updatedUser);
      localStorage.setItem('helpji_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      setAuthError(err?.message || 'Failed to update profile.');
      return null;
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setAuthLoading(true);
    try {
      await api.post('/auth/logout');
    } catch {
      // logout even if API call fails
    } finally {
      // Also sign out of Firebase to clear Google session
      try { await firebaseSignOut(); } catch { /* ignore */ }
      clearAuth();
      setAuthLoading(false);
    }
  }, [clearAuth]);

  const clearError = useCallback(() => setAuthError(null), []);

  const value = {
    user,
    authLoading,
    authError,
    isAuthenticated: !!user,
    loginWithGoogle,
    sendOtp,
    verifyOtp,
    signup,
    login,
    forgotPassword,
    resetPassword,
    updateProfile,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
