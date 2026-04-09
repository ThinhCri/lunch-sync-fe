import client from './client';

export const crowdsourceApi = {
  submit: (data) => client.post('/submissions', data),
};
