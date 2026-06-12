import { useQuery } from '@tanstack/react-query';
import { fetchAllStandings } from '@/api/standings';
import { mapStandings } from '@/api/mappers/standingMapper';
import { QUERY_KEYS, STALE_TIMES } from '@/config/queryClient';

export const useAllStandings = () =>
  useQuery({
    queryKey: QUERY_KEYS.standings,
    queryFn: async () => {
      const raw = await fetchAllStandings();
      const groups = raw[0]?.league?.standings ?? [];
      return mapStandings(groups);
    },
    staleTime: STALE_TIMES.STANDINGS,
  });
