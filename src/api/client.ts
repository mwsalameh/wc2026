import axios from 'axios';
import { useRequestBudgetStore } from '@/store/requestBudgetStore';

const APISPORTS_KEY = process.env.EXPO_PUBLIC_APISPORTS_KEY ?? '';

export const apiClient = axios.create({
  baseURL: 'https://v3.football.api-sports.io',
  timeout: 10000,
  headers: {
    'x-apisports-key': APISPORTS_KEY,
  },
});

apiClient.interceptors.request.use((config) => {
  const store = useRequestBudgetStore.getState();
  if (store.isAtLimit()) {
    return Promise.reject(new Error('BUDGET_LIMIT_REACHED')) as never;
  }
  store.increment();
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // Log api-sports error objects that arrive with HTTP 200
    if (response.data?.errors && Object.keys(response.data.errors).length > 0) {
      console.warn('[API] api-sports error:', JSON.stringify(response.data.errors));
    }
    return response;
  },
  (error) => {
    console.error('[API] request failed:', error?.config?.url, error?.response?.status, error?.message);
    return Promise.reject(error);
  }
);
