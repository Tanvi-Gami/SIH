import { client, apiCall } from './client';

export const analyzeResume = (file) => {
  const form = new FormData();
  form.append('resume', file);
  return apiCall(client.post('/ai/resume/analyze', form, { headers: { 'Content-Type': 'multipart/form-data' } }));
};

export const confirmResumeData = (payload) => apiCall(client.post('/ai/resume/confirm', payload));

export const getSkillGap = (careerTrack) => apiCall(client.get('/ai/skill-gap', { params: careerTrack ? { career_track: careerTrack } : {} }));

export const getRecommendations = (type) => apiCall(client.get('/ai/recommendations', { params: { type } }));

export const matchPreview = (opportunity_id, opportunity_type) => apiCall(client.post('/ai/match-preview', { opportunity_id, opportunity_type }));

export const getCareerGuidance = () => apiCall(client.post('/ai/career-guidance', {}));

export const chat = (message) => apiCall(client.post('/ai/chat', { message }));
export const chatHistory = () => apiCall(client.get('/ai/chat/history'));

export const semanticSearch = (q, type) => apiCall(client.get('/ai/search', { params: { q, type } }));

export const industrySkillAnalysis = () => apiCall(client.get('/ai/industry-skill-analysis'));
