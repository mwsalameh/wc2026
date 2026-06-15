import { useMemo, useCallback } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { fetchFixturePlayers } from '@/api/fixtures';
import { useAllFixtures } from '@/hooks/useFixtures';
import { QUERY_KEYS, STALE_TIMES } from '@/config/queryClient';
import { useOfficialPotmMap, getOfficialPlayerId } from '@/hooks/useFirebasePotm';
import type { BestPlayer, PotmEntry, PotmHistoryEntry } from '@/types/bestPlayer';

function extractBestPlayer(
  officialPlayerId: number | null,
  response: any[]
): BestPlayer | null {
  let fallback: BestPlayer | null = null;
  let bestRating = 0;

  for (const teamData of response) {
    for (const p of teamData.players ?? []) {
      const games = p.statistics?.[0]?.games;
      const rating = parseFloat(games?.rating ?? '0');
      const minutes = games?.minutes ?? 0;
      const playerId: number = p.player.id;
      const name: string = p.player.name ?? '';

      // Official: match by player ID (set by admin via Firestore)
      if (officialPlayerId && playerId === officialPlayerId) {
        return {
          playerId,
          name,
          photo: p.player.photo ?? '',
          teamId: teamData.team.id,
          teamName: teamData.team.name ?? '',
          teamLogo: teamData.team.logo ?? '',
          rating,
          isOfficial: true,
        };
      }

      // Fallback: highest-rated player with at least 45 minutes played
      if (rating > bestRating && minutes >= 45) {
        bestRating = rating;
        fallback = {
          playerId,
          name,
          photo: p.player.photo ?? '',
          teamId: teamData.team.id,
          teamName: teamData.team.name ?? '',
          teamLogo: teamData.team.logo ?? '',
          rating,
          isOfficial: false,
        };
      }
    }
  }

  if (__DEV__ && !officialPlayerId && fallback) {
    console.warn(
      `[officialPotm] No admin selection for fixture — showing fallback: "${fallback.name}" (${fallback.rating.toFixed(1)})`
    );
  }

  return fallback;
}

export function useBestPlayer(fixtureId: number, isCompleted: boolean) {
  const potmMap = useOfficialPotmMap();
  const officialPlayerId = getOfficialPlayerId(potmMap, fixtureId);

  const select = useCallback(
    (data: any[]) => extractBestPlayer(officialPlayerId, data),
    [officialPlayerId]
  );

  return useQuery({
    queryKey: QUERY_KEYS.fixturePlayers(fixtureId),
    queryFn: () => fetchFixturePlayers(fixtureId),
    staleTime: STALE_TIMES.FIXTURE_PLAYERS,
    enabled: isCompleted && fixtureId > 0,
    select,
  });
}

export function usePotmStats(): {
  awardLeaders: PotmEntry[];
  history: PotmHistoryEntry[];
  isLoading: boolean;
} {
  const { data: fixtures } = useAllFixtures();
  const potmMap = useOfficialPotmMap();

  const completedFixtures = useMemo(
    () => (fixtures ?? []).filter((m) => ['FT', 'AET', 'PEN'].includes(m.status)),
    [fixtures]
  );

  const completedIds = useMemo(
    () => completedFixtures.map((m) => m.id),
    [completedFixtures]
  );

  const results = useQueries({
    queries: completedIds.map((id) => ({
      queryKey: QUERY_KEYS.fixturePlayers(id),
      queryFn: () => fetchFixturePlayers(id),
      staleTime: STALE_TIMES.FIXTURE_PLAYERS,
    })),
  });

  const { awardLeaders, history } = useMemo<{
    awardLeaders: PotmEntry[];
    history: PotmHistoryEntry[];
  }>(() => {
    const leaderMap = new Map<number, PotmEntry>();
    const historyList: PotmHistoryEntry[] = [];

    results.forEach((r, idx) => {
      if (!r.data) return;
      const fixture = completedFixtures[idx];
      const fixtureId = fixture.id;
      const officialPlayerId = getOfficialPlayerId(potmMap, fixtureId);
      const best = extractBestPlayer(officialPlayerId, r.data);
      if (!best) return;

      historyList.push({
        ...best,
        fixtureId,
        kickoffUtc: fixture.kickoffUtc,
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
        score: fixture.score,
        status: fixture.status,
      });

      const existing = leaderMap.get(best.playerId);
      if (existing) {
        existing.awards += 1;
      } else {
        leaderMap.set(best.playerId, { ...best, awards: 1 });
      }
    });

    // Newest match first
    historyList.sort(
      (a, b) => new Date(b.kickoffUtc).getTime() - new Date(a.kickoffUtc).getTime()
    );

    const awardLeaders = Array.from(leaderMap.values()).sort((a, b) => b.awards - a.awards);

    return { awardLeaders, history: historyList };
  }, [results, completedFixtures, potmMap]);

  const isLoading = completedIds.length > 0 && results.some((r) => r.isLoading);

  return { awardLeaders, history, isLoading };
}
