import { client, apiCall } from './client';

export const getMyInstitution = () => apiCall(client.get('/api/v1/institutions/profile'));
export const updateMyInstitution = (payload) => apiCall(client.put('/api/v1/institutions/profile', payload));
export const listStudents = () => apiCall(client.get('/api/v1/institutions/students'));
export const overview = () => apiCall(client.get('/api/v1/institutions/analytics/overview'));
export const industryDemand = () => apiCall(client.get('/api/v1/institutions/analytics/industry-demand'));
export const skillGaps = () => apiCall(client.get('/api/v1/institutions/analytics/skill-gaps'));
