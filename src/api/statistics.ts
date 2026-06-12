import { apiClient } from './client';

export const fetchMatchStatistics = async (fixtureId: number) => {
  const { data } = await apiClient.get('/fixtures/statistics', {
    params: { fixture: fixtureId },
  });
  return data.response;
};
