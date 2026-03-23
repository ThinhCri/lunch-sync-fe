import { API_CONFIG } from '@/config';
import { mockHandlers } from '@/api/mock';
import { authApi } from '@/api/auth';
import { sessionsApi } from '@/api/sessions';
import { collectionsApi } from '@/api/collections';
import { submissionsApi, dishesApi } from '@/api/admin';

// Create axios client with configurable base URL
import { createApiClient } from '@/api/client';

const getClient = () => createApiClient(API_CONFIG.BASE_URL);

// Wrap mock handlers to match axios response format
const wrapMock = (mockFn) => async (...args) => {
  const result = await mockFn(...args);
  // Mock handlers return data directly, wrap to match axios response
  return { data: result };
};

export const api = {
  auth: {
    login: (data) => API_CONFIG.USE_MOCK
      ? wrapMock(mockHandlers.login)(data.email, data.password)
      : authApi.login(data),
    register: (data) => API_CONFIG.USE_MOCK
      ? wrapMock(mockHandlers.register)(data.email, data.password, data.fullName)
      : authApi.register(data),
  },
  sessions: {
    create: (data) => API_CONFIG.USE_MOCK
      ? wrapMock(mockHandlers.createSession)(data)
      : getClient().post('/sessions', data),
    getInfo: (pin) => API_CONFIG.USE_MOCK
      ? wrapMock(mockHandlers.getSessionInfo)(pin)
      : sessionsApi.getInfo(pin),
    join: (pin, data) => API_CONFIG.USE_MOCK
      ? wrapMock(mockHandlers.joinSession)(pin, data.nickname)
      : sessionsApi.join(pin, data),
    start: (pin) => API_CONFIG.USE_MOCK
      ? wrapMock(mockHandlers.startSession)(pin)
      : sessionsApi.start(pin),
    getStatus: (pin) => API_CONFIG.USE_MOCK
      ? wrapMock(mockHandlers.getStatus)(pin)
      : sessionsApi.getStatus(pin),
    closeVoting: (pin) => API_CONFIG.USE_MOCK
      ? wrapMock(mockHandlers.closeVoting)(pin)
      : sessionsApi.closeVoting(pin),
    getChoices: (pin) => API_CONFIG.USE_MOCK
      ? wrapMock(mockHandlers.getChoices)(pin)
      : sessionsApi.getChoices(pin),
    vote: (pin, data) => API_CONFIG.USE_MOCK
      ? wrapMock(mockHandlers.submitVote)(pin, data.participantId, data.choices)
      : sessionsApi.vote(pin, data),
    getResults: (pin) => API_CONFIG.USE_MOCK
      ? wrapMock(mockHandlers.getResults)(pin)
      : sessionsApi.getResults(pin),
    boom: (pin) => API_CONFIG.USE_MOCK
      ? wrapMock(mockHandlers.boom)(pin)
      : sessionsApi.boom(pin),
    pick: (pin, data) => API_CONFIG.USE_MOCK
      ? wrapMock(mockHandlers.pick)(pin, data.restaurantId)
      : sessionsApi.pick(pin, data),
    cancel: (pin) => API_CONFIG.USE_MOCK
      ? wrapMock(mockHandlers.cancelSession)(pin)
      : getClient().post(`/sessions/${pin}/cancel`),
  },
  collections: {
    list: () => API_CONFIG.USE_MOCK
      ? wrapMock(mockHandlers.getCollections)()
      : collectionsApi.list(),
    getById: (id) => API_CONFIG.USE_MOCK
      ? wrapMock(mockHandlers.getCollectionById)(id)
      : collectionsApi.getById(id),
  },
  crowdsource: {
    submit: (data) => API_CONFIG.USE_MOCK
      ? wrapMock(mockHandlers.submitSuggestion)(data)
      : submissionsApi.create(data),
    search: (query) => API_CONFIG.USE_MOCK
      ? wrapMock(mockHandlers.searchRestaurants)(query)
      : getClient().get('/restaurants/search', { params: { q: query } }),
    upvote: (restaurantId) => API_CONFIG.USE_MOCK
      ? wrapMock(mockHandlers.upvoteRestaurant)(restaurantId)
      : getClient().post(`/restaurants/${restaurantId}/upvote`),
  },
  admin: {
    submissions: {
      list: (params) => API_CONFIG.USE_MOCK
        ? wrapMock(mockHandlers.getSubmissions)(params)
        : submissionsApi.list(params),
      review: (id, data) => API_CONFIG.USE_MOCK
        ? wrapMock(mockHandlers.reviewSubmission)(id, data)
        : submissionsApi.review(id, data),
    },
    dishes: {
      list: (params) => API_CONFIG.USE_MOCK
        ? wrapMock(mockHandlers.getDishes)(params)
        : dishesApi.list(params),
      getById: (id) => API_CONFIG.USE_MOCK
        ? wrapMock(mockHandlers.getDishById)(id)
        : dishesApi.getById(id),
      updateProfile: (id, data) => API_CONFIG.USE_MOCK
        ? wrapMock(mockHandlers.updateDishProfile)(id, data)
        : dishesApi.updateProfile(id, data),
      upload: (data) => API_CONFIG.USE_MOCK
        ? wrapMock(mockHandlers.uploadDishes)(data)
        : dishesApi.upload(data),
      export: () => API_CONFIG.USE_MOCK
        ? wrapMock(mockHandlers.exportDishes)()
        : dishesApi.export(),
      reloadCache: () => API_CONFIG.USE_MOCK
        ? wrapMock(mockHandlers.reloadDishCache)()
        : dishesApi.reloadCache(),
    },
  },
};

// Export mock data for direct access if needed
export { mockHandlers } from '@/api/mock';
