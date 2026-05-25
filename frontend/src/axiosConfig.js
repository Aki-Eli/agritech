import axios from 'axios';

// Read token from localStorage and set it as default header
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['x-auth-token'] = token;
}

// Optional: log every request for debugging
axios.interceptors.request.use(config => {
  console.log('Request:', config.method.toUpperCase(), config.url, 'Token:', config.headers['x-auth-token'] ? 'present' : 'missing');
  return config;
});