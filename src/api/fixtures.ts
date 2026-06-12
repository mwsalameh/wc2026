import { apiClient } from './client';
import { WC_2026 } from '@/constants/tournament';

export const fetchAllFixtures = async () => {
  const { data } = await apiClient.get('/fixtures', {
    params: { league: WC_2026.LEAGUE_ID, season: WC_2026.SEASON },
  });
  return data.response;
};

export const fetchLiveFixtures = async () => {
  const { data } = await apiClient.get('/fixtures', {
    params: { league: WC_2026.LEAGUE_ID, season: WC_2026.SEASON, live: 'all' },
  });
  return data.response;
};

export const fetchFixtureById = async (id: number) => {
  const { data } = await apiClient.get('/fixtures', {
    params: { id },
  });
  return data.response[0] ?? null;
};

export const fetchFixturePlayers = async (fixtureId: number) => {
  const { data } = await apiClient.get('/fixtures/players', {
    params: { fixture: fixtureId },
  });
  return data.response as any[];
};

export const fetchFixturesByTeam = async (teamId: number) => {
  const { data } = await apiClient.get('/fixtures', {
    params: { league: WC_2026.LEAGUE_ID, season: WC_2026.SEASON, team: teamId },
  });
  return data.response;
};
