/**
 * Axios bootstrap.
 * Restores the Authorization header from localStorage on page load so that
 * any axios call made before AuthContext mounts still carries the token.
 * AuthContext is the authoritative source of truth for auth state.
 */
import axios from 'axios';

const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
