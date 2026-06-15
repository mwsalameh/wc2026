import { apiClient } from './client';
import { WC_2026 } from '@/constants/tournament';

export const fetchPlayerDetail = async (playerId: number) => {
  const [wcRes, clubRes] = await Promise.all([
    apiClient.get('/players', {
      params: { id: playerId, league: WC_2026.LEAGUE_ID, season: WC_2026.SEASON },
    }),
    apiClient.get('/players', {
      params: { id: playerId, season: WC_2026.SEASON - 1 },
    }),
  ]);
  return {
    wc: (wcRes.data.response ?? []) as any[],
    prev: (clubRes.data.response ?? []) as any[],
  };
};
