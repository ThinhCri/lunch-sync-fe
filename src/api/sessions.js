import client from './client';

export const sessionsApi = {
  create: (data) => client.post('/sessions', data),
  getInfo: (pin, sessionId) => client.get(`/sessions/${pin}/${sessionId}/info`),
  join: (pin, data) => client.post(`/sessions/${pin}/join`, data),
  start: (pin) => client.post(`/sessions/${pin}/start`),
  getStatus: (pin, sessionId) => client.get(`/sessions/${pin}/${sessionId}/status`),
  closeSession: (pin) => client.post(`/sessions/${pin}/close`),
  getChoices: (pin) => client.get(`/sessions/${pin}/choices`),
  vote: (pin, data) => client.post(`/sessions/${pin}/vote`, data),
  getResults: (pin) => client.get(`/sessions/${pin}/results`),
  boom: (pin) => client.post(`/sessions/${pin}/boom`),
  pick: (pin, data) => client.post(`/sessions/${pin}/pick`, data),
  cancel: (pin) => client.post(`/sessions/${pin}/cancel`),
};
