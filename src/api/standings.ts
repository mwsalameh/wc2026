import { apiClient } from './client';
import { WC_2026 } from '@/constants/tournament';

export const fetchAllStandings = async () => {
  const { data } = await apiClient.get('/standings', {
    params: { league: WC_2026.LEAGUE_ID, season: WC_2026.SEASON },
  });
  return data.response;
};
