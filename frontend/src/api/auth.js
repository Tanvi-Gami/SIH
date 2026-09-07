import { client, apiCall } from './client';

export const login = (email, password) => apiCall(client.post('/api/v1/auth/login', { email, password }));
export const register = (payload) => apiCall(client.post('/api/v1/auth/register', payload));
export const me = () => apiCall(client.get('/api/v1/auth/me'));
