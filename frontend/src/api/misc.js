import { client, apiCall } from './client';

export const platformStats = () => apiCall(client.get('/api/v1/analytics/platform'));

export const notifications = () => apiCall(client.get('/api/v1/notifications'));
export const markNotificationRead = (id) => apiCall(client.patch(`/api/v1/notifications/${id}/read`));
export const markAllNotificationsRead = () => apiCall(client.patch('/api/v1/notifications/read-all'));

export const uploadDocument = (file, docType) => {
  const form = new FormData();
  form.append('file', file);
  form.append('doc_type', docType);
  return apiCall(client.post('/api/v1/documents/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }));
};
export const myDocuments = () => apiCall(client.get('/api/v1/documents/mine'));
