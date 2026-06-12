import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      networkMode: 'offlineFirst',
      staleTime: 5 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
    },
  },
});

export const STALE_TIMES = {
  FIXTURES_ALL: 6 * 60 * 60 * 1000,
  TEAMS: Infinity,
  STANDINGS: 5 * 60 * 1000,
  LIVE: 0,
  MATCH_DETAIL: 3 * 60 * 1000,
  LINEUPS: 45 * 1000,
  PLAYER_STATS: 12 * 60 * 60 * 1000,
  SQUAD: 24 * 60 * 60 * 1000,
  FIXTURE_PLAYERS: 6 * 60 * 60 * 1000,
} as const;

export const QUERY_KEYS = {
  fixtures: ['fixtures'] as const,
  fixturesLive: ['fixtures', 'live'] as const,
  fixtureById: (id: number) => ['fixtures', id] as const,
  standings: ['standings'] as const,
  teams: ['teams'] as const,
  teamById: (id: number) => ['teams', id] as const,
  lineups: (fixtureId: number) => ['lineups', fixtureId] as const,
  topScorers: ['stats', 'topScorers'] as const,
  topAssists: ['stats', 'topAssists'] as const,
  topYellowCards: ['stats', 'topYellowCards'] as const,
  topRedCards: ['stats', 'topRedCards'] as const,
  squadByTeam: (teamId: number) => ['squad', teamId] as const,
  coachByTeam: (teamId: number) => ['coach', teamId] as const,
  fixturePlayers: (id: number) => ['fixturePlayers', id] as const,
} as const;
