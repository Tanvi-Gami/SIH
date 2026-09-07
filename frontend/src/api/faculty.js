import { client, apiCall } from './client';

export const getProfile = (facultyId) => apiCall(client.get(facultyId ? `/api/v1/faculty/profile/${facultyId}` : '/api/v1/faculty/profile'));
export const updateProfile = (payload) => apiCall(client.put('/api/v1/faculty/profile', payload));

export const listOpportunities = (params) => apiCall(client.get('/api/v1/faculty/opportunities', { params }));
export const getOpportunity = (id) => apiCall(client.get(`/api/v1/faculty/opportunities/${id}`));
export const createOpportunity = (payload) => apiCall(client.post('/api/v1/faculty/opportunities', payload));

export const apply = (opportunity_id) => apiCall(client.post('/api/v1/faculty/applications', { opportunity_id }));
export const myApplications = () => apiCall(client.get('/api/v1/faculty/applications/mine'));

export const listApplicantsForCompany = () => apiCall(client.get('/api/v1/faculty/opportunities/company/applicants'));
export const updateApplicationStatus = (id, status) => apiCall(client.patch(`/api/v1/faculty/applications/${id}/status`, { status }));
