import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('sih_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('sih_token');
      localStorage.removeItem('sih_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/** Unwraps { success, data } and normalizes errors to a readable message. */
export async function apiCall(promise) {
  try {
    const res = await promise;
    return res.data.data;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Something went wrong.';
    const enriched = new Error(message);
    enriched.status = err.response?.status;
    enriched.errors = err.response?.data?.errors;
    throw enriched;
  }
}

export async function apiCallWithMeta(promise) {
  const res = await promise;
  return { data: res.data.data, meta: res.data.meta };
}

export { API_URL };
