import axios from 'axios';

// Same-origin in dev via Vite proxy; set VITE_API_URL in production
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
});

export default api;
