import { useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { fetchFixturePlayers } from '@/api/fixtures';
import { useAllFixtures } from '@/hooks/useFixtures';
import { QUERY_KEYS, STALE_TIMES } from '@/config/queryClient';
import type { BestPlayer, PotmEntry } from '@/types/bestPlayer';

// Highest-rated player with at least 45 minutes played
function extractBestPlayer(response: any[]): BestPlayer | null {
  let best: BestPlayer | null = null;
  let bestRating = 0;

  for (const teamData of response) {
    for (const p of teamData.players ?? []) {
      const games = p.statistics?.[0]?.games;
      const rating = parseFloat(games?.rating ?? '0');
      const minutes = games?.minutes ?? 0;
      if (rating > bestRating && minutes >= 45) {
        bestRating = rating;
        best = {
          playerId: p.player.id,
          name: p.player.name ?? '',
          photo: p.player.photo ?? '',
          teamId: teamData.team.id,
          teamName: teamData.team.name ?? '',
          teamLogo: teamData.team.logo ?? '',
          rating,
        };
      }
    }
  }
  return best;
}

export function useBestPlayer(fixtureId: number, isCompleted: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.fixturePlayers(fixtureId),
    queryFn: () => fetchFixturePlayers(fixtureId),
    staleTime: STALE_TIMES.FIXTURE_PLAYERS,
    enabled: isCompleted && fixtureId > 0,
    select: extractBestPlayer,
  });
}

export function usePotmStats(): { data: PotmEntry[]; isLoading: boolean } {
  const { data: fixtures } = useAllFixtures();

  const completedIds = useMemo(
    () =>
      (fixtures ?? [])
        .filter((m) => ['FT', 'AET', 'PEN'].includes(m.status))
        .map((m) => m.id),
    [fixtures]
  );

  const results = useQueries({
    queries: completedIds.map((id) => ({
      queryKey: QUERY_KEYS.fixturePlayers(id),
      queryFn: () => fetchFixturePlayers(id),
      staleTime: STALE_TIMES.FIXTURE_PLAYERS,
    })),
  });

  const data = useMemo<PotmEntry[]>(() => {
    const map = new Map<number, PotmEntry>();
    for (const r of results) {
      if (!r.data) continue;
      const best = extractBestPlayer(r.data);
      if (!best) continue;
      const existing = map.get(best.playerId);
      if (existing) {
        existing.awards += 1;
      } else {
        map.set(best.playerId, { ...best, awards: 1 });
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.awards - a.awards)
      .slice(0, 5);
  }, [results]);

  const isLoading = completedIds.length > 0 && results.some((r) => r.isLoading);

  return { data, isLoading };
}
