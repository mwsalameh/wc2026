import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAllFixtures, fetchLiveFixtures, fetchFixtureById } from '@/api/fixtures';
import { mapFixtures, mapFixture } from '@/api/mappers/fixtureMapper';
import { QUERY_KEYS, STALE_TIMES } from '@/config/queryClient';
import type { Match } from '@/types/match';

export const useAllFixtures = () =>
  useQuery({
    queryKey: QUERY_KEYS.fixtures,
    queryFn: async () => mapFixtures(await fetchAllFixtures()),
    staleTime: STALE_TIMES.FIXTURES_ALL,
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
    staleTime: STALE_TIMES.MATCH_DETAIL,
    enabled: id > 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'LIVE' || status === 'HT' ? 30_000 : false;
    },
    initialData: () => {
      const all = queryClient.getQueryData<Match[]>(QUERY_KEYS.fixtures);
      return all?.find((m) => m.id === id);
    },
    initialDataUpdatedAt: 0,
  });
};
