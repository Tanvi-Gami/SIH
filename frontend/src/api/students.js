import { client, apiCall } from './client';

export const getProfile = (studentId) => apiCall(client.get(studentId ? `/api/v1/students/profile/${studentId}` : '/api/v1/students/profile'));
export const updateProfile = (payload) => apiCall(client.put('/api/v1/students/profile', payload));

export const getSkillCatalog = () => apiCall(client.get('/api/v1/students/skills/catalog'));
export const getCareerTracks = () => apiCall(client.get('/api/v1/students/career-tracks'));
export const getCareerTrackSkills = (trackId) => apiCall(client.get(`/api/v1/students/career-tracks/${trackId}/skills`));
export const listSkills = (studentId) => apiCall(client.get(studentId ? `/api/v1/students/skills/${studentId}` : '/api/v1/students/skills'));
export const upsertSkill = (payload) => apiCall(client.post('/api/v1/students/skills', payload));
export const deleteSkill = (skillId) => apiCall(client.delete(`/api/v1/students/skills/${skillId}`));

export const listProjects = (studentId) => apiCall(client.get(studentId ? `/api/v1/students/projects/${studentId}` : '/api/v1/students/projects'));
export const addProject = (payload) => apiCall(client.post('/api/v1/students/projects', payload));
export const deleteProject = (id) => apiCall(client.delete(`/api/v1/students/projects/${id}`));

export const listCertifications = (studentId) => apiCall(client.get(studentId ? `/api/v1/students/certifications/${studentId}` : '/api/v1/students/certifications'));
export const addCertification = (payload) => apiCall(client.post('/api/v1/students/certifications', payload));

export const submitAssessment = (payload) => apiCall(client.post('/api/v1/students/assessment', payload));
export const listAssessments = () => apiCall(client.get('/api/v1/students/assessment'));

export const applicationsSummary = () => apiCall(client.get('/api/v1/students/applications/summary'));

export const getPortfolio = (studentId) => apiCall(client.get(`/api/v1/students/portfolio/${studentId}`));
