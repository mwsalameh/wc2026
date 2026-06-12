import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTopScorers, fetchTopAssists, fetchTopYellowCards, fetchTopRedCards } from '@/api/playerStats';
import { mapPlayerStats } from '@/api/mappers/playerStatsMapper';
import { useAllFixtures } from '@/hooks/useFixtures';
import { QUERY_KEYS, STALE_TIMES } from '@/config/queryClient';
import type { TeamStat } from '@/types/playerStats';

export const useTopScorers = () =>
  useQuery({
    queryKey: QUERY_KEYS.topScorers,
    queryFn: async () => mapPlayerStats(await fetchTopScorers()),
    staleTime: STALE_TIMES.PLAYER_STATS,
  });

export const useTopAssists = () =>
  useQuery({
    queryKey: QUERY_KEYS.topAssists,
    queryFn: async () => mapPlayerStats(await fetchTopAssists()),
    staleTime: STALE_TIMES.PLAYER_STATS,
  });

export const useTopYellowCards = () =>
  useQuery({
    queryKey: QUERY_KEYS.topYellowCards,
    queryFn: async () => mapPlayerStats(await fetchTopYellowCards()),
    staleTime: STALE_TIMES.PLAYER_STATS,
  });

export const useTopRedCards = () =>
  useQuery({
    queryKey: QUERY_KEYS.topRedCards,
    queryFn: async () => mapPlayerStats(await fetchTopRedCards()),
    staleTime: STALE_TIMES.PLAYER_STATS,
  });

export function useTeamStats(): { teams: TeamStat[]; isLoading: boolean } {
  const { data: fixtures, isLoading } = useAllFixtures();

  const teams = useMemo(() => {
    if (!fixtures) return [];

    const teamMap = new Map<number, TeamStat>();

    const completed = fixtures.filter(
      (m) => ['FT', 'AET', 'PEN'].includes(m.status) && m.score.home !== null && m.score.away !== null
    );

    for (const match of completed) {
      const hg = match.score.home!;
      const ag = match.score.away!;

      if (!teamMap.has(match.homeTeam.id)) {
        teamMap.set(match.homeTeam.id, {
          teamId: match.homeTeam.id,
          teamName: match.homeTeam.name,
          teamLogo: match.homeTeam.logoUrl,
          goalsFor: 0, goalsAgainst: 0, goalDifference: 0, cleanSheets: 0, played: 0,
        });
      }
      const home = teamMap.get(match.homeTeam.id)!;
      home.goalsFor += hg;
      home.goalsAgainst += ag;
      home.played += 1;
      if (ag === 0) home.cleanSheets += 1;

      if (!teamMap.has(match.awayTeam.id)) {
        teamMap.set(match.awayTeam.id, {
          teamId: match.awayTeam.id,
          teamName: match.awayTeam.name,
          teamLogo: match.awayTeam.logoUrl,
          goalsFor: 0, goalsAgainst: 0, goalDifference: 0, cleanSheets: 0, played: 0,
        });
      }
      const away = teamMap.get(match.awayTeam.id)!;
      away.goalsFor += ag;
      away.goalsAgainst += hg;
      away.played += 1;
      if (hg === 0) away.cleanSheets += 1;
    }

    return Array.from(teamMap.values()).map((t) => ({
      ...t,
      goalDifference: t.goalsFor - t.goalsAgainst,
    }));
  }, [fixtures]);

  return { teams, isLoading };
}
