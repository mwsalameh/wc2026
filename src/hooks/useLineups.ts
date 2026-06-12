import { useQuery } from '@tanstack/react-query';
import { fetchLineups } from '@/api/lineups';
import { mapMatchLineups } from '@/api/mappers/lineupMapper';
import { QUERY_KEYS, STALE_TIMES } from '@/config/queryClient';
import type { Match } from '@/types/match';

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

function isLineupsEligible(match: Match): boolean {
  if (match.status !== 'NS') return true;
  const kickoff = new Date(match.kickoffUtc).getTime();
  return kickoff - Date.now() <= TWO_HOURS_MS;
}

export const useLineups = (match: Match) =>
  useQuery({
    queryKey: QUERY_KEYS.lineups(match.id),
    queryFn: async () => mapMatchLineups(await fetchLineups(match.id)),
    staleTime: STALE_TIMES.LINEUPS,
    enabled: isLineupsEligible(match),
  });
