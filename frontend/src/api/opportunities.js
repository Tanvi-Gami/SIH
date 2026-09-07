import { client, apiCall, apiCallWithMeta } from './client';

export const listJobs = (params) => apiCallWithMeta(client.get('/api/v1/jobs', { params }));
export const getJob = (id) => apiCall(client.get(`/api/v1/jobs/${id}`));
export const createJob = (payload) => apiCall(client.post('/api/v1/jobs', payload));
export const updateJobStatus = (id, status) => apiCall(client.patch(`/api/v1/jobs/${id}/status`, { status }));

export const listInternships = (params) => apiCallWithMeta(client.get('/api/v1/internships', { params }));
export const getInternship = (id) => apiCall(client.get(`/api/v1/internships/${id}`));
export const createInternship = (payload) => apiCall(client.post('/api/v1/internships', payload));
export const updateInternshipStatus = (id, status) => apiCall(client.patch(`/api/v1/internships/${id}/status`, { status }));

export const myOpportunities = () => apiCall(client.get('/api/v1/my-opportunities'));
