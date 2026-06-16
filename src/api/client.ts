import axios from 'axios';
import { useRequestBudgetStore } from '@/store/requestBudgetStore';
import { recordError } from '@/utils/errorLog';

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
    if (__DEV__ && response.data?.errors && Object.keys(response.data.errors).length > 0) {
      console.warn('[API] api-sports error:', JSON.stringify(response.data.errors));
    }
    return response;
  },
  (error) => {
    if (error?.message !== 'BUDGET_LIMIT_REACHED') {
      if (__DEV__) {
        console.error('[API] request failed:', error?.config?.url, error?.response?.status, error?.message);
      }
      recordError(error, `api:${error?.config?.url ?? 'unknown'}:${error?.response?.status ?? 'no-response'}`);
    }
    return Promise.reject(error);
  }
);
