import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAllFixtures, fetchLiveFixtures, fetchFixtureById } from '@/api/fixtures';
import { mapFixtures, mapFixture } from '@/api/mappers/fixtureMapper';
import { QUERY_KEYS, STALE_TIMES } from '@/config/queryClient';
import type { Match } from '@/types/match';

export const useAllFixtures = () =>
  useQuery({
    queryKey: QUERY_KEYS.fixtures,
    queryFn: async () => mapFixtures(await fetchAllFixtures()),
    staleTime: (query) => {
      const data = query.state.data as Match[] | undefined;
      // Old persisted cache entries predate the events field — force a refresh
      if (Array.isArray(data) && data.length > 0 && !Object.prototype.hasOwnProperty.call(data[0], 'events')) return 0;
      return STALE_TIMES.FIXTURES_ALL;
    },
  });

export const useLiveFixtures = () =>
  useQuery({
    queryKey: QUERY_KEYS.fixturesLive,
    queryFn: async () => mapFixtures(await fetchLiveFixtures()),
    staleTime: STALE_TIMES.LIVE,
    refetchInterval: 60_000,
  });

export const useFixtureById = (id: number) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: QUERY_KEYS.fixtureById(id),
    queryFn: async () => {
      const raw = await fetchFixtureById(id);
      return raw ? mapFixture(raw) : null;
    },
    staleTime: (query) => {
      const data = query.state.data as Match | null | undefined;
      if (!data) return STALE_TIMES.MATCH_DETAIL;
      const finished = ['FT', 'AET', 'PEN'].includes(data.status);
      if (!finished) return STALE_TIMES.MATCH_DETAIL;
      // Empty events → cached from list endpoint (no events), force refetch
      // Guard against old persisted cache entries that predate the events field
      if ((data.events?.length ?? 0) === 0) return 0;
      return STALE_TIMES.FIXTURES_ALL;
    },
    enabled: id > 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'LIVE' || status === 'HT' ? 30_000 : false;
    },
    // placeholderData (not initialData) so the all-fixtures 'LIVE' status never
    // reaches query.state.data — refetchInterval only evaluates against real fetched data
    placeholderData: () => {
      const all = queryClient.getQueryData<Match[]>(QUERY_KEYS.fixtures);
      return all?.find((m) => m.id === id) ?? undefined;
    },
  });
};
