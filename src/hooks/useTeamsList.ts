import { useMemo } from 'react';
import { useAllStandings } from './useStandings';
import type { TeamRef } from '@/types/team';

export interface TeamListItem {
  team: TeamRef;
  groupId: string;
  position: number;
  points: number;
}

export const useTeamsList = () => {
  const { data: standings, isLoading, isError, refetch } = useAllStandings();

  const teams = useMemo<TeamListItem[]>(() => {
    if (!standings) return [];
    const seen = new Set<number>();
    const result: TeamListItem[] = [];
    // Only process single-letter group IDs (A-L), skip the 13th "best 3rd" pseudo-group
    Object.entries(standings)
      .filter(([groupId]) => groupId.length === 1)
      .forEach(([groupId, rows]) => {
        rows.forEach((row) => {
          if (!seen.has(row.team.id)) {
            seen.add(row.team.id);
            result.push({ team: row.team, groupId, position: row.position, points: row.points });
          }
        });
      });
    return result.sort((a, b) => a.team.name.localeCompare(b.team.name));
  }, [standings]);

  return { teams, isLoading, isError, refetch };
};
