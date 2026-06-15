import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { fetchFixturePlayers } from '@/api/fixtures';
import { useAllFixtures } from '@/hooks/useFixtures';
import { QUERY_KEYS, STALE_TIMES } from '@/config/queryClient';
import type { Match } from '@/types/match';
import type { PlayerStat, TeamStat } from '@/types/playerStats';

// ─── fixture/player aggregation ─────────────────────────────────────────────

// Returns raw useQueries results for every completed match.
// All four stat hooks call this, but TanStack Query deduplicates the actual
// network requests — /fixtures/players is fetched once per match and shared.
function useFixturePlayerResults() {
  const { data: fixtures } = useAllFixtures();

  const completedFixtures = useMemo(
    () => (fixtures ?? []).filter((m) => ['FT', 'AET', 'PEN'].includes(m.status)),
    [fixtures]
  );

  const results = useQueries({
    queries: completedFixtures.map((f) => ({
      queryKey: QUERY_KEYS.fixturePlayers(f.id),
      queryFn: () => fetchFixturePlayers(f.id),
      staleTime: STALE_TIMES.FIXTURE_PLAYERS,
    })),
  });

  return { results, completedFixtures };
}

// Aggregate per-match player statistics into cross-tournament totals.
// Every player who appeared in any completed match is included — no API cutoff.
function buildPlayerStats(results: any[], completedFixtures: Match[]): PlayerStat[] {
  if (completedFixtures.length === 0) return [];

  const map = new Map<number, PlayerStat>();

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (!r.data) continue;

    const fixture = completedFixtures[i];
    // AET/PEN matches run to 120 minutes; group stage and regular KO to 90
    const matchDuration = ['AET', 'PEN'].includes(fixture?.status) ? 120 : 90;
    // Players who were substituted off — the API correctly reports their sub minute,
    // so we don't override it. For non-subbed starters, the API sometimes
    // underreports (e.g. 84 instead of 90) and we normalise to matchDuration.
    const substOffIds = new Set(
      (fixture?.events ?? [])
        .filter((e) => e.type === 'subst')
        .map((e) => e.playerId)
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

// Shared hook — all four public stat hooks delegate here.
// Returns undefined while the initial load is in progress (shows skeleton),
// then the full aggregated list once any data arrives.
function useAllPlayerStats(): { data: PlayerStat[] | undefined; isLoading: boolean } {
  const { results, completedFixtures } = useFixturePlayerResults();

  const data = useMemo(
    () => buildPlayerStats(results, completedFixtures),
    [results, completedFixtures]
  );

  const isLoading = completedFixtures.length > 0 && results.some((r) => r.isLoading);

  // Stay undefined while loading with no data yet → components show skeleton.
  // Once we have partial data or loading finishes, hand back the array.
  const resolvedData = !isLoading || data.length > 0 ? data : undefined;

  return { data: resolvedData, isLoading };
}

// ─── public stat hooks ───────────────────────────────────────────────────────
// All return the same complete player list; components sort/filter as needed.

export const useTopScorers = () => useAllPlayerStats();
export const useTopAssists = () => useAllPlayerStats();
export const useTopYellowCards = () => useAllPlayerStats();
export const useTopRedCards = () => useAllPlayerStats();

// ─── team stats (already fixture-derived, unchanged) ─────────────────────────

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
