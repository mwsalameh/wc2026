import { apiClient } from './client';

export const fetchLineups = async (fixtureId: number) => {
  const { data } = await apiClient.get('/fixtures/lineups', {
    params: { fixture: fixtureId },
  });
  return data.response;
};
