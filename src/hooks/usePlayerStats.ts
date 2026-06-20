import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { fetchFixturePlayers } from '@/api/fixtures';
import { useAllFixtures } from '@/hooks/useFixtures';
import { useFirestoreStats } from '@/hooks/useFirestoreStats';
import { QUERY_KEYS, STALE_TIMES } from '@/config/queryClient';
import type { Match } from '@/types/match';
import type { PlayerStat, TeamStat } from '@/types/playerStats';

// ─── Raw fixture-player queries ───────────────────────────────────────────────
// enabled=false disables all N queries at once when Firestore stats are active,
// preventing the per-minute rate-limit burst on the Statistics tab.

function useFixturePlayerResults(enabled = true) {
  const { data: fixtures } = useAllFixtures();

  const completedFixtures = useMemo(
    () => (fixtures ?? []).filter((m) => ['FT', 'AET', 'PEN'].includes(m.status)),
    [fixtures],
  );

  const results = useQueries({
    queries: completedFixtures.map((f) => ({
      queryKey: QUERY_KEYS.fixturePlayers(f.id),
      queryFn: () => fetchFixturePlayers(f.id),
      staleTime: STALE_TIMES.FIXTURE_PLAYERS,
      enabled,
    })),
  });

  return { results, completedFixtures };
}

function buildPlayerStats(results: ReturnType<typeof useFixturePlayerResults>['results'], completedFixtures: Match[]): PlayerStat[] {
  if (completedFixtures.length === 0) return [];

  const map = new Map<number, PlayerStat>();

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (!r.data) continue;

    const fixture = completedFixtures[i];
    const matchDuration = ['AET', 'PEN'].includes(fixture?.status) ? 120 : 90;
    const substOffIds = new Set(
      (fixture?.events ?? [])
        .filter((e) => e.type === 'subst')
        .map((e) => e.playerId),
    );

    for (const teamData of r.data) {
      for (const p of teamData.players ?? []) {
        const s = p.statistics?.[0];
        if (!s) continue;

        const playerId: number = p.player.id;
        const rawMinutes: number = s.games?.minutes ?? 0;
        const isStarter: boolean = s.games?.substitute === false;
        const minutes =
          isStarter && rawMinutes > 0 && rawMinutes < matchDuration && !substOffIds.has(playerId)
            ? matchDuration
            : rawMinutes;

        const goals: number = s.goals?.total ?? 0;
        const assists: number = s.goals?.assists ?? 0;
        const yellow: number = s.cards?.yellow ?? 0;
        const red: number = s.cards?.red ?? 0;
        const shots: number = s.shots?.on ?? 0;

        const existing = map.get(playerId);
        if (existing) {
          existing.goals += goals;
          existing.assists += assists;
          existing.minutesPlayed += minutes;
          if (minutes > 0) existing.appearances += 1;
          existing.yellowCards += yellow;
          existing.redCards += red;
          existing.shotsOnTarget += shots;
        } else {
          map.set(playerId, {
            playerId,
            name: p.player.name ?? '',
            photo: p.player.photo ?? '',
            teamId: teamData.team.id,
            teamName: teamData.team.name ?? '',
            teamLogo: teamData.team.logo ?? '',
            goals,
            assists,
            minutesPlayed: minutes,
            appearances: minutes > 0 ? 1 : 0,
            shotsOnTarget: shots,
            yellowCards: yellow,
            redCards: red,
          });
        }
      }
    }
  }

  return Array.from(map.values());
}

// ─── Shared hook ──────────────────────────────────────────────────────────────
// In dev builds: uses Firestore pre-aggregated stats when available, disabling
// all N fixture-player API queries. Falls back to API if Firestore doc doesn't
// exist (Cloud Function not deployed yet).
// In production builds: Firestore path is a compile-time no-op; API path runs
// exactly as before, so the current App Store build is completely unaffected.

function useAllPlayerStats(): { data: PlayerStat[] | undefined; isLoading: boolean } {
  const firestore = useFirestoreStats();

  // Disable the N fixture-player queries whenever Firestore data is (or will
  // be) the active source. This is the key API-reduction: 0 requests instead
  // of N when the Cloud Function has already computed everything.
  const useFirestoreSource = __DEV__ && !firestore.isLoading && firestore.players !== undefined;
  const apiEnabled = !useFirestoreSource && !(__DEV__ && firestore.isLoading);

  const { results, completedFixtures } = useFixturePlayerResults(apiEnabled);

  const apiData = useMemo(
    () => (apiEnabled ? buildPlayerStats(results, completedFixtures) : []),
    [apiEnabled, results, completedFixtures],
  );

  // ── Return Firestore data (dev, Cloud Function deployed) ──
  if (__DEV__ && firestore.isLoading) return { data: undefined, isLoading: true };
  if (useFirestoreSource) return { data: firestore.players, isLoading: false };

  // ── Return API data (production, or dev with no Cloud Function) ──
  const isApiLoading = completedFixtures.length > 0 && results.some((r) => r.isLoading);
  const resolvedData = !isApiLoading || apiData.length > 0 ? apiData : undefined;
  return { data: resolvedData, isLoading: isApiLoading };
}

// ─── Public stat hooks ────────────────────────────────────────────────────────
// All four return the same complete player list; components sort/filter as needed.

export const useTopScorers = () => useAllPlayerStats();
export const useTopAssists = () => useAllPlayerStats();
export const useTopYellowCards = () => useAllPlayerStats();
export const useTopRedCards = () => useAllPlayerStats();

// ─── Team stats ───────────────────────────────────────────────────────────────
// Team stats are derived purely from the fixtures list (no extra API calls), so
// the only saving from the Firestore path here is consistency: all stats come
// from the same aggregated document rather than being re-computed per device.

export function useTeamStats(): { teams: TeamStat[]; isLoading: boolean } {
  const firestore = useFirestoreStats();
  const { data: fixtures, isLoading: fixturesLoading } = useAllFixtures();

  const apiTeams = useMemo(() => {
    if (!fixtures) return [];
    const teamMap = new Map<number, TeamStat>();
    const completed = fixtures.filter(
      (m) => ['FT', 'AET', 'PEN'].includes(m.status) && m.score.home !== null && m.score.away !== null,
    );
    for (const match of completed) {
      const hg = match.score.home!;
      const ag = match.score.away!;

      const ensureTeam = (id: number, name: string, logo: string) => {
        if (!teamMap.has(id)) {
          teamMap.set(id, {
            teamId: id, teamName: name, teamLogo: logo,
            goalsFor: 0, goalsAgainst: 0, goalDifference: 0, cleanSheets: 0, played: 0,
          });
        }
        return teamMap.get(id)!;
      };

      const home = ensureTeam(match.homeTeam.id, match.homeTeam.name, match.homeTeam.logoUrl);
      home.goalsFor += hg; home.goalsAgainst += ag; home.played += 1;
      if (ag === 0) home.cleanSheets += 1;

      const away = ensureTeam(match.awayTeam.id, match.awayTeam.name, match.awayTeam.logoUrl);
      away.goalsFor += ag; away.goalsAgainst += hg; away.played += 1;
      if (hg === 0) away.cleanSheets += 1;
    }
    return Array.from(teamMap.values()).map((t) => ({
      ...t, goalDifference: t.goalsFor - t.goalsAgainst,
    }));
  }, [fixtures]);

  if (__DEV__ && firestore.isLoading) return { teams: [], isLoading: true };
  if (__DEV__ && firestore.teamStats !== undefined) return { teams: firestore.teamStats, isLoading: false };

  return { teams: apiTeams, isLoading: fixturesLoading };
}
