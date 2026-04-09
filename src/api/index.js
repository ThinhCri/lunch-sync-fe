import { authApi } from '@/api/auth';
import { sessionsApi } from '@/api/sessions';
import { collectionsApi } from '@/api/collections';
import { crowdsourceApi } from '@/api/crowdsource';

export const api = {
  auth: authApi,
  sessions: sessionsApi,
  collections: collectionsApi,
  crowdsource: crowdsourceApi,
};
