import { apiClient } from './client';
import { WC_2026 } from '@/constants/tournament';

const PARAMS = { league: WC_2026.LEAGUE_ID, season: WC_2026.SEASON };

export const fetchTopScorers = async () => {
  const { data } = await apiClient.get('/players/topscorers', { params: PARAMS });
  return data.response ?? [];
};

export const fetchTopAssists = async () => {
  const { data } = await apiClient.get('/players/topassists', { params: PARAMS });
  return data.response ?? [];
};

export const fetchTopYellowCards = async () => {
  const { data } = await apiClient.get('/players/topyellowcards', { params: PARAMS });
  return data.response ?? [];
};

export const fetchTopRedCards = async () => {
  const { data } = await apiClient.get('/players/topredcards', { params: PARAMS });
  return data.response ?? [];
};
