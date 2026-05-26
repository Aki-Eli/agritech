/**
 * AuthContext — global authentication state.
 *
 * Responsibilities:
 * - Restore session from localStorage on mount
 * - Expose login / logout / refreshUser helpers
 * - Detect mid-session bans via a global axios response interceptor
 *   and surface a `banned` flag so the UI can react without a redirect
 */
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

/** Sets the Authorization header for all subsequent axios requests. */
const setAuthHeader = (token) => {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

/** Removes the Authorization header. */
const clearAuthHeader = () => {
  delete axios.defaults.headers.common['Authorization'];
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [banned, setBanned]   = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      setAuthHeader(token);

      axios.get('/api/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          // Token is invalid or expired — clear it
          localStorage.removeItem('token');
          clearAuthHeader();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // Global response interceptor: if any API call returns a 403 with banned:true,
    // immediately clear the session and raise the banned flag.
    // The UI renders a suspension screen in-place — no redirect needed.
    const interceptor = axios.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 403 && err.response?.data?.banned) {
          localStorage.removeItem('token');
          clearAuthHeader();
          setUser(null);
          setBanned(true);
        }
        return Promise.reject(err);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  /**
   * Authenticates the user and stores the token.
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token, user: loggedInUser } = res.data;
    localStorage.setItem('token', token);
    setAuthHeader(token);
    setUser(loggedInUser);
    setBanned(false);
  };

  /** Clears the session and removes the stored token. */
  const logout = () => {
    localStorage.removeItem('token');
    clearAuthHeader();
    setUser(null);
    setBanned(false);
  };

  /** Re-fetches the current user's profile (e.g. after a profile update). */
  const refreshUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('refreshUser error:', err.message);
    }
  };

  /** Clears the banned flag so the user can attempt to log in with a different account. */
  const clearBanned = () => setBanned(false);

  return (
    <AuthContext.Provider value={{ user, loading, banned, login, logout, refreshUser, clearBanned }}>
      {children}
    </AuthContext.Provider>
  );
};
