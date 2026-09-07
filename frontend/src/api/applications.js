import { client, apiCall } from './client';

export const apply = (payload) => apiCall(client.post('/api/v1/applications', payload));
export const myApplications = () => apiCall(client.get('/api/v1/applications/mine'));

export const listApplicants = (params) => apiCall(client.get('/api/v1/applications/applicants', { params }));
export const updateApplicationStatus = (id, status) => apiCall(client.patch(`/api/v1/applications/${id}/status`, { status }));
export const recruitmentFunnel = () => apiCall(client.get('/api/v1/applications/funnel'));
