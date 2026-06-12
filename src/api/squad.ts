import { apiClient } from './client';

export const fetchSquad = async (teamId: number): Promise<any[]> => {
  const { data } = await apiClient.get('/players/squads', {
    params: { team: teamId },
  });
  return data.response?.[0]?.players ?? [];
};
