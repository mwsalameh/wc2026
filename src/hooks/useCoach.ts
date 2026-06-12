import { useQuery } from '@tanstack/react-query';
import { fetchCoach } from '@/api/coach';
import { COACH_NAME_OVERRIDES } from '@/constants/coachOverrides';
import { QUERY_KEYS, STALE_TIMES } from '@/config/queryClient';

export interface TeamCoach {
  id: number;
  name: string;
  photo: string;
}

// Original hook — unchanged behavior, used everywhere except the team detail page.
export function useCoach(teamId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.coachByTeam(teamId),
    queryFn: async (): Promise<TeamCoach | null> => {
      const raw = await fetchCoach(teamId);
      if (!raw) return null;
      return { id: raw.id ?? 0, name: raw.name ?? '', photo: raw.photo ?? '' };
    },
    staleTime: STALE_TIMES.SQUAD,
    enabled: teamId > 0,
  });
}

// Override hook — only fires when the team has a verified coach in coachOverrides.ts.
// Arab teams are NOT in that table, so this query stays disabled for them.
export function useCoachOverride(teamId: number, teamName?: string) {
  const overrideName = teamName ? COACH_NAME_OVERRIDES[teamName] : undefined;

  return useQuery({
    queryKey: [...QUERY_KEYS.coachByTeam(teamId), overrideName],
    queryFn: async (): Promise<TeamCoach | null> => {
      const raw = await fetchCoach(teamId, overrideName);
      if (!raw) return null;
      return { id: raw.id ?? 0, name: raw.name ?? '', photo: raw.photo ?? '' };
    },
    staleTime: STALE_TIMES.SQUAD,
    // Only fetch when we have a verified override name — never fires for Arab teams
    enabled: teamId > 0 && overrideName !== undefined,
  });
}
