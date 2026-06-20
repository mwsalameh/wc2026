import { useMemo, useCallback } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { fetchFixturePlayers } from '@/api/fixtures';
import { useAllFixtures } from '@/hooks/useFixtures';
import { useFirestoreStats } from '@/hooks/useFirestoreStats';
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

  return fallback;
}

// Per-match hook — always fetches its own data; not affected by Firestore source
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

// Aggregated POTM stats for the Statistics tab
// In dev: uses Firestore pre-aggregated data when available, suppressing the
//   N fixture-player queries. Falls back to API if Cloud Function not deployed.
// In production: Firestore path is a compile-time no-op; API path runs as before.
export function usePotmStats(): {
  awardLeaders: PotmEntry[];
  history: PotmHistoryEntry[];
  isLoading: boolean;
} {
  const firestore = useFirestoreStats();
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

  // Disable all N queries when Firestore data is available or still loading
  const useFirestoreSource = __DEV__ && !firestore.isLoading && firestore.potmHistory !== undefined;
  const apiEnabled = !useFirestoreSource && !(__DEV__ && firestore.isLoading);

  const results = useQueries({
    queries: completedIds.map((id) => ({
      queryKey: QUERY_KEYS.fixturePlayers(id),
      queryFn: () => fetchFixturePlayers(id),
      staleTime: STALE_TIMES.FIXTURE_PLAYERS,
      enabled: apiEnabled,
    })),
  });

  const apiPotm = useMemo<{ awardLeaders: PotmEntry[]; history: PotmHistoryEntry[] }>(() => {
    if (!apiEnabled) return { awardLeaders: [], history: [] };

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

    historyList.sort(
      (a, b) => new Date(b.kickoffUtc).getTime() - new Date(a.kickoffUtc).getTime()
    );

    return {
      awardLeaders: Array.from(leaderMap.values()).sort((a, b) => b.awards - a.awards),
      history: historyList,
    };
  }, [apiEnabled, results, completedFixtures, potmMap]);

  // ── Return Firestore data (dev, Cloud Function deployed) ──
  if (__DEV__ && firestore.isLoading) return { awardLeaders: [], history: [], isLoading: true };
  if (useFirestoreSource) {
    return {
      awardLeaders: firestore.potmLeaders ?? [],
      history: firestore.potmHistory ?? [],
      isLoading: false,
    };
  }

  // ── Return API data (production, or dev with no Cloud Function) ──
  const isApiLoading = completedIds.length > 0 && results.some((r) => r.isLoading);
  return { ...apiPotm, isLoading: isApiLoading };
}
