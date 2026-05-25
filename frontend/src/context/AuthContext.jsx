import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [banned, setBanned]   = useState(false); // true when a mid-session ban is detected

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;

      axios.get('/api/auth/me')
        .then(res => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(err => {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['x-auth-token'];
          setLoading(false);
        });
    } else {
      setLoading(false);
    }

    // Global interceptor — if any API call returns 403 banned,
    // clear the session and raise the banned flag so the UI can react.
    // No redirect — the banned screen is shown in-place.
    const interceptor = axios.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 403 && err.response?.data?.banned) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['x-auth-token'];
          setUser(null);
          setBanned(true); // triggers BannedScreen in App
        }
        return Promise.reject(err);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['x-auth-token'] = token;
    setUser(user);
    setBanned(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setUser(null);
    setBanned(false);
  };

  const clearBanned = () => setBanned(false);

  const refreshUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('refreshUser error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, banned, login, logout, refreshUser, clearBanned }}>
      {children}
    </AuthContext.Provider>
  );
};
