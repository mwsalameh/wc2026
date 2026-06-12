import { useQuery } from '@tanstack/react-query';
import { fetchMatchStatistics } from '@/api/statistics';
import { mapMatchStats } from '@/api/mappers/statisticsMapper';
import { STALE_TIMES } from '@/config/queryClient';
import type { Match } from '@/types/match';

const STATS_QUERY_KEY = (id: number) => ['match-stats', id] as const;

function isStatsEligible(match: Match): boolean {
  return match.status !== 'NS' && match.status !== 'PST' && match.status !== 'CANC';
}

export const useMatchStats = (match: Match) =>
  useQuery({
    queryKey: STATS_QUERY_KEY(match.id),
    queryFn: async () => mapMatchStats(await fetchMatchStatistics(match.id)),
    staleTime: STALE_TIMES.MATCH_DETAIL,
    enabled: isStatsEligible(match),
    refetchInterval: match.status === 'LIVE' || match.status === 'HT' ? 60_000 : false,
  });
