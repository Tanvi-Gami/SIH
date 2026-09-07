import { client, apiCall } from './client';

export const listCompanies = () => apiCall(client.get('/api/v1/companies'));
export const getCompany = (id) => apiCall(client.get(`/api/v1/companies/${id}`));
export const getMyCompany = () => apiCall(client.get('/api/v1/companies/me/profile'));
export const updateMyCompany = (payload) => apiCall(client.put('/api/v1/companies/me/profile', payload));
export const searchCandidates = (params) => apiCall(client.get('/api/v1/companies/me/candidates', { params }));
