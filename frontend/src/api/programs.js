import { client, apiCall } from './client';

export const listPrograms = (params) => apiCall(client.get('/api/v1/programs', { params }));
export const getProgram = (id) => apiCall(client.get(`/api/v1/programs/${id}`));
