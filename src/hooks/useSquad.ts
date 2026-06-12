import { useQuery } from '@tanstack/react-query';
import { fetchSquad } from '@/api/squad';
import { QUERY_KEYS, STALE_TIMES } from '@/config/queryClient';

export interface SquadPlayer {
  id: number;
  name: string;
  age: number;
  number: number | null;
  position: string;
  photo: string;
}

export function useSquad(teamId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.squadByTeam(teamId),
    queryFn: async (): Promise<SquadPlayer[]> => {
      const raw = await fetchSquad(teamId);
      return raw.map((p: any): SquadPlayer => ({
        id: p.id ?? 0,
        name: p.name ?? '',
        age: p.age ?? 0,
        number: p.number ?? null,
        position: p.position ?? '',
        photo: p.photo ?? '',
      }));
    },
    staleTime: STALE_TIMES.SQUAD,
    enabled: teamId > 0,
  });
}
